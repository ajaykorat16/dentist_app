import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import { Toast } from 'primereact/toast'
import { useAuth } from '../contexts/AuthContext'
import { CForm, CFormInput, CFormTextarea } from '@coreui/react'
import Footer from '../components/Footer'
import { useContact } from '../contexts/ContactContext'
import { useNavigate } from 'react-router-dom'
import { contactDetails } from '../lib'

const ContactUs = () => {
    const navigate = useNavigate()
    const { toast } = useAuth()
    const { createContact } = useContact()

    const [validated, setValidated] = useState(false);
    const [credential, setCredential] = useState({
        name: "",
        phone_number: "",
        message: ""
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
                const data = await createContact(credential)
                if (!data.error) {
                    setCredential({
                        name: "",
                        phone_number: "",
                        message: ""
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


            {/* <!-- Contact Start --> */}
            <div className="container-fluid pt-5">
                <div className="container">
                    <div className="text-center mx-auto mb-5" style={{ maxWidth: "500px" }}>
                        <h5 className="d-inline-block text-primary text-uppercase border-bottom border-5">Any Questions?</h5>
                        <h1 className="display-4">Please Feel Free To Contact Us</h1>
                    </div>
                    <div className="row g-5 mb-5">
                        <div className="col-lg-4">
                            <div className="bg-light rounded d-flex flex-column align-items-center justify-content-center text-center" style={{ height: "200px" }}>
                                <div className="d-flex align-items-center justify-content-center icon_bg rounded-circle mb-4" style={{ width: "100px", height: "70px", transform: "rotate(-15deg)" }}>
                                    <i className="fa-solid fa-2x fa-location-arrow text-white" style={{ transform: "rotate(15deg)" }}></i>
                                </div>
                                <h6 className="mb-0">{contactDetails.address}</h6>
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="bg-light rounded d-flex flex-column align-items-center justify-content-center text-center" style={{ height: "200px" }}>
                                <div className="d-flex align-items-center justify-content-center icon_bg rounded-circle mb-4" style={{ width: "100px", height: "70px", transform: "rotate(-15deg)" }}>
                                    <i className="fa-solid fa-phone-flip fa-2x text-white" style={{ transform: "rotate(15deg)" }}></i>
                                </div>
                                <h6 className="mb-0">{contactDetails.phone}</h6>
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="bg-light rounded d-flex flex-column align-items-center justify-content-center text-center" style={{ height: "200px" }}>
                                <div className="d-flex align-items-center justify-content-center icon_bg rounded-circle mb-4" style={{ width: "100px", height: "70px", transform: "rotate(-15deg)" }}>
                                    <i className="fa-solid fa-envelope-open fa-2x text-white" style={{ transform: "rotate(15deg)" }}></i>
                                </div>
                                <h6 className="mb-0">{contactDetails.email}</h6>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12" style={{ height: "500px" }}>
                            <div className="position-relative h-100">
                                <iframe className="position-relative w-100 h-100"
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3001156.4288297426!2d-78.01371936852176!3d42.72876761954724!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4ccc4bf0f123a5a9%3A0xddcfc6c1de189567!2sNew%20York%2C%20USA!5e0!3m2!1sen!2sbd!4v1603794290143!5m2!1sen!2sbd"
                                    frameborder="0" style={{ border: 0 }} allowfullscreen="" aria-hidden="false"
                                    tabindex="0"></iframe>
                            </div>
                        </div>
                    </div>
                    <div className="row justify-content-center position-relative" style={{ marginTop: "-200px", zIndex: 1 }}>
                        <div className="col-lg-8">
                            <div className="bg-white rounded p-5 m-5 mb-0">
                                <CForm onSubmit={handleSubmit} noValidate validated={validated}>
                                    <div className="row g-3">
                                        <div className="col-12 col-sm-6">
                                            <CFormInput
                                                type="text"
                                                className="form-control bg-light light_border is_not_validated"
                                                value={credential.name}
                                                onChange={(e) => setCredential({ ...credential, name: e.target.value })}
                                                required={true}
                                                feedbackInvalid="Name is required."
                                                placeholder="Your Name"
                                                style={{ height: "55px" }}
                                            />
                                        </div>
                                        <div className="col-12 col-sm-6">
                                            <CFormInput
                                                type="text"
                                                className="form-control bg-light light_border is_not_validated"
                                                required={true}
                                                placeholder="Phone"
                                                maxlength="13"
                                                minlength="10"
                                                value={credential.phone_number}
                                                onChange={(e) => {
                                                    const inputValue = e.target.value;
                                                    const numericValue = inputValue.replace(/[^\d+]/g, '');
                                                    setCredential({ ...credential, phone_number: numericValue })
                                                }}
                                                feedbackInvalid='Enter valid phone number'
                                                style={{ height: "55px" }}
                                            />
                                        </div>
                                        <div className="col-12">
                                            <CFormTextarea
                                                type="text"
                                                className="form-control bg-light light_border is_not_validated"
                                                rows={5}
                                                value={credential.message}
                                                onChange={(e) => setCredential({ ...credential, message: e.target.value })}
                                                required={true}
                                                feedbackInvalid="Message is required."
                                                placeholder="Message"
                                            />
                                        </div>
                                        <div className="col-12">
                                            <button className="btn btn-primary w-100 py-3" type="submit">Send Message</button>
                                        </div>
                                    </div>
                                </CForm>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* <!-- Contact End --> */}

            <Footer />

        </div>
    )
}

export default ContactUs