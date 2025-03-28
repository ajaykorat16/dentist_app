import React, { useEffect, useState } from 'react'
import { Button } from '@mui/material'
import { Icon } from '@iconify/react'
import { Card } from 'primereact/card'
import { Dialog } from 'primereact/dialog'
import { Checkbox } from 'primereact/checkbox'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { CCol, CForm, CFormInput, CFormLabel, CRow } from '@coreui/react'
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { useUser } from '../contexts/UserContext'
import { useAuth } from '../contexts/AuthContext'
import CInput from './CInput'
import CSelect from './CSelect'
import UpdatePassword from './UpdatePassword'
import ClinicSelection from './ClinicSelection'
import { useClinic } from '../contexts/ClinicContext'

const roleOptionsList = [
    { label: 'Admin', value: 1 },
    { label: 'Doctor', value: 2 },
];

function AddUser({ editUserId, visible, setVisible, setEditUserId, editMode, setEditMode, fetchUsers, role }) {
    const { createUser, getSingleUser, updateUser, deleteUser, updatePassword, } = useUser()
    const { getSingleClinic } = useClinic()
    const { toast, auth } = useAuth()

    const [passwordValidated, setPasswordValidated] = useState(false);
    const [validated, setValidated] = useState(false);

    const [changePasswordVisible, setChangePasswordVisible] = useState(false)
    const [changePasswordCredential, setChangePasswordCredential] = useState({
        newPassword: "",
        confirmNewPassword: ""
    })
    const [credential, setCredential] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        role_id: role === 'doctor' ? 2 : 1,
        clinic_id: "",
        degree: "",
        photo: "",
        is_active: 1
    })

    const handleClose = () => {
        setVisible(false);
        setEditMode(false);
        setEditUserId(null);
        setCredential({
            first_name: "",
            last_name: "",
            email: "",
            password: "",
            role_id: role === 'doctor' ? 2 : 1,
            clinic_id: "",
            degree: "",
            photo: "",
            is_active: 1
        });
    };

    const fetchSingleUser = async () => {
        try {
            const user = await getSingleUser(editUserId);
            if (user?.clinic_id) {
                const clinic = await getSingleClinic(user?.clinic_id);
                const clinic_id = { label: clinic.name, value: clinic.id }
                setCredential({ ...user, clinic_id, is_active: user.is_active === 1 ? true : false });
            } else {
                setCredential({ ...user, is_active: user.is_active === 1 ? true : false });
            }
        } catch (error) {
            console.error('Error fetching single user', error);
        }
    };

    useEffect(() => {
        if (editMode && editUserId) fetchSingleUser();
    }, [editMode, editUserId]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCredential({ ...credential, photo: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDelete = async () => {
        try {
            const confirmed = await confirmDelete();

            if (confirmed) {
                await deleteUser(editUserId);
                handleClose()
                fetchUsers()
            }
        } catch (error) {
            console.error('Error during delete operation', error);
        }
    };

    const confirmDelete = async () => {
        return new Promise((resolve) => {
            confirmDialog({
                message: 'Are you sure you want to delete this user?',
                header: 'Delete Confirmation',
                icon: 'pi pi-info-circle',
                position: 'top',
                accept: () => resolve(true),
                reject: () => resolve(false),
            });
        });
    };

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
                if (visible) {
                    const data = await createUser(credential)
                    if (!data.error && data.user) {
                        handleClose()
                        fetchUsers()
                    }
                } else if (editMode && editUserId) {
                    const data = await updateUser(editUserId, credential)
                    if (!data.error) {
                        handleClose()
                        fetchUsers()
                    }
                }
            } catch (error) {
                console.log(error);
            }
        }
    }

    const hanldeUpdatePassword = async (e) => {
        e.preventDefault()
        const form = e.currentTarget;

        setPasswordValidated(true)

        if (form.checkValidity() === false) {
            e.stopPropagation();
            const firstInvalidInput = form.querySelector(':invalid');
            if (firstInvalidInput) {
                firstInvalidInput.focus();
                firstInvalidInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        } else {
            try {
                if (changePasswordCredential.newPassword !== changePasswordCredential.confirmNewPassword) {
                    toast.current.show({ severity: 'error', summary: 'User', detail: "New Password and Confirm New Password must be same", life: 3000 })
                } else {
                    const data = await updatePassword(editUserId, changePasswordCredential.newPassword)
                    if (!data.error) {
                        handleClosePassword()
                    }
                }
            } catch (error) {
                console.log(error);
            }
        }
    }

    const handleClosePassword = () => {
        setChangePasswordVisible(false)
        setChangePasswordCredential({
            newPassword: "",
            confirmNewPassword: ""
        })
        setPasswordValidated(false)
    }

    return (
        <div>
            <ConfirmDialog />
            <Dialog draggable={false} header={`'Change Password'`} visible={changePasswordVisible} style={{ width: '20vw' }} onHide={handleClosePassword}>
                <CForm onSubmit={hanldeUpdatePassword} noValidate validated={passwordValidated}>
                    <UpdatePassword
                        changePasswordCredential={changePasswordCredential}
                        setChangePasswordCredential={setChangePasswordCredential}
                    />
                    <div className={`d-flex justify-content-end mt-4 button-container`}>
                        <div className='d-flex'>
                            <Button onClick={handleClosePassword} fullWidth variant="contained" color="inherit" >
                                Cancel
                            </Button>
                            <Button fullWidth variant="contained" color='primary' type="submit" className='ms-3'>
                                Submit
                            </Button>
                        </div>
                    </div>
                </CForm>
            </Dialog>
            <Dialog draggable={false} header={`${visible ? `Create ${role === 'doctor' ? "Doctor" : "Staff"}` : `Edit ${role === 'doctor' ? "Doctor" : "Staff"}`}`} visible={visible || (editMode && editUserId !== null)} style={{ width: '40vw' }} onHide={handleClose}>
                <CForm onSubmit={handleSubmit} noValidate validated={validated}>
                    <div className='fields-container mt-2'>
                        <CRow className="mb-3">
                            <CCol lg={6}>
                                <CInput
                                    label={'First Name'}
                                    type={'text'}
                                    value={credential.first_name}
                                    onChange={(value) => setCredential({ ...credential, first_name: value })}
                                    required={true}
                                    errorMessage='First name is required.'
                                />
                            </CCol>
                            <CCol lg={6}>
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
                        <CRow className="mb-3">
                            <CCol lg={6}>
                                <CInput
                                    label={'Email'}
                                    type={'email'}
                                    value={credential.email}
                                    onChange={(value) => setCredential({ ...credential, email: value })}
                                    required={true}
                                    errorMessage='Email name is required.'
                                />
                            </CCol>
                            <CCol lg={6}>
                                {visible ?
                                    (
                                        <div>
                                            <div>
                                                <CFormLabel>Password <span className="text-danger">*</span></CFormLabel>
                                            </div>
                                            <div className='w-100'>
                                                <CFormInput
                                                    type='password'
                                                    minLength={8}
                                                    value={credential.password}
                                                    onChange={(e) => setCredential({ ...credential, password: e.target.value })}
                                                    feedbackInvalid='Please enter a password with 8 or more characters.'
                                                    disabled={credential.role === 'staff'}
                                                    className='is_not_validated'
                                                    required={true}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <CFormLabel>Password</CFormLabel>
                                            <Button fullWidth variant="contained" color="inherit" onClick={() => setChangePasswordVisible(true)} disabled={credential.role === 'staff'}>
                                                Change Password
                                            </Button>
                                        </>
                                    )
                                }
                            </CCol>
                        </CRow>
                        <CRow className="mb-3">
                            <CCol lg={6}>
                                <CSelect
                                    label="Role"
                                    value={credential.role_id}
                                    onChange={(value) => setCredential({ ...credential, role_id: value })}
                                    options={roleOptionsList}
                                    required={true}
                                    disabled={true}
                                    errorMessage='Please select a valid role.'
                                />
                            </CCol>
                            {role === 'doctor' &&
                                <CCol lg={6}>
                                    <CInput
                                        label={'Degree'}
                                        type={'text'}
                                        value={credential.degree}
                                        onChange={(value) => setCredential({ ...credential, degree: value })}
                                    />
                                </CCol>
                            }
                        </CRow>
                        <CRow className="mb-3">
                            {credential.role_id == 2 && (
                                <CCol lg={6}>
                                    <ClinicSelection
                                        multiSelect={false}
                                        value={credential.clinic_id}
                                        onChange={(value) => setCredential({ ...credential, clinic_id: value })}
                                    />
                                </CCol>
                            )}
                            {editMode &&
                                <CCol lg={6} className='d-flex align-items-end'>
                                    <div className='d-flex'>
                                        <div className="custom-checkbox me-2">
                                            <Checkbox
                                                checked={credential.is_active}
                                                onChange={(value) => {
                                                    setCredential({ ...credential, is_active: value.checked })
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <CFormLabel className="form-label">Active</CFormLabel>
                                        </div>
                                    </div>
                                </CCol>
                            }
                        </CRow>
                        {role === 'doctor' &&
                            <CRow className="mb-3">
                                <CFormLabel>Image</CFormLabel>
                                <CCol style={{ position: 'relative' }}>
                                    <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} id="fileInput" />
                                    <label htmlFor="fileInput">
                                        <Card
                                            className="create-card"
                                            header={credential.photo ? <LazyLoadImage src={credential.photo || 'defaultImageURL'} alt="User" className='create-img' /> :
                                                <Icon icon="mdi:user" style={{ color: 'black' }} height={100} width={100} />}
                                        />
                                    </label>
                                    {
                                        credential.photo &&
                                        <Icon
                                            icon="mdi:close"
                                            className='close-btn'
                                            height={15}
                                            width={15}
                                            onClick={() => setCredential({ ...credential, photo: '' })}
                                        />
                                    }
                                </CCol>
                            </CRow>
                        }
                    </div>
                    <div className={`d-flex button-container justify-content-end`}>
                        <div className='d-flex'>
                            {editMode &&
                                <Button color='error' fullWidth variant="contained" onClick={handleDelete} >
                                    Delete
                                </Button>
                            }
                            <Button onClick={handleClose} fullWidth variant="contained" color="inherit" className='ms-3'>
                                Cancel
                            </Button>
                            <Button fullWidth variant="contained" color='primary' type="submit" className='ms-3'>
                                Submit
                            </Button>
                        </div>
                    </div>
                </CForm>
            </Dialog>
        </div>
    )
}

export default AddUser