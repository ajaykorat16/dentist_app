import React, { useEffect, useState } from 'react';
import { Button } from '@mui/material';
import { Dialog } from 'primereact/dialog';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { CCol, CForm, CFormInput, CFormLabel, CRow } from '@coreui/react';
import { useAppointment } from '../contexts/AppointmentContext';

function EditAppointment({ editAppointmentId, setEditAppointmentId, editMode, setEditMode, fetchAppointments }) {
    const { getSingleAppointment, updateAppointment } = useAppointment();

    const [validated, setValidated] = useState(false);
    const [credential, setCredential] = useState({
        appointment_time: "",
    });

    const handleClose = () => {
        setEditMode(false);
        setEditAppointmentId(null);
        setCredential({ appointment_time: "" });
        setValidated(false);
    };

    const fetchSingleAppointment = async () => {
        try {
            const appointment = await getSingleAppointment(editAppointmentId);
            setCredential({ appointment_time: appointment.appointment_time });
        } catch (error) {
            console.error('Error fetching single appointment:', error);
        }
    };

    useEffect(() => {
        if (editMode && editAppointmentId) {
            fetchSingleAppointment();
        }
    }, [editMode, editAppointmentId]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const form = e.currentTarget;
        setValidated(true);

        if (!form.checkValidity()) {
            e.stopPropagation();
            const firstInvalidInput = form.querySelector(':invalid');
            if (firstInvalidInput) {
                firstInvalidInput.focus();
                firstInvalidInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        } else {
            try {
                if (editMode && editAppointmentId) {
                    const data = await updateAppointment(editAppointmentId, credential);
                    if (!data.error) {
                        setValidated(false)
                        handleClose();
                        fetchAppointments();
                    }
                }
            } catch (error) {
                console.error('Error updating appointment:', error);
            }
        }
    };

    return (
        <div>
            <ConfirmDialog />
            <Dialog
                draggable={false}
                header="Reschedule Appointment"
                visible={editMode && editAppointmentId !== null}
                className="edit-appointment-dialog"
                onHide={handleClose}
            >
                <CForm onSubmit={handleSubmit} noValidate validated={validated}>
                    <div className="fields-container mt-2">
                        <CRow className="mb-3 d-flex flex-column align-items-center">
                            <CCol lg={12}>
                                <CFormLabel htmlFor="appointmentTime">
                                    Time <span className="text-danger">*</span>
                                </CFormLabel>
                                <CFormInput
                                    id="appointmentTime"
                                    type="datetime-local"
                                    placeholder="Select date and time"
                                    value={credential.appointment_time}
                                    onChange={(e) =>
                                        setCredential((prev) => ({
                                            ...prev,
                                            appointment_time: e.target.value,
                                        }))
                                    }
                                    required
                                />
                                <div className="invalid-feedback">Time is required.</div>
                            </CCol>
                        </CRow>
                    </div>
                    <div className="d-flex button-container justify-content-end">
                        <Button
                            onClick={handleClose}
                            fullWidth
                            variant="contained"
                            color="inherit"
                            className="ms-3"
                        >
                            Cancel
                        </Button>
                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            type="submit"
                            className="ms-3"
                        >
                            Submit
                        </Button>
                    </div>
                </CForm>
            </Dialog>
        </div>
    );
}

export default EditAppointment;
