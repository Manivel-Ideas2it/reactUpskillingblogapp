import { useState, useEffect, useRef } from 'react';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';
import './BlogForm.css';

const MultiStepForm = ({ initialData, onStepChange, formRef }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [stepErrors, setStepErrors] = useState({});
  
  const formDataRef = useRef({
    title: initialData?.title || '',
    category: initialData?.category || '',
    description: initialData?.description || '',
    tags: initialData?.tags || '',
    authorName: initialData?.authorName || '',
  });

  useEffect(() => {
    if (initialData) {
      const newData = {
        title: (initialData.title && initialData.title.trim()) || formDataRef.current.title || '',
        category: (initialData.category && initialData.category.trim()) || formDataRef.current.category || '',
        description: (initialData.description && initialData.description.trim()) || formDataRef.current.description || '',
        tags: (initialData.tags && initialData.tags.trim()) || formDataRef.current.tags || '',
        authorName: (initialData.authorName && initialData.authorName.trim()) || formDataRef.current.authorName || '',
      };
      const hasNewValues = Object.keys(initialData).some(key => 
        initialData[key] && initialData[key].trim() && initialData[key] !== formDataRef.current[key]
      );
      
      if (hasNewValues) {
        formDataRef.current = newData;
      }
    }
  }, [initialData]);

  useEffect(() => {
    if (onStepChange) {
      onStepChange(currentStep);
    }
  }, [currentStep, onStepChange]);

  useEffect(() => {
    if (formRef) {
      formRef.current = {
        getFormData: () => {
          let allData = { ...formDataRef.current };
          
          if (step3Ref.current && step3Ref.current.getCurrentValues) {
            const step3Data = step3Ref.current.getCurrentValues();
            allData = { ...allData, ...step3Data };
            formDataRef.current = { ...formDataRef.current, ...step3Data };
          }
          const data = {
            title: allData.title || '',
            category: allData.category || '',
            description: allData.description || '',
            tags: allData.tags || '',
            authorName: allData.authorName || '',
          };
          return data;
        },
      };
    }
  }, [formRef]);

  const validationRules = {
    step1: {
      title: {
        required: true,
        regex: /^.{3,100}$/,
        errorMessage: 'Title must be between 3 and 100 characters',
      },
      category: {
        required: true,
        regex: /^[a-zA-Z\s-]{2,50}$/,
        errorMessage: 'Category must be 2-50 characters and contain only letters, spaces, and hyphens',
      },
    },
    step2: {
      description: {
        required: true,
        regex: /^.{10,1000}$/,
        errorMessage: 'Description must be between 10 and 1000 characters',
      },
    },
    step3: {
      tags: {
        required: false,
        regex: /^[a-zA-Z0-9\s,-]*$/,
        errorMessage: 'Tags can only contain letters, numbers, spaces, commas, and hyphens',
      },
      authorName: {
        required: false,
        regex: /^[a-zA-Z\s-]{0,100}$/,
        errorMessage: 'Author name must be up to 100 characters and contain only letters, spaces, and hyphens',
      },
    },
  };

  const validateStep = (step) => {
    const errors = {};
    const rules = validationRules[`step${step}`];

    Object.keys(rules).forEach((fieldName) => {
      const rule = rules[fieldName];
      const value = (formDataRef.current[fieldName] || '').toString().trim();

      if (rule.required && !value) {
        errors[fieldName] = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      } else if (value && rule.regex && !rule.regex.test(value)) {
        errors[fieldName] = rule.errorMessage;
      }
    });

    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleStepDataChange = (stepData) => {
    const updatedData = {
      ...formDataRef.current,
    };
    
    Object.keys(stepData).forEach((key) => {
      const newValue = stepData[key];
      if (newValue !== undefined && newValue !== null) {
        updatedData[key] = newValue;
      }
    });
    
    formDataRef.current = updatedData;
    const updatedErrors = { ...stepErrors };
    Object.keys(stepData).forEach((key) => {
      if (updatedErrors[key]) {
        delete updatedErrors[key];
      }
    });
    setStepErrors(updatedErrors);
  };

  const handleNext = () => {
    const isValid = validateStep(currentStep);
    if (isValid) {
      let currentStepData = {};
      
      if (currentStep === 1 && step1Ref.current?.getCurrentValues) {
        currentStepData = step1Ref.current.getCurrentValues();
      } else if (currentStep === 2 && step2Ref.current?.getCurrentValues) {
        currentStepData = step2Ref.current.getCurrentValues();
      } else if (currentStep === 3 && step3Ref.current?.getCurrentValues) {
        currentStepData = step3Ref.current.getCurrentValues();
      }
      
      if (Object.keys(currentStepData).length > 0) {
        handleStepDataChange(currentStepData);
      }
      
      if (currentStep < 3) {
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);
        setStepErrors({});
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      setStepErrors({});
    }
  };

  const isCurrentStepValid = () => {
    const errors = {};
    const rules = validationRules[`step${currentStep}`];

    Object.keys(rules).forEach((fieldName) => {
      const rule = rules[fieldName];
      const value = (formDataRef.current[fieldName] || '').toString().trim();

      if (rule.required && !value) {
        errors[fieldName] = true;
      } else if (value && rule.regex && !rule.regex.test(value)) {
        errors[fieldName] = true;
      }
    });

    return Object.keys(errors).length === 0;
  };
  const step1Ref = useRef(null);
  const step2Ref = useRef(null);
  const step3Ref = useRef(null);

  const renderStep = () => {
    const currentData = formDataRef.current;
    
    switch (currentStep) {
      case 1:
        return (
          <Step1
            ref={step1Ref}
            data={currentData}
            onChange={(data) => handleStepDataChange(data)}
            errors={stepErrors}
          />
        );
      case 2:
        return (
          <Step2
            ref={step2Ref}
            data={currentData}
            onChange={(data) => handleStepDataChange(data)}
            errors={stepErrors}
          />
        );
      case 3:
        return (
          <Step3
            ref={step3Ref}
            data={currentData}
            onChange={(data) => handleStepDataChange(data)}
            errors={stepErrors}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="multi-step-form">
      {renderStep()}
      <div className="form-navigation">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className="form-nav-button form-nav-button-prev"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={currentStep === 3 || !isCurrentStepValid()}
          className="form-nav-button form-nav-button-next"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default MultiStepForm;

