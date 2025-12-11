import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { BlogContext } from '../context/BlogContext';
import './BlogCard.css';

const BlogCard = ({ blog }) => {
  const navigate = useNavigate();
  const { deleteBlog } = useContext(BlogContext);

  const handleEdit = () => {
    navigate(`/edit/${blog.id}`);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      await deleteBlog(blog.id);
    }
  };

  return (
    <div className="blog-card-container">
      <h2 className="blog-card-title">{blog.title}</h2>
      <p className="blog-card-category">{blog.category}</p>
      <p className="blog-card-description">{blog.description}</p>
      <div className="blog-card-button-container">
        <button className="blog-card-button edit-button" onClick={handleEdit}>
          Edit
        </button>
        <button className="blog-card-button delete-button" onClick={handleDelete}>
          Delete
        </button>
      </div>
    </div>
  );
};

export default BlogCard;

