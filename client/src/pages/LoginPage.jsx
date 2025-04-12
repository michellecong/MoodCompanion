// LoginPage.jsx
import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";

function LoginPage() {
  const { loginWithRedirect } = useAuth0();

  useEffect(() => {
    loginWithRedirect();
  }, [loginWithRedirect]);

  return <p>Redirecting to login...</p>;
}

export default LoginPage;
