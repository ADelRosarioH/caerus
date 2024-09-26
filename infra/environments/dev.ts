import { EnvironmentConfig } from "./types";

export const devConfig: EnvironmentConfig = {
  env: "dev",
  vpc: {
    cidr: "10.0.0.0/16",
    maxAzs: 2,
  },
  ecs: {
    clusterName: "dev-cluster",
    serviceDesiredCount: 1,
    taskCpu: 256,
    taskMemory: 512,
  },
  rds: {
    instanceClass: "db.t3.micro",
    allocatedStorage: 20,
    multiAz: false,
  },
  ory: {
    kratos: {
      replicas: 1,
      resources: {
        cpu: 256,
        memory: 512,
      },
    },
    keto: {
      replicas: 1,
      resources: {
        cpu: 256,
        memory: 512,
      },
    },
    oathkeeper: {
      replicas: 1,
      resources: {
        cpu: 256,
        memory: 512,
      },
    },
  },
  typesense: {
    instanceType: "t3.micro",
  },
};
