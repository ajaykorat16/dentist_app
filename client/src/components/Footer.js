import React from 'react'
import { contactDetails } from '../lib'

const Footer = () => {
    return (
        <>
            {/* <!-- Footer Start --> */}
            <div className="container-fluid footer_bg text-light mt-5 py-5">
                <div className="container py-5">
                    <div className="row g-5 justify-content-end">
                        <div className="col-lg-3 col-md-6">
                            <h4 className="d-inline-block text-primary text-uppercase border-bottom border-5 border-secondary mb-4">Get In Touch</h4>
                            <p className="mb-4">No dolore ipsum accusam no lorem. Invidunt sed clita kasd clita et et dolor sed dolor</p>
                            <p className="mb-2"><i className="fa-solid fa-map-marker-alt text-primary me-3"></i>{contactDetails.address}</p>
                            <p className="mb-2"><i className="fa-solid fa-envelope text-primary me-3"></i>{contactDetails.email}</p>
                            <p className="mb-0"><i className="fa-solid fa-phone-alt text-primary me-3"></i>{contactDetails.phone}</p>
                        </div>
                    </div>
                </div>
            </div>
            {/* <!-- Footer End --> */}
        </>
    )
}

export default Footer