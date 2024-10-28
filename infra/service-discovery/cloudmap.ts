import * as aws from "@pulumi/aws";
import { name } from "../config";
import { vpcId } from "../networking/vpc";

export const namespace = new aws.servicediscovery.PrivateDnsNamespace(
  `${name}-namespace`,
  {
    vpc: vpcId,
    name: "service.local",
  },
);
