// RegisterPage.jsx
import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";

function RegisterPage() {
  const { loginWithRedirect } = useAuth0();

  useEffect(() => {
    loginWithRedirect({ screen_hint: "signup" });
  }, [loginWithRedirect]);

  return <p>Redirecting to registration...</p>;
}

export default RegisterPage;
