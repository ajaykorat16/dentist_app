import React, { useEffect, useState } from 'react'
import { Button } from '@mui/material'
import { Icon } from '@iconify/react'
import { Card } from 'primereact/card'
import { Dialog } from 'primereact/dialog'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { CCol, CForm, CFormInput, CFormLabel, CFormTextarea, CRow } from '@coreui/react'
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { useAuth } from '../contexts/AuthContext'
import CInput from './CInput'
import { useAppointment } from '../contexts/AppointmentContext'

function CreteAppointment({ visible, setVisible, doctorId, setDoctorId }) {
    const { createAppointment } = useAppointment()

    const [validated, setValidated] = useState(false);
    const [credential, setCredential] = useState({
        doctor_id: "",
        patient_id: "",
        appointment_time: "",
        medical_history: ""
    })


    const handleClose = () => {
        setVisible(false);
        setDoctorId(null);
        setCredential({
            doctor_id: "",
            patient_id: "",
            appointment_time: "",
            medical_history: ""
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
                    const data = await createAppointment(credential)
                    if (!data.error && data.clinic) {
                        handleClose()
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
            <Dialog draggable={false} header={`Book Appointment`} visible={visible} style={{ width: '20vw' }} onHide={handleClose}>
                <CForm onSubmit={handleSubmit} noValidate validated={validated}>
                    <div className='fields-container mt-2'>
                        <CRow className="mb-3 align-items-center d-flex flex-column">
                            <CCol lg={12}>
                                <div>
                                    <div>
                                        <CFormLabel>Medical history <span className="text-danger">*</span></CFormLabel>
                                    </div>
                                    <div className='w-100'>
                                        <CFormTextarea
                                            placeholder={"Medical history"}
                                            value={credential.medical_history}
                                            onChange={(e) => setCredential({ ...credential, medical_history: e.target.value })}
                                            required={true}
                                        />
                                    </div>
                                </div>

                            </CCol>
                        </CRow>
                        <CRow className="mb-3 align-items-center d-flex flex-row">
                            <CCol lg={12}>
                                <CInput
                                    label={'Start Date and Time'}
                                    type={'datetime-local'}
                                    value={credential.start_time}
                                    onChange={(value) => setCredential({ ...credential, start_time: value })}
                                    required={true}
                                    errorMessage='Start date and time are required.'
                                />

                            </CCol>
                        </CRow>
                    </div>
                    <div className={`d-flex button-container justify-content-end`}>
                        <div className='d-flex'>
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

export default CreteAppointment