import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

export interface EnvironmentConfig {
  env: string;
  vpc: {
    cidr: string;
    maxAzs: number;
  };
  ecs: {
    clusterName: string;
    serviceDesiredCount: number;
    taskCpu: number;
    taskMemory: number;
  };
  rds: {
    instanceClass: aws.rds.InstanceType;
    allocatedStorage: number;
    multiAz: boolean;
  };
  typesense: {
    instanceType: aws.ec2.InstanceType;
  };
}
