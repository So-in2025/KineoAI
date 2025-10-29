import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

interface GeneratorStepperProps {
  currentStep: number;
}

const Step: React.FC<{ stepNumber: number; label: string; isActive: boolean; isCompleted: boolean }> = ({ stepNumber, label, isActive, isCompleted }) => {
  const stateClasses = {
    active: 'border-cyan-400 text-cyan-300',
    completed: 'border-green-400 text-green-300',
    inactive: 'border-slate-600 text-slate-400',
  };
  
  const getClasses = () => {
    if (isActive) return stateClasses.active;
    if (isCompleted) return stateClasses.completed;
    return stateClasses.inactive;
  };

  const textClasses = {
    active: 'text-white',
    completed: 'text-slate-300',
    inactive: 'text-slate-500',
  };

  const getTextClasses = () => {
    if (isActive) return textClasses.active;
    if (isCompleted) return textClasses.completed;
    return textClasses.inactive;
  }

  return (
    <div className="flex items-center">
      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-colors duration-300 ${getClasses()}`}>
        {isCompleted && !isActive ? '✔' : stepNumber}
      </div>
      <span className={`ml-3 font-medium hidden sm:inline ${getTextClasses()}`}>{label}</span>
    </div>
  );
};


const GeneratorStepper: React.FC<GeneratorStepperProps> = ({ currentStep }) => {
  const { t } = useTranslation();
  
  const steps = [
    { number: 1, label: t('generator.stepper.step1') },
    { number: 2, label: t('generator.stepper.step2') },
    { number: 3, label: t('generator.stepper.step3') },
    { number: 4, label: t('generator.stepper.step4') },
  ];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <Step 
              stepNumber={step.number} 
              label={step.label} 
              isActive={currentStep === step.number}
              isCompleted={currentStep > step.number}
            />
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-4 transition-colors duration-500 ${currentStep > step.number ? 'bg-cyan-400' : 'bg-slate-700'}`}></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default GeneratorStepper;
