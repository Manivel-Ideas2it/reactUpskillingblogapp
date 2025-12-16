import { useRef, useImperativeHandle, forwardRef } from 'react';
import './BlogForm.css';

const Step3 = forwardRef(({ data, onChange, errors }, ref) => {
  const tagsRef = useRef(null);
  const authorNameRef = useRef(null);

  const getCurrentValues = () => {
    return {
      tags: tagsRef.current?.value || '',
      authorName: authorNameRef.current?.value || '',
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
        <label htmlFor="tags" className="form-label">
          Tags
        </label>
        <input
          ref={tagsRef}
          type="text"
          id="tags"
          name="tags"
          value={data?.tags || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`form-input ${errors?.tags ? 'form-input-error' : ''}`}
          placeholder="Enter tags (comma separated)"
          maxLength={200}
        />
        <div className="form-field-footer">
          {errors?.tags && (
            <span className="error-message">{errors.tags}</span>
          )}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="authorName" className="form-label">
          Author Name
        </label>
        <input
          ref={authorNameRef}
          type="text"
          id="authorName"
          name="authorName"
          value={data?.authorName || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`form-input ${errors?.authorName ? 'form-input-error' : ''}`}
          placeholder="Enter author name (optional)"
          maxLength={100}
        />
        <div className="form-field-footer">
          {errors?.authorName && (
            <span className="error-message">{errors.authorName}</span>
          )}
        </div>
      </div>
    </div>
  );
});

export default Step3;

