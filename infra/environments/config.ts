import { EnvironmentConfig } from "./types";
import { devConfig } from "./dev";
import { stagingConfig } from "./staging";
import { prodConfig } from "./prod";

export function getConfig(env: string): EnvironmentConfig {
  switch (env) {
    case "dev":
      return devConfig;
    case "staging":
      return stagingConfig;
    case "prod":
      return prodConfig;
    default:
      throw new Error(`Unsupported environment: ${env}`);
  }
}
