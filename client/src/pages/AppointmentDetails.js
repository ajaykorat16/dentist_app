import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { format } from 'date-fns';
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { Toast } from "primereact/toast";
import { useAuth } from "../contexts/AuthContext";
import { useAppointment } from "../contexts/AppointmentContext";

const AppointmentDetails = () => {
    const { appointmentId } = useParams();
    const { getSingleAppointment } = useAppointment()
    const { toast } = useAuth()

    const [appointment, setAppointment] = useState({
        doctor: "",
        date: "",
        slot: "",
        status: "",
        cancel_reason: "",
        description: "",
        patient_information: ""
    });

    const fetchAppointment = async () => {
        const appointment = await getSingleAppointment(appointmentId)
        setAppointment({
            doctor: appointment?.doctor_name || "N/A",
            date: appointment?.appointment_time
                ? format(new Date(appointment.appointment_time), 'dd-MM-yyyy')
                : "N/A",
            slot: appointment?.slot || "N/A",
            status: appointment?.status || "N/A",
            cancel_reason: appointment?.cancel_reason || "N/A",
            description: appointment?.medical_history || "N/A",
            patient_information: appointment?.patient_information || "N/A",
            prescription: appointment?.prescription || "N/A"
        });
    }

    useEffect(() => {
        if (appointmentId) {
            fetchAppointment()
        }
    }, [appointmentId])

    return (
        <div className='home-page full_height_layout'>
            {/* Navbar Start */}
            <Navbar />
            <Toast ref={toast} />
            <div className="container mt-4">
                <h2>Appointment Details</h2>
                <table className="table table-bordered">
                    <tbody>
                        <tr>
                            <th>Doctor</th>
                            <td>{appointment.doctor}</td>
                        </tr>
                        <tr>
                            <th>Status</th>
                            <td>
                                {appointment.status}
                            </td>
                        </tr>
                        <tr>
                            <th>Appointment Date</th>
                            <td>{appointment.date}</td>
                        </tr>
                        <tr>
                            <th>Slot</th>
                            <td>{appointment.slot}</td>
                        </tr>
                        <tr>
                            <th>Description</th>
                            <td>{appointment.description || "N/A"}</td>
                        </tr>
                        <tr>
                            <th>Patient Information</th>
                            <td>{appointment.patient_information || "N/A"}</td>
                        </tr>
                        <tr>
                            <th>Prescription</th>
                            <td>{appointment.prescription || "N/A"}</td>
                        </tr>
                        {appointment.status.toLowerCase() === "cancelled" && appointment.cancel_reason && (
                            <tr>
                                <th>Cancellation Reason</th>
                                <td>{appointment.cancel_reason}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <Footer />
        </div>

    );
};

export default AppointmentDetails;
