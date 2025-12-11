import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "./NavBar.css";

const NavBar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="nav-bar-container">
      <h1 className="nav-heading">Blog Writer</h1>
      <div className="nav-right-section">
        {user && (
          <span className="nav-user-info">
            {user.email || user.name || 'User'}
          </span>
        )}
        <Link to="/create" className="nav-button">Create Blog</Link>
        <button onClick={handleLogout} className="nav-button nav-logout-button">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default NavBar;