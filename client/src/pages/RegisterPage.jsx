import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import "./RegisterPage.css";
import api from "../api/axios";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    general: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // useNavigate hook for navigation

  // verify each field
  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "username":
        if (!value) {
          error = "Username is required";
        } else if (value.length < 3) {
          error = "Username must be at least 3 characters";
        } else if (value.length > 30) {
          error = "Username must be less than 30 characters";
        }
        break;
      case "email":
        if (!value) {
          error = "Email is required";
        } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value)) {
          error = "Please enter a valid email";
        }
        break;
      case "password":
        if (!value) {
          error = "Password is required";
        } else if (value.length < 6) {
          error = "Password must be at least 6 characters";
        }
        break;
      case "confirmPassword":
        if (!value) {
          error = "Please confirm your password";
        } else if (value !== formData.password) {
          error = "Passwords do not match";
        }
        break;
      default:
        break;
    }
    return error;
  };

  // deal with input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // ontimize performance by validating only the changed field
    const error = validateField(name, value);
    setErrors({
      ...errors,
      [name]: error,
      general: "", // clear general error on input change
    });
  };

  // validate the entire form
  const validateForm = () => {
    const newErrors = {
      username: validateField("username", formData.username),
      email: validateField("email", formData.email),
      password: validateField("password", formData.password),
      confirmPassword: validateField("confirmPassword", formData.confirmPassword),
      general: "",
    };

    // check if there are any errors
    return Object.values(newErrors).every((error) => error === "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // validate the form before submission
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({ ...errors, general: "" }); // clear general error on submit

    try {
      const response = await api.post("/users/register", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      console.log("Registration successful:", response.data);
      // store the token in local storage
      navigate("/login", { state: { message: "Registration successful! Please log in." } });
    } catch (err) {
      console.error("Error during registration:", err);
      const errorMessage = err.response?.data?.message || "Registration failed";
      setErrors({
        ...errors,
        general: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit}>
        {/* form fields */}
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            placeholder="Enter your username"
            value={formData.username}
            onChange={handleChange}
            className={errors.username ? "input-error" : ""}
          />
          {errors.username && <div className="error-text">{errors.username}</div>}
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? "input-error" : ""}
          />
          {errors.email && <div className="error-text">{errors.email}</div>}
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            className={errors.password ? "input-error" : ""}
          />
          {errors.password && <div className="error-text">{errors.password}</div>}
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={errors.confirmPassword ? "input-error" : ""}
          />
          {errors.confirmPassword && (
            <div className="error-text">{errors.confirmPassword}</div>
          )}
        </div>
        {errors.general && <div className="error-text general-error">{errors.general}</div>}
        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;