import { useNavigate, useParams } from 'react-router-dom';
import { useContext, useState, useRef, useEffect } from 'react';
import { BlogContext } from '../context/BlogContext';
import MultiStepForm from "../componenets/MultiStepForm";
import FlowHeader from "../componenets/FlowHeader";
import "./BlogEditor.css";
import "../componenets/BlogForm.css";

const BlogEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addBlog, updateBlog, getBlogById, loading } = useContext(BlogContext);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isFormValid, setIsFormValid] = useState(false);
  const multiStepFormRef = useRef(null);

  const isEditMode = !!id;
  const blog = isEditMode ? getBlogById(id) : null;

  const stepNames = ['Basic Info', 'Description', 'Additional Details'];

  useEffect(() => {
    if (isEditMode && !blog) {
      navigate('/');
    }
  }, [isEditMode, blog, navigate]);

  const handleStepChange = (step) => {
    setCurrentStep(step);
  };

  useEffect(() => {
    if (currentStep === 3 && multiStepFormRef.current) {
      const checkValidity = () => {
        if (multiStepFormRef.current && multiStepFormRef.current.isFormValid) {
          const isValid = multiStepFormRef.current.isFormValid();
          setIsFormValid(isValid);
        }
      };
      
      checkValidity();
      
      const timeout = setTimeout(checkValidity, 100);
      
      const interval = setInterval(checkValidity, 500);
      
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    } else {
      setIsFormValid(false);
    }
  }, [currentStep]);

  const handleSubmit = async () => {
    setError(null);
    if (!multiStepFormRef.current) {
      setError('Form not initialized');
      return;
    }

    const validationResult = multiStepFormRef.current.validateAllSteps();

    if (!validationResult.isValid) {
      if (validationResult.firstInvalidStep) {
        multiStepFormRef.current.setCurrentStep(validationResult.firstInvalidStep);
        setCurrentStep(validationResult.firstInvalidStep);
      }
      setError('Please fill all required fields correctly');
      return;
    }

    const formData = multiStepFormRef.current.getFormData();

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
    <div className="blog-editor-page">
      <FlowHeader 
        currentStep={currentStep} 
        totalSteps={3} 
        stepNames={stepNames}
        isEditMode={isEditMode}
      />
      <div className="blog-editor-wrapper">
        <div className="blog-editor-card">
          <div className="blog-editor-header">
            <h2 className="blog-editor-title">
              {isEditMode ? 'Edit Blog' : 'Create New Blog'}
            </h2>
            <p className="blog-editor-subtitle">
              Write something worth reading
            </p>
          </div>
          
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
                disabled={loading || !isFormValid}
                className="form-submit-button"
              >
                {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Blog' : 'Create Blog')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogEditor;