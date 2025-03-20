import React, { useEffect, useState } from 'react'
import { Button } from '@mui/material'
import { Icon } from '@iconify/react'
import { Card } from 'primereact/card'
import { Dialog } from 'primereact/dialog'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { CCol, CForm, CFormLabel, CFormTextarea, CRow } from '@coreui/react'
import { LazyLoadImage } from 'react-lazy-load-image-component';
import CInput from './CInput'
import { useClinic } from '../contexts/ClinicContext'

function AddClinic({ editClinicId, visible, setVisible, setEditClinicId, editMode, setEditMode, fetchClinics }) {
    const { createClinic, getSingleClinic, updateClinic, deleteClinic } = useClinic()

    const [validated, setValidated] = useState(false);
    const [credential, setCredential] = useState({
        name: "",
        address: "",
        start_time: "",
        end_time: "",
        image: ""
    })


    const handleClose = () => {
        setVisible(false);
        setEditMode(false);
        setEditClinicId(null);
        setCredential({
            name: "",
            address: "",
            start_time: "",
            end_time: "",
            image: ""
        });
    };

    const fetchSingleUser = async () => {
        try {
            const clinic = await getSingleClinic(editClinicId);
            setCredential(clinic);
        } catch (error) {
            console.error('Error fetching single clinic', error);
        }
    };

    useEffect(() => {
        if (editMode && editClinicId) fetchSingleUser();
    }, [editMode, editClinicId]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCredential({ ...credential, image: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDelete = async () => {
        try {
            const confirmed = await confirmDelete();

            if (confirmed) {
                await deleteClinic(editClinicId);
                handleClose()
                fetchClinics()
            }
        } catch (error) {
            console.error('Error during delete operation', error);
        }
    };

    const confirmDelete = async () => {
        return new Promise((resolve) => {
            confirmDialog({
                message: 'Are you sure you want to delete this clinic?',
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
                    const data = await createClinic(credential)
                    if (!data.error && data.clinic) {
                        handleClose()
                        fetchClinics()
                    }
                } else if (editMode && editClinicId) {
                    const data = await updateClinic(editClinicId, credential)
                    if (!data.error) {
                        handleClose()
                        fetchClinics()
                    }
                }
            } catch (error) {
                console.log(error);
            }
        }
    }

    return (
        <div>
            <ConfirmDialog />
            <Dialog draggable={false} header={`${visible ? 'Create Clinic' : `Edit Clinic`}`} visible={visible || (editMode && editClinicId !== null)} style={{ width: '20vw' }} onHide={handleClose}>
                <CForm onSubmit={handleSubmit} noValidate validated={validated}>
                    <div className='fields-container mt-2'>
                        <CRow className="mb-3 align-items-center d-flex flex-column">
                            <CCol lg={12}>
                                <CInput
                                    label={'Name'}
                                    type={'text'}
                                    value={credential.name}
                                    onChange={(value) => setCredential({ ...credential, name: value })}
                                    required={true}
                                    errorMessage='Name is required.'
                                />
                            </CCol>
                        </CRow>
                        <CRow className="mb-3 align-items-center d-flex flex-column">
                            <CCol lg={12}>
                                <div>
                                    <div>
                                        <CFormLabel>Address <span className="text-danger">*</span></CFormLabel>
                                    </div>
                                    <div className='w-100'>
                                        <CFormTextarea
                                            placeholder={"Address"}
                                            value={credential.address}
                                            onChange={(e) => setCredential({ ...credential, address: e.target.value })}
                                            required={true}
                                            feedbackInvalid={'Address is required'}
                                            className={`is_not_validated`}
                                        />
                                    </div>
                                </div>

                            </CCol>
                        </CRow>
                        <CRow className="mb-3 align-items-center d-flex flex-row">
                            <CCol lg={6}>
                                <CInput
                                    label={'Start time'}
                                    type={'time'}
                                    value={credential.start_time}
                                    onChange={(value) => setCredential({ ...credential, start_time: value })}
                                    required={true}
                                    errorMessage='Start time is required.'
                                />
                            </CCol>
                            <CCol lg={6}>
                                <CInput
                                    label={'End time'}
                                    type={'time'}
                                    value={credential.end_time}
                                    onChange={(value) => setCredential({ ...credential, end_time: value })}
                                    required={true}
                                    errorMessage='End time is required.'
                                />
                            </CCol>
                        </CRow>
                        <CRow className="mb-3 align-items-center d-flex flex-column">
                            <CCol lg={12}>
                                <CFormLabel>Image</CFormLabel>
                                <CCol style={{ position: 'relative' }}>
                                    <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} id="fileInput" />
                                    <label htmlFor="fileInput">
                                        <Card
                                            className="create-card"
                                            header={credential.image ? <LazyLoadImage src={credential.image || 'defaultImageURL'} alt="Clinic" className='create-img' /> :
                                                <Icon icon="healthicons:ambulatory-clinic-outline" style={{ color: 'black' }} height={100} width={100} />}
                                        />
                                    </label>
                                    {
                                        credential.image &&
                                        <Icon
                                            icon="mdi:close"
                                            className='close-btn'
                                            height={15}
                                            width={15}
                                            onClick={() => setCredential({ ...credential, image: '' })}
                                        />
                                    }
                                </CCol>
                            </CCol>
                        </CRow>
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

export default AddClinic