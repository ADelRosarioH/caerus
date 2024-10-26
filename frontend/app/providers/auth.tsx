import { useLocation, useNavigate } from "@remix-run/react";
import React, { useEffect } from "react";
import { SuperTokensWrapper } from "supertokens-auth-react";
import { auth, setRouter } from "~/config/auth";

if (typeof window !== "undefined") {
  // we only want to call this init function on the frontend, so we check typeof window !== 'undefined'
  auth.init();
}

export const AuthProvider: React.FC<
  React.PropsWithChildren<Record<string, unknown>>
> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setRouter(navigate, location.pathname);
  }, [navigate, location]);

  return <SuperTokensWrapper>{children}</SuperTokensWrapper>;
};
