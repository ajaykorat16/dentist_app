import { CFormLabel, CFormSelect } from '@coreui/react'
import React from 'react'

function CSelect({ value, onChange, label, required = false, className = '', labelClassName = '', options, disabled = false, errorMessage = '' }) {
    const requiredIcon = required ? <span className="text-danger">*</span> : null;

    return (
        <div className={className}>
            <div className={labelClassName}>
                <CFormLabel>{label} {requiredIcon}</CFormLabel>
            </div>
            <div className='w-100'>
                <CFormSelect
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                    required={required}
                    feedbackInvalid={errorMessage}
                    className={`${!required ? 'is_not_validated pointerCursor' : 'pointerCursor'}`}
                >
                    <option value="" disabled>Select {label}</option>
                    {options.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </CFormSelect>
            </div>

        </div>
    )
}

export default CSelect