import { EnvironmentConfig } from "./types";

export const prodConfig: EnvironmentConfig = {
  env: "prod",
  vpc: {
    cidr: "10.2.0.0/16",
    maxAzs: 3,
  },
  ecs: {
    clusterName: "prod-cluster",
    serviceDesiredCount: 3,
    taskCpu: 1024,
    taskMemory: 2048,
  },
  rds: {
    instanceClass: "db.t3.medium",
    allocatedStorage: 100,
    multiAz: true,
  },
  ory: {
    kratos: {
      replicas: 3,
      resources: {
        cpu: 1024,
        memory: 2048,
      },
    },
    keto: {
      replicas: 3,
      resources: {
        cpu: 1024,
        memory: 2048,
      },
    },
    oathkeeper: {
      replicas: 3,
      resources: {
        cpu: 1024,
        memory: 2048,
      },
    },
  },
  typesense: {
    instanceType: "t3.medium",
  },
};
