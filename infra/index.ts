import * as pulumi from "@pulumi/pulumi";
import * as dotenv from "dotenv";
import * as path from "path";
import { getConfig } from "./environments/config";
import { createNetworking } from "./networking";
import { createDatabase } from "./database";
import { createSearch } from "./search";

const pulumiConfig = new pulumi.Config();
const env = pulumiConfig.require("env");

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, `../config/${env}.env`) });

const config = getConfig(env);

// Create VPC and subnets
const { vpc, publicSubnets, privateSubnets } = createNetworking(env);

// Create database resources
const { db } = createDatabase(env, vpc, privateSubnets);

// Create search resources (e.g., Typesense on EC2)
const { typesenseInstance } = createSearch(env, vpc, publicSubnets);

// Export necessary values
export const typesenseEndpoint = typesenseInstance.publicDns;
