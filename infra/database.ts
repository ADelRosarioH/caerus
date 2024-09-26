import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

export function createDatabase(
  env: string,
  vpc: aws.ec2.Vpc,
  privateSubnets: pulumi.Output<string[]>,
) {
  const dbSubnetGroup = new aws.rds.SubnetGroup(`${env}-db-subnet-group`, {
    subnetIds: privateSubnets,
    tags: {
      Name: `${env}-db-subnet-group`,
      Environment: env,
    },
  });

  const db = new aws.rds.Instance(`${env}-db`, {
    engine: "postgres",
    instanceClass: "db.t3.micro",
    allocatedStorage: 20,
    dbName: "myapp",
    username: "dbuser",
    password: "dbpassword", // In practice, use secrets management
    vpcSecurityGroupIds: [vpc.defaultSecurityGroupId],
    dbSubnetGroupName: dbSubnetGroup.name,
    skipFinalSnapshot: true,
    tags: {
      Name: `${env}-db`,
      Environment: env,
    },
  });

  return { db };
}
