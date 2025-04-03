import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import "./LoginPage.css";

function Login({ onLogin, onUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // 获取查询参数中的redirect路径，如果有的话
  const searchParams = new URLSearchParams(location.search);
  const redirectPath = searchParams.get("redirect") || "/";

  const handleLogin = async () => {
    try {
      const response = await api.post("/users/login", { email, password });

      if (response.data.token) {
        // 存储token
        localStorage.setItem("token", response.data.token);

        // 更新用户数据
        if (response.data.user) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
          // 调用App组件的回调更新用户状态
          onUser(response.data.user);
        }

        // 调用App组件的回调更新认证状态
        onLogin(true);

        // 如果有重定向路径，则导航到该路径，否则导航到首页
        navigate(redirectPath);
      } else {
        setError("Invalid credentials");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Login failed");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }
    handleLogin();
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Login</h2>
        {error && <p className="error-text">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
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
