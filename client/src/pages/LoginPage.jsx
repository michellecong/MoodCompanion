import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import api from "../api/axios";
import "./LoginPage.css";

function Login({ onLogin, onUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithRedirect, isAuthenticated, user, getAccessTokenSilently } = useAuth0();

  // acquire the redirect path from the URL
  const searchParams = new URLSearchParams(location.search);
  const redirectPath = searchParams.get("redirect") || "/";

  // listen for authentication changes
  useEffect(() => {
    const handleAuth0Login = async () => {
      if (isAuthenticated && user) {
        try {
          // get the access token
          const accessToken = await getAccessTokenSilently();
          
          // send the user data and token to the backend
          const response = await api.post("/users/auth0-callback", { 
            user,
            token: accessToken 
          });
          
          if (response.data.token) {
            // save the token and user data in local storage
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.user));
            onUser(response.data.user);
            onLogin(true);
            
            // redirect to the original page
            navigate(redirectPath);
          }
        } catch (error) {
          console.error("Error during Auth0 login:", error);
        }
      }
    };
    
    handleAuth0Login();
  }, [isAuthenticated, user, getAccessTokenSilently]);

  // handle login button click
  const handleLogin = () => {
    loginWithRedirect();
  };
  
  // handle register link click
  const handleRegister = (e) => {
    e.preventDefault();
    loginWithRedirect({
      authorizationParams: {
        prompt: "login",
        screen_hint: "signup"
      }
    });
  };
  
  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Login</h2>
        <button onClick={handleLogin} className="auth0-login-button">
          Log In with Auth0
        </button>
        <p className="register-link">
          Don't have an account? <a href="#" onClick={handleRegister}>Register here</a>
        </p>
      </div>
    </div>
  );
}

export default Login;