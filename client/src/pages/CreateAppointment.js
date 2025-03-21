import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { CForm, CFormInput, CFormLabel, CFormSelect, CFormTextarea } from '@coreui/react'
import { useAppointment } from '../contexts/AppointmentContext'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Toast } from 'primereact/toast'
import Footer from '../components/Footer'
import { HashLink } from 'react-router-hash-link'

const CreateAppointment = () => {
    const params = useParams();
    const navigate = useNavigate()
    const { createAppointment, getAppointmentSlots } = useAppointment()
    const { auth, toast } = useAuth()

    const [validated, setValidated] = useState(false);
    const [credential, setCredential] = useState({
        doctor_id: "",
        patient_id: "",
        appointment_time: "",
        slot: "",
        medical_history: ""
    })

    const [slots, setSlots] = useState([]);

    const fetchSlots = async (date) => {
        const data = await getAppointmentSlots(params?.id, date);
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
        if (credential?.appointment_time) {
            fetchSlots(credential?.appointment_time);
        }
    }, [credential?.appointment_time]);


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
                        slot: "",
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
            <div className="container-fluid bg-primary my-5 py-5">
                <div className="container py-5">
                    <div className="row gx-5">
                        <div className="col-lg-6 mb-5 mb-lg-0">
                            <div className="mb-4">
                                <h5 className="d-inline-block text-white text-uppercase border-bottom border-5">Appointment</h5>
                                <h1 className="display-4">Make An Appointment For Your Family</h1>
                            </div>
                            <p className="text-white mb-5">Eirmod sed tempor lorem ut dolores. Aliquyam sit sadipscing kasd ipsum. Dolor ea et dolore et at sea ea at dolor, justo ipsum duo rebum sea invidunt voluptua. Eos vero eos vero ea et dolore eirmod et. Dolores diam duo invidunt lorem. Elitr ut dolores magna sit. Sea dolore sanctus sed et. Takimata takimata sanctus sed.</p>
                            <HashLink to='/#doctors' className="btn btn-dark rounded-pill py-3 px-5 me-3">Find Doctor</HashLink>
                            <HashLink className="btn btn-outline-dark rounded-pill py-3 px-5">Read More</HashLink>
                        </div>
                        <div className="col-lg-6">
                            <div className="bg-white text-center rounded p-5">
                                <h1 className="mb-4">Book An Appointment</h1>
                                <CForm onSubmit={handleSubmit} noValidate validated={validated}>
                                    <div className="row g-3">
                                        <div className="col-12">
                                            <div className="d-flex flex-row gap-3 mt-3">
                                                <div className="w-50 d-flex flex-column text-star">
                                                    <CFormLabel className="mb-2 text-center">Date <span className="text-danger">*</span></CFormLabel>
                                                    <CFormInput
                                                        type="date"
                                                        className="form-control bg-light light_border is_not_validated"
                                                        placeholder="Select date"
                                                        value={credential.appointment_time}
                                                        onChange={(e) => setCredential({ ...credential, appointment_time: e.target.value })}
                                                        required={true}
                                                        feedbackInvalid="Date is required."
                                                    />
                                                </div>
                                                <div className="w-50 d-flex flex-column text-star">
                                                    <CFormLabel className="mb-2 text-center">Time <span className="text-danger">*</span></CFormLabel>
                                                    <CFormSelect
                                                        value={credential.slot}
                                                        onChange={(e) => setCredential({ ...credential, slot: e.target.value })}
                                                        feedbackInvalid={"Time is required"}
                                                        required={true}
                                                        className={`is_not_validated pointerCursor form-control bg-light light_border`}
                                                    >
                                                        <option value="" disabled>Select Time</option>
                                                        {slots.map((o) => (
                                                            <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>
                                                        ))}
                                                    </CFormSelect>
                                                </div>
                                            </div>
                                            <div className="d-flex flex-column mt-3">
                                                <CFormLabel className="mb-2">Description</CFormLabel>
                                                <CFormTextarea
                                                    className="form-control bg-light light_border"
                                                    placeholder="Enter your medical history"
                                                    value={credential.medical_history}
                                                    onChange={(e) => setCredential({ ...credential, medical_history: e.target.value })}
                                                    rows={4}
                                                />
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

            <Footer />
        </div>
    )
}

export default CreateAppointment