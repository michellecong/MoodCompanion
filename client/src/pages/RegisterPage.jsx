import { useState } from "react";
import { Link } from "react-router-dom";
import "./RegisterPage.css";
const { register } = require("../../../server/controllers/userController");

function RegisterPage({ onRegister }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);
    onRegister(formData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  return (
    <div className="register-page">
      <section className="register-section">
        <div className="register-content">
          <h1>Register</h1>
          <p>Create an account to start tracking your emotions and journaling your thoughts</p>

          {error && <p className="error-message">{error}</p>} {/* Display error message */}

          <form onSubmit={register}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
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
                required
              />
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
                required
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </button>
          </form>

          <p>Already have an account? <Link to="/login">Login</Link></p>
        </div>
      </section>
    </div>
  );
}

export default RegisterPage;
