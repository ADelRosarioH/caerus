import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();

export const name = config.name;
export const domainName = config.require("domainName");
export const environment = config.require("env");
const databaseConfig = config.requireSecretObject<{
  name: string;
  username: string;
  password: string;
}>("database");

const databasePassword = databaseConfig.apply((cfg) => cfg.password);

export const database = {
  name: databaseConfig.name,
  username: databaseConfig.username,
  password: databasePassword,
};
