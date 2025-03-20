import { CFormInput, CFormLabel } from '@coreui/react'
import React from 'react'

function UpdatePassword({ changePasswordCredential, setChangePasswordCredential }) {
    return (
        <div className='fields-container'>
            <div className='mb-3 mt-3'>
                <div>
                    <CFormLabel>Password <span className="text-danger">*</span></CFormLabel>
                </div>
                <div className='w-100'>
                    <CFormInput
                        type='password'
                        minLength={8}
                        value={changePasswordCredential.newPassword}
                        onChange={(e) => setChangePasswordCredential({ ...changePasswordCredential, newPassword: e.target.value })}
                        required
                        feedbackInvalid='Please enter a password with 8 or more characters.'
                        className='is_not_validated'
                    />
                </div>
            </div>
            <div className='mb-3 mt-3'>
                <div>
                    <CFormLabel>Confirm Password <span className="text-danger">*</span></CFormLabel>
                </div>
                <div className='w-100'>
                    <CFormInput
                        type='password'
                        minLength={8}
                        value={changePasswordCredential.confirmNewPassword}
                        onChange={(e) => setChangePasswordCredential({ ...changePasswordCredential, confirmNewPassword: e.target.value })}
                        required
                        feedbackInvalid='Confirm password is required.'
                        className='is_not_validated'
                    />
                </div>
            </div>
        </div>
    )
}

export default UpdatePassword