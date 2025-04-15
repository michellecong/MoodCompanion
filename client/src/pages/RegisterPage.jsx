<<<<<<< HEAD
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
=======
import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import "./RegisterPage.css";

const RegisterPage = () => {
  const { loginWithRedirect } = useAuth0();

  const handleRegister = () => {
    loginWithRedirect({
      screen_hint: "signup"
    });
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      <p>Create a new account using Auth0</p>
      <button onClick={handleRegister} className="auth0-register-button">
        Sign Up with Auth0
      </button>
    </div>
  );
};

export default RegisterPage;
>>>>>>> 5f4ae191b526ab0293cc073bcc2208273020cbd7
