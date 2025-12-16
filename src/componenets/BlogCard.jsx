import { useNavigate, Link } from 'react-router-dom';
import { useContext, useState } from 'react';
import { BlogContext } from '../context/BlogContext';
import ConfirmationModal from './ConfirmationModal';
import './BlogCard.css';

const BlogCard = ({ blog }) => {
  const navigate = useNavigate();
  const { deleteBlog } = useContext(BlogContext);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleEdit = () => {
    navigate(`/edit/${blog.id}`);
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteModal(false);
    await deleteBlog(blog.id);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  return (
    <>
      <div className="blog-card-container">
        <h2 className="blog-card-title">{blog.title}</h2>
        <div className="blog-card-description-wrapper">
          <p className="blog-card-description">{blog.description}</p>
          <Link to={`/blog/${blog.id}`} className="blog-card-read-more">
            Read more
          </Link>
        </div>
        <div className="blog-card-button-container">
          <button className="blog-card-button edit-button" onClick={handleEdit}>
            Edit
          </button>
          <button className="blog-card-button delete-button" onClick={handleDeleteClick}>
            Delete
          </button>
        </div>
      </div>
      <ConfirmationModal
        isOpen={showDeleteModal}
        message="Are you sure you want to delete this blog?"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
};

export default BlogCard;

