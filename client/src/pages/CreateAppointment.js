import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import { CForm, CFormInput, CFormLabel, CFormTextarea } from '@coreui/react'
import { useAppointment } from '../contexts/AppointmentContext'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Toast } from 'primereact/toast'

const CreateAppointment = () => {
    const params = useParams();
    const navigate = useNavigate()
    const { createAppointment } = useAppointment()
    const { auth, toast } = useAuth()

    const [validated, setValidated] = useState(false);
    const [credential, setCredential] = useState({
        doctor_id: "",
        patient_id: "",
        appointment_time: "",
        medical_history: ""
    })


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
                const doctorId = params.id

                const data = await createAppointment({ ...credential, doctor_id: doctorId, patient_id: auth?.user?.id })
                if (!data.error) {
                    setCredential({
                        doctor_id: "",
                        patient_id: "",
                        appointment_time: "",
                        medical_history: ""
                    })
                    navigate("/")
                }
            } catch (error) {
                console.log(error);
            }
        }
    }

    return (
        <div className='home-page'>
            {/* // <!-- Navbar Start --> */}
            <Navbar />
            <Toast ref={toast} />
            {/* // <!-- Navbar End --> */}


            {/* <!-- Appointment Start --> */}
            <div class="container-fluid bg-primary my-5 py-5">
                <div class="container py-5">
                    <div class="row gx-5">
                        <div class="col-lg-6 mb-5 mb-lg-0">
                            <div class="mb-4">
                                <h5 class="d-inline-block text-white text-uppercase border-bottom border-5">Appointment</h5>
                                <h1 class="display-4">Make An Appointment For Your Family</h1>
                            </div>
                            <p class="text-white mb-5">Eirmod sed tempor lorem ut dolores. Aliquyam sit sadipscing kasd ipsum. Dolor ea et dolore et at sea ea at dolor, justo ipsum duo rebum sea invidunt voluptua. Eos vero eos vero ea et dolore eirmod et. Dolores diam duo invidunt lorem. Elitr ut dolores magna sit. Sea dolore sanctus sed et. Takimata takimata sanctus sed.</p>
                            <a class="btn btn-dark rounded-pill py-3 px-5 me-3" href="">Find Doctor</a>
                            <a class="btn btn-outline-dark rounded-pill py-3 px-5" href="">Read More</a>
                        </div>
                        <div class="col-lg-6">
                            <div class="bg-white text-center rounded p-5">
                                <h1 class="mb-4">Book An Appointment</h1>
                                <CForm onSubmit={handleSubmit} noValidate validated={validated}>
                                    <div className="row g-3">
                                        {/* Inputs in One Row */}
                                        <div className="col-12">
                                            <div className="d-flex flex-row gap-3 mt-3">
                                                {/* Time Input */}
                                                <div className="w-50 d-flex flex-column text-star">
                                                    <CFormLabel className="mb-2 text-center">Time <span className="text-danger">*</span></CFormLabel>
                                                    <CFormInput
                                                        type="datetime-local"
                                                        className="form-control bg-light border-0 is_not_validated"
                                                        placeholder="Select date and time"
                                                        value={credential.appointment_time}
                                                        onChange={(e) => setCredential({ ...credential, appointment_time: e.target.value })}
                                                        required={true}
                                                        feedbackInvalid="Time is required."
                                                    />
                                                </div>

                                                {/* Medical History Input */}
                                                <div className="w-50 d-flex flex-column">
                                                    <CFormLabel className="mb-2">Medical History</CFormLabel>
                                                    <CFormTextarea
                                                        className="form-control bg-light border-0"
                                                        placeholder="Enter your medical history"
                                                        value={credential.medical_history}
                                                        onChange={(e) => setCredential({ ...credential, medical_history: e.target.value })}
                                                        rows={4}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Submit Button */}
                                        <div className="col-12">
                                            <button className="btn btn-primary w-100 py-3" type="submit">
                                                Make An Appointment
                                            </button>
                                        </div>
                                    </div>
                                </CForm>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* <!-- Appointment End --> */}

            {/* <!-- Footer Start --> */}
            <div className="container-fluid footer_bg text-light mt-5 py-5">
                <div className="container py-5">
                    <div className="row g-5">
                        <div className="col-lg-3 col-md-6">
                            <h4 className="d-inline-block text-primary text-uppercase border-bottom border-5 border-secondary mb-4">Get In Touch</h4>
                            <p className="mb-4">No dolore ipsum accusam no lorem. Invidunt sed clita kasd clita et et dolor sed dolor</p>
                            <p className="mb-2"><i className="fa-solid fa-map-marker-alt text-primary me-3"></i>123 Street, New York, USA</p>
                            <p className="mb-2"><i className="fa-solid fa-envelope text-primary me-3"></i>info@example.com</p>
                            <p className="mb-0"><i className="fa-solid fa-phone-alt text-primary me-3"></i>+012 345 67890</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="container-fluid footer_bg text-light border-top border-secondary py-4">
                <div className="container">
                    <div className="row g-5">
                        <div className="col-md-6 text-center text-md-start">
                            <p className="mb-md-0">&copy; <a className="text-primary" href="#">Your Site Name</a>. All Rights Reserved.</p>
                        </div>
                        <div className="col-md-6 text-center text-md-end">
                            <p className="mb-0">Designed by <a className="text-primary" href="https://htmlcodex.com">HTML Codex</a></p>
                        </div>
                    </div>
                </div>
            </div>
            {/* <!-- Footer End --> */}
        </div>
    )
}

export default CreateAppointment