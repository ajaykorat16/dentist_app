import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Toast } from 'primereact/toast';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import { CForm, CRow } from '@coreui/react';
import CInput from '../components/CInput';

function Login() {
    const { auth, login, toast } = useAuth();

    const [validated, setValidated] = useState(false);
    const [credential, setCredential] = useState({
        email: "",
        password: ""
    });
    const navigate = useNavigate();
    const location = useLocation();

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
                const auth = await login(credential);
                if (auth?.user?.role_id === 1) {
                    navigate('/admin/clinic/list');
                } else if (auth?.user?.role_id === 2) {
                    navigate('/doctor/appointment/list');
                } if (auth?.user?.role_id === 3) {
                    navigate("/")
                }
            } catch (error) {
                console.log(error);
            }
        }
    };

    useEffect(() => {
        if (auth?.token) {
            if (location.pathname !== '/login') {
                navigate(location.pathname);
            } else {
                if (auth?.user?.role_id === 1) {
                    navigate('/admin/user/list');
                } else if (auth?.user?.role_id === 2) {
                    navigate('/doctor/appointment/list');
                } else {
                    navigate("/")
                }
            }
        }
    }, [auth?.token, navigate]);

    return (
        <>
            <Toast ref={toast} />
            <div className="vh-100 login-page">
                <div className="login-left-container">
                    <img src='/images/about.jpg' className="img-fluid w-100 h-100" alt="Logo" />
                </div>
                <div className="d-flex flex-column justify-content-center align-items-center mx-auto login-right-container">
                    <CForm onSubmit={handleSubmit} noValidate validated={validated}>
                        <div className="text-center mb-5">
                            <p className="credential-title">Login</p>
                        </div>
                        <CRow className="mb-4">
                            <CInput
                                label={'Email'}
                                type={'email'}
                                value={credential.email}
                                onChange={(value) => setCredential({ ...credential, email: value })}
                                required={true}
                                errorMessage='Email is required.'
                            />
                        </CRow>
                        <CRow className="mb-4">
                            <CInput
                                label={'Password'}
                                type={'password'}
                                min='8'
                                value={credential.password}
                                onChange={(value) => setCredential({ ...credential, password: value })}
                                required={true}
                                errorMessage='Please enter a password with 8 or more characters.'
                            />
                        </CRow>
                        <div>
                            <Button fullWidth variant="contained" color='primary' type="submit">
                                Submit
                            </Button>
                        </div>
                    </CForm>
                    <div className="text-center mt-4">
                        <p>
                            Don't have an account? <Link to="/register" className="custom-link">Register</Link>
                        </p>
                        <Link to="/" className="custom-link">Go to home</Link>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Login;
