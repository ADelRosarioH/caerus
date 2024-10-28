import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { database, environment, name } from "../config";
import { vpcId, privateSubnetIds } from "../networking/vpc";
import { ecsSg } from "../networking/security-groups";

// Create a security group for the database
export const dbSecurityGroup = new aws.ec2.SecurityGroup(`${name}-db-sg`, {
  vpcId: vpcId,
  ingress: [
    {
      protocol: "tcp",
      fromPort: 5432,
      toPort: 5432,
      cidrBlocks: ["0.0.0.0/0"],
      securityGroups: [ecsSg.id],
    },
  ],
  egress: [
    { protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] },
  ],
});

// Create an Aurora Serverless v2 cluster
const dbCluster = new aws.rds.Cluster(`${name}-db-clstr`, {
  engine: "aurora-postgresql",
  engineMode: "provisioned",
  engineVersion: "16", // Use the latest compatible version
  databaseName: database.name,
  masterUsername: database.username,
  masterPassword: database.password,
  dbSubnetGroupName: new aws.rds.SubnetGroup(`${name}-db-subnt-gp`, {
    subnetIds: privateSubnetIds,
  }).name,
  vpcSecurityGroupIds: [dbSecurityGroup.id],
  skipFinalSnapshot: environment === "dev", // For development; set to false for production
  serverlessv2ScalingConfiguration: {
    minCapacity: 0.5,
    maxCapacity: 2, // Increased max capacity for shared usage
  },
  deletionProtection: true,
});

// Create an Aurora Serverless v2 instance
export const dbInstance = new aws.rds.ClusterInstance(`${name}-db-inst`, {
  clusterIdentifier: dbCluster.id,
  instanceClass: "db.serverless",
  engine: "aurora-postgresql",
  engineVersion: dbCluster.engineVersion,
});

// Export database information
const dbEndpoint = dbCluster.endpoint;
const dbPort = 5432;
const dbConnectionString = pulumi.interpolate`jdbc:postgresql://${dbEndpoint}:${dbPort}/${database.name}`;

export const db = {
  endpoint: dbEndpoint,
  port: dbPort,
  name: database.name,
  username: database.username,
  jdbcUrl: dbConnectionString,
};
