import * as awsx from "@pulumi/awsx";
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

export function createCompute(
  env: string,
  vpc: awsx.ec2.Vpc,
  publicSubnets: pulumi.Output<string[]>,
) {
  const cluster = new aws.ecs.Cluster(`${env}-cluster`, {
    tags: {
      Name: `${env}-cluster`,
      Environment: env,
    },
  });

  const lb = new awsx.lb.ApplicationLoadBalancer(`${env}-lb`, {
    vpc,
    external: true,
    subnets: publicSubnets,
  });

  const service = new awsx.ecs.FargateService(`${env}-service`, {
    cluster: cluster.arn,
    taskDefinitionArgs: {
      container: {
        image: `${env}-ecr-repo:latest`,
        cpu: 512,
        memory: 1024,
        essential: true,
        portMappings: [
          {
            containerPort: 8080,
            targetGroup: lb.defaultTargetGroup,
          },
        ],
      },
    },
    desiredCount: 2,
    subnets: vpc.privateSubnetIds,
  });

  return {
    cluster,
    service,
    loadBalancerDns: lb.loadBalancer.dnsName,
  };
}
