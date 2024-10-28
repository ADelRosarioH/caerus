import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import { domainName, name, database } from "../config";
import { vpcId, publicSubnetIds, privateSubnetIds } from "../networking/vpc";
import { ecsSg } from "../networking/security-groups";
import { logGroup } from "../monitoring/cloudwatch";
import { namespace } from "../service-discovery/cloudmap";
import { cluster } from "./shared";
import { certificateArn } from "../networking/acm";
import { zoneId } from "../networking/route53";
import { db, dbInstance } from "./database";

// Create ECR repository
const repo = new awsx.ecr.Repository(`${name}-kc-repo`);

// Build and push Docker image
const image = new awsx.ecr.Image(`${name}-kc-image`, {
  repositoryUrl: repo.url,
  context: "../keycloak",
  platform: "linux/amd64",
});

const albSg = new aws.ec2.SecurityGroup(`${name}-kc-alb-sg`, {
  vpcId,
  ingress: [
    { protocol: "tcp", fromPort: 80, toPort: 80, cidrBlocks: ["0.0.0.0/0"] },
    {
      protocol: "tcp",
      fromPort: 443,
      toPort: 443,
      cidrBlocks: ["0.0.0.0/0"],
    },
  ],
  egress: [
    { protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] },
  ],
});

// Create ALB for Keycloak
const loadBalancer = new awsx.lb.ApplicationLoadBalancer(`${name}-kc-alb`, {
  subnetIds: publicSubnetIds,
  defaultTargetGroup: {
    vpcId: vpcId,
    port: 8080,
    protocol: "HTTP",
    targetType: "ip",
    healthCheck: {
      path: "/auth/realms/master",
      interval: 30,
      timeout: 15,
      healthyThreshold: 2,
      unhealthyThreshold: 2,
    },
  },
  securityGroups: [albSg.id],
});

// Create a new listener for the new target group
const httpsListener = new aws.lb.Listener(`${name}-kc-https-lstnr`, {
  loadBalancerArn: loadBalancer.loadBalancer.arn,
  port: 443, // This is the port the ALB will listen on for the new service
  protocol: "HTTPS",
  defaultActions: [
    {
      type: "forward",
      targetGroupArn: loadBalancer.defaultTargetGroup.arn,
    },
  ],
  certificateArn: certificateArn,
});

// Create Fargate Service
export const keycloakService = new awsx.ecs.FargateService(
  `${name}-kc-service`,
  {
    cluster: cluster.arn,
    forceNewDeployment: true,
    taskDefinitionArgs: {
      container: {
        name: "keycloak",
        image: image.imageUri,
        cpu: 512,
        memory: 2048,
        portMappings: [
          {
            name: "keycloak_http_port",
            containerPort: 8080,
            hostPort: 8080,
            targetGroup: loadBalancer.defaultTargetGroup,
          },
        ],
        healthCheck: {
          command: [
            "CMD-SHELL",
            "curl -f https://localhost:9000/health/ready || exit 1",
          ],
          interval: 30,
          timeout: 5,
          retries: 3,
          startPeriod: 60,
        },
        environment: [
          // {
          //   name: "JAVA_OPTS_KC_HEAP",
          //   value: "-XX:MaxHeapFreeRatio=30 -XX:MaxRAMPercentage=70",
          // },
          // { name: "KC_HTTP_RELATIVE_PATH", value: "/auth" },
          { name: "KC_HOSTNAME_STRICT", value: "false" },
          { name: "KC_HTTP_ENABLED", value: "true" },
          { name: "KC_BOOTSTRAP_ADMIN_USERNAME", value: "admin" },
          { name: "KC_BOOTSTRAP_ADMIN_PASSWORD", value: "admin" },
          { name: "KC_DB", value: "postgres" },
          // Add any other necessary environment variables here
          { name: "KC_DB_URL", value: db.jdbcUrl },
          { name: "KC_DB_USERNAME", value: db.username },
          { name: "KC_DB_PASSWORD", value: database.password },
        ],
        logConfiguration: {
          logDriver: "awslogs",
          options: {
            "awslogs-group": logGroup.name,
            "awslogs-region": aws.config.region,
            "awslogs-stream-prefix": "kc",
          },
        },
      },
    },
    networkConfiguration: {
      assignPublicIp: false,
      subnets: privateSubnetIds,
      securityGroups: [albSg.id, ecsSg.id],
    },
    serviceConnectConfiguration: {
      enabled: true,
      namespace: namespace.arn,
      services: [
        {
          portName: "keycloak_http_port",
          discoveryName: "keycloak",
          clientAlias: [
            {
              dnsName: "keycloak",
              port: 8080,
            },
          ],
        },
      ],
    },
    desiredCount: 1,
  },
  {
    dependsOn: [dbInstance],
  },
);

new aws.route53.Record(`${name}-kc-a-rec`, {
  zoneId: zoneId,
  name: `auth.${domainName}`,
  type: "A",
  aliases: [
    {
      name: loadBalancer.loadBalancer.dnsName, // Your ALB DNS name
      zoneId: loadBalancer.loadBalancer.zoneId, // Your ALB zone ID
      evaluateTargetHealth: true,
    },
  ],
});

export const keycloakUrl = pulumi.interpolate`https://auth.${domainName}/auth`;
