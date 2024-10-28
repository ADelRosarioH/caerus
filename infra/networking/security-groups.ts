import * as aws from "@pulumi/aws";
import { name } from "../config";
import { vpcId } from "./vpc";

export const ecsSg = new aws.ec2.SecurityGroup(`${name}-ecs-sg`, {
  vpcId,
  ingress: [
    { protocol: "tcp", fromPort: 80, toPort: 80, cidrBlocks: ["0.0.0.0/0"] },
    {
      protocol: "tcp",
      fromPort: 3000,
      toPort: 3001,
      cidrBlocks: ["0.0.0.0/0"],
      self: true,
    },
    {
      protocol: "tcp",
      fromPort: 8080,
      toPort: 8080,
      cidrBlocks: ["0.0.0.0/0"],
      self: true,
    },
  ],
  egress: [
    { protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] },
  ],
});
