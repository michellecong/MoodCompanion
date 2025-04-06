import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import "./LoginPage.css";

function Login({ onLogin, onUser }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({
    identifier: "",
    password: "",
    general: "",
  });
  const navigate = useNavigate();
  const location = useLocation();

  // Get the redirect path from query parameters, if any
  const searchParams = new URLSearchParams(location.search);
  const redirectPath = searchParams.get("redirect") || "/";

  // verify each field
  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "identifier":
        if (!value) {
          error = "Username or email is required";
        } else if (
          !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) && // not a valid email
          value.length < 3 // username length check
        ) {
          error = "Please enter a valid email or a username (at least 3 characters)";
        }
        break;
      case "password":
        if (!value) {
          error = "Password is required";
        } else if (value.length < 6) {
          error = "Password must be at least 6 characters";
        }
        break;
      default:
        break;
    }
    return error;
  };

  // Handle login
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "identifier") {
      setIdentifier(value);
    } else if (name === "password") {
      setPassword(value);
    }

    // ontime validation
    const error = validateField(name, value);
    setErrors({
      ...errors,
      [name]: error,
      general: "", // clear general error on field change
    });
  };

  // submit the form
  const validateForm = () => {
    const newErrors = {
      identifier: validateField("identifier", identifier),
      password: validateField("password", password),
      general: "",
    };
    setErrors(newErrors);
    return Object.values(newErrors).every((error) => error === "");
  };

  const handleLogin = async () => {
    try {
<<<<<<< HEAD
      const response = await api.post("/login", { email, password });

      if (response.data.token) {
        // Store token
        localStorage.removeItem("token"); // Clear any existing token
=======
      const response = await api.post("/users/login", { identifier, password });

      if (response.data.token) {
        // Store the token in local storage
>>>>>>> 57b291024385039e523d8594079426e852c3eb3f
        localStorage.setItem("token", response.data.token);
        if (response.data.user) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
          onUser(response.data.user);
        }

        // Set the token in the axios instance
        onLogin(true);

        // Redirect to the specified path or default to home
        navigate(redirectPath);
      } else {
        setErrors({
          ...errors,
          general: "Invalid credentials",
        });
      }
    } catch (err) {
      console.error("Login error:", err);
      setErrors({
        ...errors,
        general: err.response?.data?.message || "Login failed",
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    handleLogin();
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Login</h2>
        {errors.general && <p className="error-text general-error">{errors.general}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="identifier">Username or Email</label>
            <input
              type="text"
              id="identifier"
              name="identifier"
              placeholder="Enter username or email"
              value={identifier}
              onChange={handleChange}
              className={errors.identifier ? "input-error" : ""}
            />
            {errors.identifier && (
              <p className="error-text">{errors.identifier}</p>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              value={password}
              onChange={handleChange}
              className={errors.password ? "input-error" : ""}
            />
            {errors.password && <p className="error-text">{errors.password}</p>}
          </div>
          <button type="submit">Sign In</button>
        </form>
        <p className="register-link">
          Don't have an account? <a href="/register">Register here</a>
        </p>
      </div>
    </div>
  );
}

export default Login;