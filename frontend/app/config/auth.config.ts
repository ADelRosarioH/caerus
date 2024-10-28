const buildOidcConfig = () => {
  try {
    const authority = window.ENV.AUTH_AUTHORITY;
    const clientId = window.ENV.AUTH_CLIENT_ID;

    const oidcConfig = {
      authority: authority,
      client_id: clientId,
      redirect_uri: `${window.location.origin}${window.location.pathname}`,
      post_logout_redirect_uri: `${window.location.origin}`,
      onSigninCallback: () => {
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      },
    };

    return oidcConfig;
  } catch (error) {
    console.warn("Error building OIDC config", error);
    return {};
  }
};

export default buildOidcConfig();
