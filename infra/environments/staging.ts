import { EnvironmentConfig } from "./types";

export const stagingConfig: EnvironmentConfig = {
  env: "staging",
  vpc: {
    cidr: "10.1.0.0/16",
    maxAzs: 2,
  },
  ecs: {
    clusterName: "staging-cluster",
    serviceDesiredCount: 2,
    taskCpu: 512,
    taskMemory: 1024,
  },
  rds: {
    instanceClass: "db.t3.small",
    allocatedStorage: 50,
    multiAz: true,
  },
  typesense: {
    instanceType: "t3.small",
  },
};
