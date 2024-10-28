import * as awsx from "@pulumi/awsx";
import { name, environment } from "../config";

export const vpc = new awsx.ec2.Vpc(`${name}-vpc`, {
  numberOfAvailabilityZones: 2,
  enableDnsHostnames: true,
});

export const vpcId = vpc.vpcId;
export const publicSubnetIds = vpc.publicSubnetIds;
export const privateSubnetIds = vpc.privateSubnetIds;
