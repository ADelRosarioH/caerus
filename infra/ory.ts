import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

export function createOry(
  env: string,
  vpc: awsx.ec2.Vpc,
  privateSubnets: pulumi.Output<string[]>,
  db: aws.rds.Instance,
) {
  const config = new pulumi.Config();

  // Create a security group for Ory services
  const orySecurityGroup = new aws.ec2.SecurityGroup(`${env}-ory-sg`, {
    vpcId: vpc.id,
    ingress: [
      {
        protocol: "tcp",
        fromPort: 4433,
        toPort: 4434,
        cidrBlocks: [vpc.vpcCidrBlock],
      }, // Kratos
      {
        protocol: "tcp",
        fromPort: 4466,
        toPort: 4467,
        cidrBlocks: [vpc.vpcCidrBlock],
      }, // Keto
      {
        protocol: "tcp",
        fromPort: 4455,
        toPort: 4456,
        cidrBlocks: [vpc.vpcCidrBlock],
      }, // Oathkeeper
    ],
    egress: [
      { protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] },
    ],
  });

  // Create EFS file systems
  const createEfsFileSystem = (name: string) => {
    const fs = new aws.efs.FileSystem(`${env}-${name}-efs`, {
      encrypted: true,
      performanceMode: "generalPurpose",
      throughputMode: "bursting",
      tags: {
        Name: `${env}-${name}-efs`,
      },
    });

    const mountTargets = privateSubnets.apply((subnets) =>
      subnets.map(
        (subnet, index) =>
          new aws.efs.MountTarget(`${env}-${name}-efs-mount-${index}`, {
            fileSystemId: fs.id,
            subnetId: subnet,
            securityGroups: [orySecurityGroup.id],
          }),
      ),
    );

    return { fs, mountTargets };
  };

  const kratosEfs = createEfsFileSystem("kratos");
  const ketoEfs = createEfsFileSystem("keto");
  const oathkeeperEfs = createEfsFileSystem("oathkeeper");

  // Create ECS task definitions
  const kratosTask = new awsx.ecs.FargateTaskDefinition(`${env}-kratos-task`, {
    container: {
      image: "oryd/kratos:v0.10.1",
      cpu: 256,
      memory: 512,
      portMappings: [{ containerPort: 4433 }, { containerPort: 4434 }],
      environment: [
        {
          name: "DSN",
          value: pulumi.interpolate`postgres://${db.username}:${db.password}@${db.endpoint}/${db.dbName}?sslmode=disable`,
        },
      ],
      mountPoints: [
        {
          sourceVolume: "kratos-config",
          containerPath: "/etc/config/kratos",
          readOnly: true,
        },
      ],
    },
    volumes: [
      {
        name: "kratos-config",
        efsVolumeConfiguration: {
          fileSystemId: kratosEfs.fs.id,
          rootDirectory: "/",
        },
      },
    ],
  });

  const ketoTask = new awsx.ecs.FargateTaskDefinition(`${env}-keto-task`, {
    container: {
      image: "oryd/keto:v0.9.0-alpha.0",
      cpu: 256,
      memory: 512,
      portMappings: [{ containerPort: 4466 }, { containerPort: 4467 }],
      environment: [
        {
          name: "DSN",
          value: pulumi.interpolate`postgres://${db.username}:${db.password}@${db.endpoint}/${db.dbName}?sslmode=disable`,
        },
      ],
      mountPoints: [
        {
          sourceVolume: "keto-config",
          containerPath: "/etc/config/keto",
          readOnly: true,
        },
      ],
    },
    volumes: [
      {
        name: "keto-config",
        efsVolumeConfiguration: {
          fileSystemId: ketoEfs.fs.id,
          rootDirectory: "/",
        },
      },
    ],
  });

  const oathkeeperTask = new awsx.ecs.FargateTaskDefinition(
    `${env}-oathkeeper-task`,
    {
      container: {
        image: "oryd/oathkeeper:v0.40.6",
        cpu: 256,
        memory: 512,
        portMappings: [{ containerPort: 4455 }, { containerPort: 4456 }],
        mountPoints: [
          {
            sourceVolume: "oathkeeper-config",
            containerPath: "/etc/config/oathkeeper",
            readOnly: true,
          },
        ],
      },
      volumes: [
        {
          name: "oathkeeper-config",
          efsVolumeConfiguration: {
            fileSystemId: oathkeeperEfs.fs.id,
            rootDirectory: "/",
          },
        },
      ],
    },
  );

  // Create ECS services
  const kratosService = new awsx.ecs.FargateService(`${env}-kratos-service`, {
    cluster: config.require("ecsClusterArn"),
    taskDefinition: kratosTask,
    desiredCount: 1,
    subnets: privateSubnets,
    securityGroups: [orySecurityGroup.id],
  });

  const ketoService = new awsx.ecs.FargateService(`${env}-keto-service`, {
    cluster: config.require("ecsClusterArn"),
    taskDefinition: ketoTask,
    desiredCount: 1,
    subnets: privateSubnets,
    securityGroups: [orySecurityGroup.id],
  });

  const oathkeeperService = new awsx.ecs.FargateService(
    `${env}-oathkeeper-service`,
    {
      cluster: config.require("ecsClusterArn"),
      taskDefinition: oathkeeperTask,
      desiredCount: 1,
      subnets: privateSubnets,
      securityGroups: [orySecurityGroup.id],
    },
  );

  return {
    kratosService,
    ketoService,
    oathkeeperService,
    kratosEfsId: kratosEfs.fs.id,
    ketoEfsId: ketoEfs.fs.id,
    oathkeeperEfsId: oathkeeperEfs.fs.id,
  };
}
