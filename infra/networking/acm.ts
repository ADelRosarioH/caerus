import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { domainName, name } from "../config";
import { zoneId } from "./route53";

// Create an ACM certificate
const certificate = new aws.acm.Certificate(
  `${name}-cert`,
  {
    domainName: domainName, //TODO: Replace with config variable
    validationMethod: "DNS",
    subjectAlternativeNames: [`*.${domainName}`],
  },
  {
    protect: true,
  },
);

// Create validation records for each validation option
const validationRecords = certificate.domainValidationOptions.apply((opts) => {
  if (!opts || opts.length === 0) {
    return [];
  }

  const set = new Set<string>();
  const records = [];

  // Create a record for each validation option
  for (const opt of opts) {
    if (set.has(opt.resourceRecordName)) {
      continue;
    } else {
      set.add(opt.resourceRecordName);
    }

    const record = new aws.route53.Record(
      `${name}-cert-rec-`,
      {
        name: opt.resourceRecordName,
        zoneId: zoneId,
        type: opt.resourceRecordType,
        records: [opt.resourceRecordValue],
        ttl: 3600,
      },
      {
        protect: true,
      },
    );

    records.push(record);
  }

  return records;
});

const fqdns = validationRecords.apply((records) => records.map((r) => r?.fqdn));

// Update the certificate validation to use all FQDNs
const certificateValidation = new aws.acm.CertificateValidation(
  `${name}-cert-vld`,
  {
    certificateArn: certificate.arn,
    validationRecordFqdns: fqdns,
  },
  {
    dependsOn: [certificate],
    protect: true,
  },
);

// Optional: Create additional DNS records if needed
// For example, if you want to create an A record pointing to your load balancer:
/*
export const dnsRecord = new aws.route53.Record(
    `${projectName}-${environment}-a-record`,
    {
        zoneId: zone.id,
        name: "milkmoney.cloud",
        type: "A",
        aliases: [{
            name: loadBalancerDns,  // Your ALB DNS name
            zoneId: loadBalancerZoneId,  // Your ALB zone ID
            evaluateTargetHealth: true,
        }],
    }
);
*/

export const certificateArn = certificate.arn;
