import React from 'react'
import { contactDetails } from '../lib'

const Footer = () => {
    return (
        <>
            {/* <!-- Footer Start --> */}
            <div className="container-fluid footer_bg text-light mt-5 py-5">
                <div className="container py-5">
                    <div className="row g-5 justify-content-between">
                        <div className="col-lg-3 col-md-6">
                            <h4 className="d-inline-block text-primary text-uppercase border-bottom border-5 border-secondary mb-4">Get In Touch</h4>
                            <p className="mb-0">Dentify, an valication allows you to effortlessly bock medical appointments online, connect with experienced healthcare professionals, and manage their health records, all in a user-friendly platform.</p>

                        </div>
                        <div className="col-lg-3 col-md-6">
                            <p className="mb-2"><i className="fa-solid fa-map-marker-alt text-primary me-3"></i>{contactDetails.address}</p>
                            <p className="mb-2"><i className="fa-solid fa-envelope text-primary me-3"></i>{contactDetails.email}</p>
                        </div>
                    </div>
                </div>
            </div>
            {/* <!-- Footer End --> */}
        </>
    )
}

export default Footer