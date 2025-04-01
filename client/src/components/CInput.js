import { CFormInput, CFormLabel } from '@coreui/react';
import React from 'react';

const CInput = ({ 
    value, 
    onChange, 
    label, 
    type = 'text', 
    required = false, 
    className = '', 
    labelClassName = '', 
    format = '', 
    errorMessage = '', 
    placeholder = '', 
    minLength = 0 
}) => {
    const requiredIcon = required ? <span className="text-danger">*</span> : null;
    const step = (type === 'number') ? "any" : "";

    return (
        <div className={className}>
            <div className={labelClassName}>
                <CFormLabel>{label} {requiredIcon}</CFormLabel>
            </div>
            <div className='w-100'>
                <CFormInput
                    step={step}
                    type={type}
                    value={value}
                    placeholder={placeholder}
                    onChange={(e) => onChange(e.target.value)}
                    format={format}
                    required={required}
                    minLength={type === 'text' || type === 'password' ? minLength : undefined}
                    feedbackInvalid={errorMessage}
                    className={`${!required ? 'is_not_validated' : ''}`}
                />
            </div>
        </div>
    );
};

export default CInput;
