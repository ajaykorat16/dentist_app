import React, { useEffect, useState } from 'react'
import { Button } from '@mui/material'
import { Dialog } from 'primereact/dialog'
import { ConfirmDialog } from 'primereact/confirmdialog';
import { CCol, CForm, CFormLabel, CFormTextarea, CRow } from '@coreui/react'
import { useAppointment } from '../contexts/AppointmentContext';

function CancelAppointment({ editAppointmentId, setEditAppointmentId, editMode, setEditMode, fetchAppointments }) {
    const { cancelAppointment } = useAppointment()

    const [validated, setValidated] = useState(false);
    const [credential, setCredential] = useState({
        cancel_reason: "",
    })


    const handleClose = () => {
        setEditMode(false);
        setEditAppointmentId(null);
        setCredential({
            cancel_reason: "",
        });
        setValidated(false);
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
                if (editMode && editAppointmentId) {
                    const data = await cancelAppointment(editAppointmentId, credential)
                    if (!data.error) {
                        setValidated(false)
                        handleClose()
                        fetchAppointments()
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
            <Dialog draggable={false} header={`Cancel Appointment`} visible={editMode && editAppointmentId !== null} className='cancel_appointment' onHide={handleClose}>
                <CForm onSubmit={handleSubmit} noValidate validated={validated}>
                    <div className='fields-container mt-2'>
                        <CRow className="mb-3 align-items-center d-flex flex-column">
                            <CCol lg={12}>
                                <div>
                                    <div>
                                        <CFormLabel>Cancel reason <span className="text-danger">*</span></CFormLabel>
                                    </div>
                                    <div className='w-100'>
                                        <CFormTextarea
                                            value={credential.cancel_reason}
                                            onChange={(e) => setCredential({ ...credential, cancel_reason: e.target.value })}
                                            required={true}
                                            feedbackInvalid={'Cancel reason is required'}
                                            className={`is_not_validated`}
                                        />
                                    </div>
                                </div>

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

export default CancelAppointment