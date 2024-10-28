import * as pulumi from "@pulumi/pulumi";
import { frontendUrl } from "./services/frontend";
import * as keycloak from "./services/keycloak";

// Export the CloudFront URLs
export const appUrl = frontendUrl;
export const keycloakUrl = keycloak.keycloakUrl;
