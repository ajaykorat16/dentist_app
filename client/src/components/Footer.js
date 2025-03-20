import React from 'react'

const Footer = () => {
    return (
        <>
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
        </>
    )
}

export default Footer