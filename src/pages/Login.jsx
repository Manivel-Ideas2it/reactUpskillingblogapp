import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Login.css";

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const { login, loading, error: authError } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!credentials.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!credentials.password.trim()) {
      newErrors.password = "Password is required";
    } else if (credentials.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const result = await login(credentials);

    if (result.success) {
      navigate("/");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-details">
          <h1 className="login-title">SignIn</h1>
          {authError && <div className="login-error-message">{authError}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-form-group">
              <label htmlFor="email" className="login-label">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={credentials.email}
                onChange={handleChange}
                className={`login-input ${
                  errors.email ? "login-input-error" : ""
                }`}
                placeholder="Enter your email"
                disabled={loading}
              />
              {errors.email && (
                <span className="login-error-text">{errors.email}</span>
              )}
            </div>

            <div className="login-form-group">
              <label htmlFor="password" className="login-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                className={`login-input ${
                  errors.password ? "login-input-error" : ""
                }`}
                placeholder="Enter your password"
                disabled={loading}
              />
              {errors.password && (
                <span className="login-error-text">{errors.password}</span>
              )}
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="login-link-container">
            <p className="login-link-text">
              Don't have an account?{" "}
              <Link to="/register" className="login-link">
                Register
              </Link>
            </p>
          </div>

          {/* <div className="login-demo-info">
          <p className="login-demo-text">
            <strong>Demo Credentials:</strong>
          </p>
          <p className="login-demo-text">Email: demo@example.com</p>
          <p className="login-demo-text">Password: demo123</p>
        </div> */}
        </div>
        <div className="register-notes">
          <h1 className="login-title">Welcome back!</h1>
          <p>
            Welcome back! We are so happy to have you here. It's great to see
            you again. We hope you had a safe and enjoyable time away.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
