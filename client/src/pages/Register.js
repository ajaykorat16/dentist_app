import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Toast } from 'primereact/toast';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import { CForm, CRow, CCol } from '@coreui/react';
import CInput from '../components/CInput';

function Register() {
    const { auth, register, toast } = useAuth();

    const [validated, setValidated] = useState(false);
    const [credential, setCredential] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        confirm_password: ""
    });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const form = e.currentTarget;
        setValidated(true);

        if (form.checkValidity() === false) {
            e.stopPropagation();
            const firstInvalidInput = form.querySelector(':invalid');
            if (firstInvalidInput) {
                firstInvalidInput.focus();
                firstInvalidInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        } else {
            try {
                const data = await register(credential);
                if (!data?.error) {
                    navigate("/login")
                }
            } catch (error) {
                console.log(error);
            }
        }
    };

    return (
        <>
            <Toast ref={toast} />
            <div className="vh-100 login-page">
                <div className="login-left-container">
                    <img src='/images/clinic.jpeg' className="img-fluid w-100 h-100" alt="Logo" />
                </div>
                <div className="d-flex flex-column justify-content-center align-items-center mx-auto login-right-container">
                    <CForm onSubmit={handleSubmit} noValidate validated={validated}>
                        <div className="text-center mb-5">
                            <p className="credential-title">Register</p>
                        </div>
                        <CRow className="mb-4">
                            <CCol xs="12">
                                <CInput
                                    label={'Email'}
                                    type={'email'}
                                    value={credential.email}
                                    onChange={(value) => setCredential({ ...credential, email: value })}
                                    required={true}
                                    errorMessage='Email is required.'
                                />
                            </CCol>
                        </CRow>
                        <CRow className="mb-4">
                            <CCol xs="12" md="6">
                                <CInput
                                    label={'First Name'}
                                    type={'text'}
                                    value={credential.first_name}
                                    onChange={(value) => setCredential({ ...credential, first_name: value })}
                                    required={true}
                                    errorMessage='First name is required.'
                                />
                            </CCol>
                            <CCol xs="12" md="6">
                                <CInput
                                    label={'Last Name'}
                                    type={'text'}
                                    value={credential.last_name}
                                    onChange={(value) => setCredential({ ...credential, last_name: value })}
                                    required={true}
                                    errorMessage='Last name is required.'
                                />
                            </CCol>
                        </CRow>
                        <CRow className="mb-4">
                            <CCol xs="12" md="6">
                                <CInput
                                    label={'Password'}
                                    type={'password'}
                                    minLength='8'
                                    value={credential.password}
                                    onChange={(value) => setCredential({ ...credential, password: value })}
                                    required={true}
                                    errorMessage='Please enter a password with 8 or more characters.'
                                />
                            </CCol>
                            <CCol xs="12" md="6">
                                <CInput
                                    label={'Confirm Password'}
                                    type={'password'}
                                    minLength='8'
                                    value={credential.confirm_password}
                                    onChange={(value) => setCredential({ ...credential, confirm_password: value })}
                                    required={true}
                                    errorMessage='Please enter a password with 8 or more characters.'
                                />
                            </CCol>
                        </CRow>
                        <div>
                            <Button fullWidth variant="contained" color='primary' type="submit">
                                Submit
                            </Button>
                        </div>
                    </CForm>
                    <div className="text-center mt-4">
                        <p>
                            Already have an account? <Link to="/login" className="custom-link">Log in</Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Register;
