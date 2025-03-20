import React, { useEffect, useState, useCallback } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button, CircularProgress, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { useAppointment } from '../contexts/AppointmentContext';

function MedicalHistoryView({ appointmentId, setAppointmentId, medHistoryView, setMedHistoryView }) {
    const { getSingleAppointment } = useAppointment();
    const [medicalHistory, setMedicalHistory] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchMedicalHistory = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const note = await getSingleAppointment(appointmentId);
            setMedicalHistory(note?.medical_history || 'No medical history available.');
        } catch (err) {
            console.error('Error fetching medical history:', err);
            setError('Failed to load medical history. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [appointmentId, getSingleAppointment]);

    useEffect(() => {
        if (medHistoryView && appointmentId) {
            fetchMedicalHistory();
        }
    }, [medHistoryView, appointmentId, fetchMedicalHistory]);

    const handleClose = useCallback(() => {
        setMedHistoryView(false);
        setAppointmentId('');
    }, [setMedHistoryView, setAppointmentId]);

    return (
        <Dialog
            draggable={false}
            header="Medical Info"
            visible={medHistoryView}
            style={{ width: '20vw' }}
            onHide={handleClose}
            aria-label="Medical History Modal"
        >
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
                    <CircularProgress />
                </div>
            ) : error ? (
                <Typography color="error" align="center">
                    {error}
                </Typography>
            ) : (
                <div>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        Medical History:
                    </Typography>
                    <Typography
                        sx={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}
                    >
                        {medicalHistory}
                    </Typography>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                        <Button variant="contained" color="primary" onClick={handleClose}>
                            Close
                        </Button>
                    </div>
                </div>
            )}
        </Dialog>
    );
}

export default MedicalHistoryView;
