import NavBar from "../componenets/NavBar";
import BlogCard from "../componenets/BlogCard";
import { BlogContext } from "../context/BlogContext";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./DashBoard.css";

const DashBoard = () => {
  const { blogs, loading, error } = useContext(BlogContext);
  const navigate = useNavigate();
  
  return (
    <>
      <NavBar />
      <div className="dashboard-container">
        <h2 className="dashboard-title">All Blogs</h2>
        
        {loading && (
          <div className="loading-message">
            <p>Loading blogs...</p>
          </div>
        )}
        
        {error && (
          <div className="error-message">
            <p>Error: {error}</p>
          </div>
        )}
        
        {!loading && !error && blogs.length === 0 && (
          <div className="empty-state">
            <p className="empty-state-title">No blogs yet 👋</p>
            <p className="empty-state-message">Create your first blog to get started.</p>
            <button 
              className="empty-state-button"
              onClick={() => navigate('/create')}
            >
              Create Blog
            </button>
          </div>
        )}
        
        {!loading && !error && blogs.length > 0 && (
          <div className="blogs-grid">
            {blogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
export default DashBoard;