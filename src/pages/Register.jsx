import { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Register.css";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const { register, loading, error: authError, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
    if (name === "password" && errors.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "",
      }));
    }
    if (name === "confirmPassword" && errors.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "",
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2 || formData.name.trim().length > 50) {
      newErrors.name = "Name must be between 2 and 50 characters";
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name.trim())) {
      newErrors.name = "Name can only contain letters and spaces";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const result = await register({
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
    });

    if (result.success) {
      navigate("/");
    }
  };

  const isFormValid = () => {
    const name = formData.name.trim();
    const email = formData.email.trim();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    if (!name || name.length < 2 || name.length > 50 || !/^[a-zA-Z\s]+$/.test(name)) {
      return false;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return false;
    }

    if (!password || password.length < 6) {
      return false;
    }

    if (!confirmPassword || password !== confirmPassword) {
      return false;
    }

    return Object.keys(errors).length === 0;
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-details">
          <h1 className="login-title">Sign Up</h1>
          {authError && <div className="login-error-message">{authError}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-form-group">
              <label htmlFor="name" className="login-label">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`login-input ${
                  errors.name ? "login-input-error" : ""
                }`}
                placeholder="Enter your name"
                disabled={loading}
              />
              {errors.name && (
                <span className="login-error-text">{errors.name}</span>
              )}
            </div>

            <div className="login-form-group">
              <label htmlFor="email" className="login-label">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
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
                value={formData.password}
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

            <div className="login-form-group">
              <label htmlFor="confirmPassword" className="login-label">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`login-input ${
                  errors.confirmPassword ? "login-input-error" : ""
                }`}
                placeholder="Confirm your password"
                disabled={loading}
              />
              {errors.confirmPassword && (
                <span className="login-error-text">{errors.confirmPassword}</span>
              )}
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={loading || !isFormValid()}
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <div className="login-link-container">
            <p className="login-link-text">
              Already have an account?{" "}
              <Link to="/login" className="login-link">
                Login
              </Link>
            </p>
          </div>
        </div>
        <div className="register-notes">
          <h1 className="login-title">Welcome!</h1>
          <p>
            Join us today! Create your account and start writing amazing blog posts.
            Share your thoughts, ideas, and stories with the world.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

