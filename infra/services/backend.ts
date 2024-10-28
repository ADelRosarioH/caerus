import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import { name } from "../config";
import { privateSubnetIds } from "../networking/vpc";
import { ecsSg } from "../networking/security-groups";
import { logGroup } from "../monitoring/cloudwatch";
import { namespace } from "../service-discovery/cloudmap";
import { cluster } from "./shared";
import { dbInstance } from "./database";

// Create ECR repository
const repo = new awsx.ecr.Repository(`${name}-backend-repo`);

// Build and push Docker image
const image = new awsx.ecr.Image(`${name}-backend-image`, {
  repositoryUrl: repo.url,
  context: "../backend",
  platform: "linux/amd64",
});

// Create Fargate Service
export const backendService = new awsx.ecs.FargateService(
  `${name}-backend-service`,
  {
    cluster: cluster.arn,
    forceNewDeployment: true,
    taskDefinitionArgs: {
      container: {
        name: "backend",
        image: image.imageUri,
        cpu: 128,
        memory: 256,
        portMappings: [{ name: "backend_port", containerPort: 3000 }],
        healthCheck: {
          command: [
            "CMD-SHELL",
            "curl -f http://localhost:3000/livez || exit 1",
          ],
          interval: 30,
          timeout: 5,
          retries: 3,
          startPeriod: 60,
        },
        logConfiguration: {
          logDriver: "awslogs",
          options: {
            "awslogs-group": logGroup.name,
            "awslogs-region": aws.config.region,
            "awslogs-stream-prefix": "backend",
          },
        },
      },
    },
    networkConfiguration: {
      assignPublicIp: false,
      subnets: privateSubnetIds,
      securityGroups: [ecsSg.id],
    },
    serviceConnectConfiguration: {
      enabled: true,
      namespace: namespace.arn,
      services: [
        {
          portName: "backend_port",
          discoveryName: "backend",
          clientAlias: [
            {
              dnsName: "backend",
              port: 3000,
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
