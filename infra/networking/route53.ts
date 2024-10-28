import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { name, domainName, environment } from "../config";

// Create the Route 53 zone
export const zone = new aws.route53.Zone(
  `${name}}-zone`,
  {
    name: domainName,
    comment: `Domain zone for ${name} - ${environment}`,
  },
  {
    protect: true,
  },
);

export const zoneId = zone.id;
