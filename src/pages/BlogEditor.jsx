import { useNavigate, useParams } from 'react-router-dom';
import { useContext, useState, useRef } from 'react';
import { BlogContext } from '../context/BlogContext';
import MultiStepForm from "../componenets/MultiStepForm";
import "./BlogEditor.css";
import "../componenets/BlogForm.css";

const BlogEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addBlog, updateBlog, getBlogById, loading } = useContext(BlogContext);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const multiStepFormRef = useRef(null);

  const isEditMode = !!id;
  const blog = isEditMode ? getBlogById(id) : null;

  if (isEditMode && !blog) {
    navigate('/');
    return null;
  }

  const handleStepChange = (step) => {
    setCurrentStep(step);
  };

  const validateAllSteps = () => {
    if (!multiStepFormRef.current) {
      return false;
    }
    
    const formData = multiStepFormRef.current.getFormData();
    const errors = {};

    const title = (formData.title || '').toString().trim();
    const category = (formData.category || '').toString().trim();
    
    if (!title) {
      errors.title = 'Title is required';
    } else if (title.length < 3 || title.length > 100) {
      errors.title = 'Title must be between 3 and 100 characters';
    }

    if (!category) {
      errors.category = 'Category is required';
    } else if (!/^[a-zA-Z\s-]{2,50}$/.test(category)) {
      errors.category = 'Category must be 2-50 characters and contain only letters, spaces, and hyphens';
    }
    const description = (formData.description || '').toString().trim();
    if (!description) {
      errors.description = 'Description is required';
    } else if (description.length < 10 || description.length > 1000) {
      errors.description = 'Description must be between 10 and 1000 characters';
    }

    const tags = (formData.tags || '').toString();
    const authorName = (formData.authorName || '').toString().trim();
    
    if (tags && !/^[a-zA-Z0-9\s,-]*$/.test(tags)) {
      errors.tags = 'Tags can only contain letters, numbers, spaces, commas, and hyphens';
    }

    if (authorName && !/^[a-zA-Z\s-]{0,100}$/.test(authorName)) {
      errors.authorName = 'Author name must be up to 100 characters and contain only letters, spaces, and hyphens';
    }

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    setError(null);
    if (!multiStepFormRef.current) {
      setError('Form not initialized');
      return;
    }

    const formData = multiStepFormRef.current.getFormData();

    const isValid = validateAllSteps();

    if (!isValid) {
      setError('Please fill all required fields correctly');
      return;
    }

    const submitData = {
      title: formData.title?.trim() || '',
      category: formData.category?.trim() || '',
      description: formData.description?.trim() || '',
      ...(formData.tags && { tags: formData.tags.trim() }),
      ...(formData.authorName && { authorName: formData.authorName.trim() }),
    };

    let result;
    if (isEditMode) {
      result = await updateBlog({ ...submitData, id: id });
    } else {
      result = await addBlog(submitData);
    }

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Failed to save blog');
    }
  };

  return (
    <div className="blog-editor-container">
      <h2 className="blog-editor-title">
        {isEditMode ? 'Edit Blog' : 'Create New Blog'}
      </h2>
      
      {error && (
        <div className="blog-editor-error">
          <p>Error: {error}</p>
        </div>
      )}
      
      {loading && (
        <div className="blog-editor-loading">
          <p>Saving blog...</p>
        </div>
      )}
      
      <MultiStepForm
        initialData={blog || {
          title: '',
          category: '',
          description: '',
          tags: '',
          authorName: '',
        }}
        onStepChange={handleStepChange}
        formRef={multiStepFormRef}
      />
      {currentStep === 3 && (
        <div className="form-submit-container">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="form-submit-button"
          >
            {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Blog' : 'Create Blog')}
          </button>
        </div>
      )}
    </div>
  );
};

export default BlogEditor;