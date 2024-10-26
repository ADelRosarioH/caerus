import { AuthProvider } from "~/providers/auth";

export default function Page() {
  return (
    <AuthProvider>
      <h1>Home</h1>
    </AuthProvider>
  );
}
