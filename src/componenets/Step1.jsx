import { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import './BlogForm.css';

const Step1 = forwardRef(({ data, onChange, errors }, ref) => {
  const titleRef = useRef(null);
  const categoryRef = useRef(null);

  useEffect(() => {
    if (data) {
      if (titleRef.current) {
        titleRef.current.value = data.title || '';
      }
      if (categoryRef.current) {
        categoryRef.current.value = data.category || '';
      }
    }
  }, [data]);

  const getCurrentValues = () => {
    return {
      title: titleRef.current?.value || '',
      category: categoryRef.current?.value || '',
    };
  };

  useImperativeHandle(ref, () => ({
    getCurrentValues,
  }));

  const handleChange = (e) => {
    const currentValues = getCurrentValues();
    onChange(currentValues);
  };

  const handleBlur = (e) => {
    const currentValues = getCurrentValues();
    onChange(currentValues);
  };

  return (
    <div className="blog-form">
      <div className="form-group">
        <label htmlFor="title" className="form-label">
          Title
        </label>
        <input
          ref={titleRef}
          type="text"
          id="title"
          name="title"
          defaultValue={data?.title || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`form-input ${errors?.title ? 'form-input-error' : ''}`}
          placeholder="Enter blog title"
          maxLength={100}
        />
        <div className="form-field-footer">
          {errors?.title && (
            <span className="error-message">{errors.title}</span>
          )}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="category" className="form-label">
          Category
        </label>
        <input
          ref={categoryRef}
          type="text"
          id="category"
          name="category"
          defaultValue={data?.category || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`form-input ${errors?.category ? 'form-input-error' : ''}`}
          placeholder="Enter blog category"
          maxLength={50}
        />
        <div className="form-field-footer">
          {errors?.category && (
            <span className="error-message">{errors.category}</span>
          )}
        </div>
      </div>
    </div>
  );
});

export default Step1;

