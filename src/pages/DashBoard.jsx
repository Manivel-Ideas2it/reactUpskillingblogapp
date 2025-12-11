import NavBar from "../componenets/NavBar";
import BlogCard from "../componenets/BlogCard";
import { BlogContext } from "../context/BlogContext";
import { useContext } from "react";
import "./DashBoard.css";

const DashBoard = () => {
  const { blogs, loading, error } = useContext(BlogContext);
  
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
          <div className="no-blogs-message">
            <p>Create your first blog!</p>
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