import { useRef, useImperativeHandle, forwardRef } from 'react';
import './BlogForm.css';

const Step2 = forwardRef(({ data, onChange, errors }, ref) => {
  const descriptionRef = useRef(null);

  const getCurrentValues = () => {
    return {
      description: descriptionRef.current?.value || '',
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
        <label htmlFor="description" className="form-label">
          Description
        </label>
        <textarea
          ref={descriptionRef}
          id="description"
          name="description"
          value={data?.description || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`form-textarea ${errors?.description ? 'form-textarea-error' : ''}`}
          placeholder="Enter blog description"
          rows="6"
          maxLength={1000}
        />
        <div className="form-field-footer">
          {errors?.description && (
            <span className="error-message">{errors.description}</span>
          )}
        </div>
      </div>
    </div>
  );
});

export default Step2;

