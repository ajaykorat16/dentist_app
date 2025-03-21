import React, { useEffect, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from '@mui/material';
import { useNote } from '../contexts/NotesContext';
import { useAppointment } from '../contexts/AppointmentContext';

function ViewNotes({ appointmentId, setAppointmentId, noteView, setNoteView, role = 'admin' }) {
    const { getSingleNote } = useNote();
    const { getSingleAppointment } = useAppointment()

    const [noteDetails, setNoteDetails] = useState({
        patient_information: '',
        prescription: '',
        medical_history: '',
    });

    const [loading, setLoading] = useState(true);

    const fetchSingleNote = async () => {
        try {
            setLoading(true);
            const note = await getSingleNote(appointmentId);
            const appointment = await getSingleAppointment(appointmentId);
            setNoteDetails({ ...note, medical_history: appointment?.medical_history });
        } catch (error) {
            console.error('Error fetching single note:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (noteView && appointmentId) {
            fetchSingleNote();
        }
    }, [noteView, appointmentId]);

    const handleClose = () => {
        setNoteView(false);
        setAppointmentId('');
    };

    return (
        <div>
            <Dialog
                draggable={false}
                header="View Notes"
                visible={noteView}
                style={{ width: '20vw' }}
                onHide={handleClose}
            >
                {loading ? (
                    <p>Loading note details...</p>
                ) : (
                    <div>
                        <div style={{ marginBottom: '1rem', wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
                            <span style={{ fontWeight: 'bold' }}>Medical History:</span>
                            <p>{noteDetails?.medical_history || 'No medical history available'}</p>
                        </div>
                        <div style={{ marginBottom: '1rem', wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
                            <span style={{ fontWeight: 'bold' }}>{role === 'patient' ? 'Your' : 'Patient'} Information:</span>
                            <p>{noteDetails?.patient_information || 'No information available'}</p>
                        </div>
                        <div style={{ marginBottom: '1rem', wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
                            <span style={{ fontWeight: 'bold' }}>Prescription:</span>
                            <p>{noteDetails?.prescription || 'No prescription available'}</p>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button variant="contained" color="primary" onClick={handleClose}>
                                Close
                            </Button>
                        </div>
                    </div>
                )}
            </Dialog>
        </div>
    );
}

export default ViewNotes;
