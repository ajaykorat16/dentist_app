import React, { useEffect, useState } from 'react';
import { Button } from '@mui/material';
import { Dialog } from 'primereact/dialog';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { CCol, CForm, CFormInput, CFormLabel, CFormSelect, CRow } from '@coreui/react';
import { useAppointment } from '../contexts/AppointmentContext';

function EditAppointment({ editAppointmentId, setEditAppointmentId, editMode, setEditMode, fetchAppointments }) {
    const { getSingleAppointment, updateAppointment, getAppointmentSlots } = useAppointment();

    const [validated, setValidated] = useState(false);
    const [credential, setCredential] = useState({
        appointment_time: "",
        slot: ""
    });
    const [slots, setSlots] = useState([]);
    const [doctorId, setDoctorId] = useState("")

    const handleClose = () => {
        setEditMode(false);
        setEditAppointmentId(null);
        setCredential({ appointment_time: "", slot: "" });
        setValidated(false);
        setDoctorId("")
    };

    const fetchSingleAppointment = async () => {
        try {
            const appointment = await getSingleAppointment(editAppointmentId);
            setDoctorId(appointment.doctor_id)
            setCredential({ appointment_time: appointment.appointment_time, slot: appointment?.slot });
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

    const fetchSlots = async (id, date) => {
        const data = await getAppointmentSlots(id, date);
        if (!data.error) {
            const slotOptionsList = Array.isArray(data?.data)
                ? data.data.map((s) => ({
                    label: s.slot,
                    value: s.slot,
                    disabled: s.disabled
                }))
                : [];

            setSlots(slotOptionsList);
        }
    };

    useEffect(() => {
        if (doctorId && credential?.appointment_time) {
            fetchSlots(doctorId, credential?.appointment_time);
        }
    }, [doctorId, credential?.appointment_time]);

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
                                    Date <span className="text-danger">*</span>
                                </CFormLabel>
                                <CFormInput
                                    id="appointmentTime"
                                    type="date"
                                    placeholder="Select date"
                                    value={credential.appointment_time}
                                    min={new Date().toISOString().split("T")[0]}
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
                        <CRow className="mb-3 d-flex flex-column align-items-center">
                            <CCol lg={12}>
                                <CFormLabel className="mb-2 text-center">Time <span className="text-danger">*</span></CFormLabel>
                                <CFormSelect
                                    value={credential.slot}
                                    onChange={(e) => setCredential({ ...credential, slot: e.target.value })}
                                    feedbackInvalid={"Time is required"}
                                    required={true}
                                    className={`is_not_validated pointerCursor`}
                                >
                                    <option value="" disabled>Select Time</option>
                                    {slots.map((o) => (
                                        <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>
                                    ))}
                                </CFormSelect>
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
