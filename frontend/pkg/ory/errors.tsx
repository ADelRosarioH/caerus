import { AxiosError } from "axios";
import { Dispatch, SetStateAction } from "react";
import { toast } from "react-toastify";

type AxiosFlowError = AxiosError & {
  status: number;
  response: {
    data: {
      error: {
        id: string;
      };
      redirect_browser_to: string;
    };
  };
};

// A small function to help us deal with errors coming from fetching a flow.
export function handleGetFlowError<S>(
  flowType: "login" | "registration" | "settings" | "recovery" | "verification",
  resetFlow: Dispatch<SetStateAction<S | undefined>>,
) {
  return (err: AxiosFlowError) => {
    switch (err.response?.data.error?.id) {
      case "session_inactive":
        return "/auth/auth/login?return_to=" + window.location.href;
      case "session_aal2_required":
        if (err.response?.data.redirect_browser_to) {
          const redirectTo = new URL(err.response?.data.redirect_browser_to);
          if (flowType === "settings") {
            redirectTo.searchParams.set("return_to", window.location.href);
          }
          // 2FA is enabled and enforced, but user did not perform 2fa yet!
          window.location.href = redirectTo.toString();
          return;
        }
        return "/auth/login?aal=aal2&return_to=" + window.location.href;
      case "session_already_available":
        // User is already signed in, let's redirect them home!
        return "/";
      case "session_refresh_required":
        // We need to re-authenticate to perform this action
        window.location.href = err.response?.data.redirect_browser_to;
        return;
      case "self_service_flow_return_to_forbidden":
        // The flow expired, let's request a new one.
        toast.error("The return_to address is not allowed.");
        resetFlow(undefined);

        return "/auth/" + flowType;
      case "self_service_flow_expired":
        // The flow expired, let's request a new one.
        toast.error(
          "Your interaction expired, please fill out the form again.",
        );
        resetFlow(undefined);
        return "/auth/" + flowType;
      case "security_csrf_violation":
        // A CSRF violation occurred. Best to just refresh the flow!
        toast.error(
          "A security violation was detected, please fill out the form again.",
        );
        resetFlow(undefined);
        return "/auth/" + flowType;
      case "security_identity_mismatch":
        // The requested item was intended for someone else. Let's request a new flow...
        resetFlow(undefined);
        return "/auth/" + flowType;
      case "browser_location_change_required":
        // Ory Kratos asked us to point the user to this URL.
        window.location.href = err.response.data.redirect_browser_to;
        return;
    }

    switch (err.response?.status) {
      case 410:
        // The flow expired, let's request a new one.
        resetFlow(undefined);
        return "/auth/" + flowType;
    }

    // We are not able to handle the error? Return it.
    return err;
  };
}

// A small function to help us deal with errors coming from initializing a flow.
export const handleFlowError = handleGetFlowError;
