import * as aws from "@pulumi/aws";
import { name } from "../config";

export const cluster = new aws.ecs.Cluster(`${name}-ecs-cluster`, {});
