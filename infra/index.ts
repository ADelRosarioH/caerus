import * as pulumi from "@pulumi/pulumi";
import * as dotenv from "dotenv";
import * as path from "path";
import { getConfig } from "./environments/config";
import { createNetworking } from "./networking";
import { createCompute } from "./compute";
import { createDatabase } from "./database";
import { createOry } from "./ory";
import { createSearch } from "./search";

const pulumiConfig = new pulumi.Config();
const env = pulumiConfig.require("env");

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, `../config/${env}.env`) });

const config = getConfig(env);

// Create VPC and subnets
const { vpc, publicSubnets, privateSubnets } = createNetworking(env);

// Create compute resources (e.g., ECS cluster, tasks)
const { cluster, service, loadBalancerDns } = createCompute(
  env,
  vpc,
  publicSubnets,
);

// Create database resources
const { db } = createDatabase(env, vpc, privateSubnets);

// Create Ory resources
const {
  kratosService,
  ketoService,
  oathkeeperService,
  kratosEfsId,
  ketoEfsId,
  oathkeeperEfsId,
} = createOry(env, vpc, privateSubnets, db);

// Create search resources (e.g., Typesense on EC2)
const { typesenseInstance } = createSearch(env, vpc, publicSubnets);

// Export necessary values
export const vpcId = vpc.id;
export const dbEndpoint = db.endpoint;
export const clusterName = cluster.name;
export const applicationUrl = loadBalancerDns;
export const kratosEfsFileSystemId = kratosEfsId;
export const ketoEfsFileSystemId = ketoEfsId;
export const oathkeeperEfsFileSystemId = oathkeeperEfsId;
export const typesenseEndpoint = typesenseInstance.publicDns;

// Export the URLs of the Ory services
export const kratosUrl = kratosService.loadBalancer.dnsName;
export const ketoUrl = ketoService.loadBalancer.dnsName;
export const oathkeeperUrl = oathkeeperService.loadBalancer.dnsName;
