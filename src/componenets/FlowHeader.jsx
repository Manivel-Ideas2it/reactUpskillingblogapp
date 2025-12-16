import { Link } from 'react-router-dom';
import './FlowHeader.css';

const FlowHeader = ({ currentStep, totalSteps, stepNames, isEditMode }) => {
  const getStepName = () => {
    if (stepNames && stepNames[currentStep - 1]) {
      return stepNames[currentStep - 1];
    }
    return '';
  };

  return (
    <header className="flow-header">
      <Link to="/" className="flow-header-back">
        ← Back to Dashboard
      </Link>
      <h1 className="flow-header-title">
        {isEditMode ? 'Edit Blog' : 'Create New Blog'}
      </h1>
      <div className="flow-header-step">
        Step {currentStep} of {totalSteps}
        {getStepName() && ` – ${getStepName()}`}
      </div>
    </header>
  );
};

export default FlowHeader;

