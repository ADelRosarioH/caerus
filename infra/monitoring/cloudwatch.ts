import * as aws from "@pulumi/aws";
import { name } from "../config";

export const logGroup = new aws.cloudwatch.LogGroup(`${name}-lg`, {
  retentionInDays: 30,
});
