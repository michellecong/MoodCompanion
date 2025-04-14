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