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
  ory: {
    kratos: {
      replicas: number;
      resources: {
        cpu: number;
        memory: number;
      };
    };
    keto: {
      replicas: number;
      resources: {
        cpu: number;
        memory: number;
      };
    };
    oathkeeper: {
      replicas: number;
      resources: {
        cpu: number;
        memory: number;
      };
    };
  };
  typesense: {
    instanceType: aws.ec2.InstanceType;
  };
}
