import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import { domainName, name } from "../config";
import { vpcId, publicSubnetIds } from "../networking/vpc";
import { ecsSg } from "../networking/security-groups";
import { logGroup } from "../monitoring/cloudwatch";
import { namespace } from "../service-discovery/cloudmap";
import { cluster } from "./shared";
import { keycloakService } from "./keycloak";
import { backendService } from "./backend";
import { zoneId } from "../networking/route53";
import { certificateArn } from "../networking/acm";

// Create ECR repository
const repo = new awsx.ecr.Repository(`${name}-ft-repo`);

// Build and push Docker image
const image = new awsx.ecr.Image(`${name}-ft-image`, {
  repositoryUrl: repo.url,
  context: "../frontend",
  platform: "linux/amd64",
});

const albSg = new aws.ec2.SecurityGroup(`${name}-ft-alb-sg`, {
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

// Create ALB
const loadBalancer = new awsx.lb.ApplicationLoadBalancer(`${name}-ft-alb`, {
  subnetIds: publicSubnetIds,
  defaultTargetGroup: {
    vpcId: vpcId,
    port: 80,
    protocol: "HTTP",
    targetType: "ip",
    healthCheck: {
      path: "/health",
      interval: 30,
      timeout: 15,
      healthyThreshold: 2,
      unhealthyThreshold: 2,
    },
  },
  securityGroups: [albSg.id],
});

const httpsListener = new aws.lb.Listener(`${name}-ft-https-lstnr`, {
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
export const frontendService = new awsx.ecs.FargateService(
  `${name}-ft-service`,
  {
    cluster: cluster.arn,
    forceNewDeployment: true,
    taskDefinitionArgs: {
      container: {
        name: "frontend",
        image: image.imageUri,
        cpu: 128,
        memory: 256,
        portMappings: [
          {
            name: "frontend_port",
            containerPort: 80,
            targetGroup: loadBalancer.defaultTargetGroup,
          },
        ],
        logConfiguration: {
          logDriver: "awslogs",
          options: {
            "awslogs-group": logGroup.name,
            "awslogs-region": aws.config.region,
            "awslogs-stream-prefix": "frontend",
          },
        },
      },
    },
    networkConfiguration: {
      assignPublicIp: true,
      subnets: publicSubnetIds,
      securityGroups: [albSg.id, ecsSg.id],
    },
    serviceConnectConfiguration: {
      enabled: true,
      namespace: namespace.arn,
      services: [
        {
          portName: "frontend_port",
          discoveryName: "frontend",
          clientAlias: [
            {
              dnsName: "frontend",
              port: 80,
            },
          ],
        },
      ],
    },
    desiredCount: 1,
  },
  {
    dependsOn: [keycloakService, backendService],
  },
);

new aws.route53.Record(`${name}-ft-a-rec`, {
  zoneId: zoneId,
  name: `app.${domainName}`,
  type: "A",
  aliases: [
    {
      name: loadBalancer.loadBalancer.dnsName, // Your ALB DNS name
      zoneId: loadBalancer.loadBalancer.zoneId, // Your ALB zone ID
      evaluateTargetHealth: true,
    },
  ],
});

export const frontendUrl = pulumi.interpolate`https://app.${domainName}`;
