import * as awsx from "@pulumi/awsx";

export function createNetworking(env: string) {
  const vpc = new awsx.ec2.Vpc(`${env}-vpc`, {
    numberOfAvailabilityZones: 2,
    numberOfNatGateways: 1,
    tags: {
      Name: `${env}-vpc`,
      Environment: env,
    },
  });

  return {
    vpc: vpc,
    publicSubnets: vpc.publicSubnetIds,
    privateSubnets: vpc.privateSubnetIds,
  };
}
