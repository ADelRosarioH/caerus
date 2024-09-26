import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

export function createSearch(
  env: string,
  vpc: aws.ec2.Vpc,
  publicSubnets: pulumi.Output<string[]>,
) {
  const typesenseSecurityGroup = new aws.ec2.SecurityGroup(
    `${env}-typesense-sg`,
    {
      vpcId: vpc.id,
      ingress: [
        {
          protocol: "tcp",
          fromPort: 22,
          toPort: 22,
          cidrBlocks: ["0.0.0.0/0"],
        },
        {
          protocol: "tcp",
          fromPort: 8108,
          toPort: 8108,
          cidrBlocks: ["0.0.0.0/0"],
        },
      ],
      egress: [
        { protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] },
      ],
      tags: {
        Name: `${env}-typesense-sg`,
        Environment: env,
      },
    },
  );

  const typesenseInstance = new aws.ec2.Instance(`${env}-typesense`, {
    instanceType: "t3.micro",
    ami: "ami-0c55b159cbfafe1f0", // Amazon Linux 2 AMI (HVM), SSD Volume Type
    vpcSecurityGroupIds: [typesenseSecurityGroup.id],
    subnetId: publicSubnets[0],
    tags: {
      Name: `${env}-typesense`,
      Environment: env,
    },
    userData: `#!/bin/bash
            yum update -y
            yum install -y docker
            systemctl start docker
            systemctl enable docker
            docker run -d -p 8108:8108 -v /data:/data typesense/typesense:latest --data-dir /data --api-key=your-api-key-here
        `,
  });

  return { typesenseInstance };
}
