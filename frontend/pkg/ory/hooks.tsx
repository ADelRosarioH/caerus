import { AxiosError } from "axios";
import { useState, useEffect, DependencyList } from "react";

import ory from "./sdk";

// Returns a function which will log the user out
// export function useLogoutLink(router, deps?: DependencyList) {
//   const [logoutToken, setLogoutToken] = useState<string>("");

//   useEffect(() => {
//     ory
//       .createBrowserLogoutFlow()
//       .then(({ data }) => {
//         setLogoutToken(data.logout_token);
//       })
//       .catch((err: AxiosError) => {
//         switch (err.response?.status) {
//           case 401:
//             // do nothing, the user is not logged in
//             return;
//         }

//         // Something else happened!
//         return Promise.reject(err);
//       });
//   }, deps);

//   return () => {
//     if (logoutToken) {
//       ory
//         .updateLogoutFlow({ token: logoutToken })
//         .then(() => router.push("/auth/login"))
//         .then(() => router.reload());
//     }
//   };
// }
