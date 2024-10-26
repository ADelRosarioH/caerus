import SuperTokensReact from "supertokens-auth-react";
import SessionReact from "supertokens-auth-react/recipe/session";
import { SuperTokensConfig } from "supertokens-auth-react/lib/build/types";

import { appInfo } from "./appInfo";

const routerInfo: {
  navigate?: ReturnType<typeof useNavigate>;
  pathname?: string;
} = {};

export function setRouter(
  navigate: ReturnType<typeof useNavigate>,
  pathname: string
) {
  routerInfo.navigate = navigate;
  routerInfo.pathname = pathname;
}

let initialized = false;

const superTokensInit = () => {
  if (initialized) {
    return;
  }

  console.log("Initializing SuperTokens");

  const config: SuperTokensConfig = {
    appInfo,
    recipeList: [SessionReact.init()],
    enableDebugLogs: true,
    defaultToSignUp: true,
    windowHandler: (original) => ({
      ...original,
      location: {
        ...original.location,
        getPathName: () => routerInfo.pathname!,
        assign: (url) => routerInfo.navigate!(url),
        setHref: (url) => routerInfo.navigate!(url),
      },
    }),
  };

  SuperTokensReact.init(config);

  initialized = true;
};

export const auth = {
  init: superTokensInit,
};
