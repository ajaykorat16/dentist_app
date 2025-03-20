import React, { useEffect, useState } from 'react'
import { Button } from '@mui/material'
import { Dialog } from 'primereact/dialog'
import { ConfirmDialog } from 'primereact/confirmdialog';
import { CCol, CForm, CFormLabel, CFormTextarea, CRow } from '@coreui/react'
import { useNote } from '../contexts/NotesContext'

function AddNotes({ editAppointmentId, setEditAppointmentId, editMode, setEditMode, fetchAppointments }) {
    const { getSingleNote, updateNote } = useNote()

    const [validated, setValidated] = useState(false);
    const [credential, setCredential] = useState({
        patient_information: "",
        prescription: "",
    })


    const handleClose = () => {
        setEditMode(false);
        setEditAppointmentId(null);
        setCredential({
            patient_information: "",
            prescription: "",
        });
    };

    const fetchSingleNote = async () => {
        try {
            const note = await getSingleNote(editAppointmentId);
            setCredential(note);
        } catch (error) {
            console.error('Error fetching single note', error);
        }
    };

    useEffect(() => {
        if (editMode && editAppointmentId) fetchSingleNote();
    }, [editMode, editAppointmentId]);

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
                    const data = await updateNote(editAppointmentId, credential)
                    if (!data.error) {
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
            <Dialog draggable={false} header={`Save note`} visible={editMode && editAppointmentId !== null} style={{ width: '20vw' }} onHide={handleClose}>
                <CForm onSubmit={handleSubmit} noValidate validated={validated}>
                    <div className='fields-container mt-2'>
                        <CRow className="mb-3 align-items-center d-flex flex-column">
                            <CCol lg={12}>
                                <div>
                                    <div>
                                        <CFormLabel>Patient information <span className="text-danger">*</span></CFormLabel>
                                    </div>
                                    <div className='w-100'>
                                        <CFormTextarea
                                            placeholder={"Patient information"}
                                            value={credential.patient_information}
                                            onChange={(e) => setCredential({ ...credential, patient_information: e.target.value })}
                                            required={true}
                                            feedbackInvalid={'Patient information is required'}
                                            className={`is_not_validated`}
                                        />
                                    </div>
                                </div>

                            </CCol>
                        </CRow>
                        <CRow className="mb-3 align-items-center d-flex flex-column">
                            <CCol lg={12}>
                                <div>
                                    <div>
                                        <CFormLabel>Prescription <span className="text-danger">*</span></CFormLabel>
                                    </div>
                                    <div className='w-100'>
                                        <CFormTextarea
                                            placeholder={"Prescription"}
                                            value={credential.prescription}
                                            onChange={(e) => setCredential({ ...credential, prescription: e.target.value })}
                                            required={true}
                                            feedbackInvalid={'Prescription is required'}
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

export default AddNotes