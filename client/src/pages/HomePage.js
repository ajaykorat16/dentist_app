import React, { useEffect, useState } from 'react'
import "owl.carousel/dist/assets/owl.carousel.css";
import "owl.carousel/dist/assets/owl.theme.default.css";
import OwlCarousel from "react-owl-carousel";
import { useUser } from '../contexts/UserContext';
import 'primeicons/primeicons.css';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar'
import { useAuth } from '../contexts/AuthContext';
import { Toast } from 'primereact/toast';
import { HashLink } from "react-router-hash-link";
import Footer from '../components/Footer';

const HomePage = () => {
    const { getAllDoctors } = useUser()
    const { auth, toast } = useAuth()

    const [doctors, setDoctors] = useState([])
    const [doctorVisible, setDoctorVisible] = useState(false)
    const [options, setOptions] = useState({
        loop: true,
        margin: 10,
        nav: true,
        dots: true,
        autoplay: true,
        autoplayTimeout: 3000,
        responsive: {
            0: { items: 1 },
            768: { items: 2 },
            1000: { items: 2 },
        },
    })

    const fetchDoctors = async () => {
        const data = await getAllDoctors()

        if (!data.error) {
            setDoctors(data.data)
            setDoctorVisible(true)

            const doctorCount = data?.data?.length;

            setOptions({
                loop: doctorCount > 1,
                margin: 10,
                nav: true,
                dots: true,
                autoplay: doctorCount > 1,
                autoplayTimeout: 3000,
                responsive: {
                    0: { items: Math.min(doctorCount, 1) },
                    768: { items: Math.min(doctorCount, 2) },
                    1000: { items: Math.min(doctorCount, 2) },
                },
            });

        }
    }

    useEffect(() => {
        fetchDoctors()
    }, [])

    return (
        <div className='home-page'>
            {/* // <!-- Navbar Start --> */}
            <Navbar />
            <Toast ref={toast} />
            {/* // <!-- Navbar End --> */}


            {/* // <!-- Hero Start --> */}
            <div className="container-fluid bg-primary py-5 mb-5 hero-header">
                <div className="container py-5">
                    <div className="row justify-content-start">
                        <div className="col-lg-8 text-center text-lg-start">
                            <h5 className="d-inline-block text-primary text-uppercase border-bottom border-5 custom-border">Welcome To Medinova</h5>
                            <h1 className="display-1 text-white mb-md-4">Best Healthcare Solution In Your City</h1>
                            <div className="pt-2">
                                <HashLink smooth to="#doctors" className="btn btn-light rounded-pill py-md-3 px-md-5 mx-2">Find Doctor</HashLink>
                                <Link to={auth?.token ? `/user/appointments`: '/login'} className="btn btn-outline-light rounded-pill py-md-3 px-md-5 mx-2">My Appointments</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* // <!-- Hero End --> */}

            {/* <!-- Services Start --> */}
            <div className="container-fluid py-5">
                <div className="container">
                    <div className="text-center mx-auto mb-5" style={{ maxWidth: '500px' }}>
                        <h5 className="d-inline-block text-primary text-uppercase border-bottom border-5">Services</h5>
                        <h1 className="display-4">Excellent Medical Services</h1>
                    </div>
                    <div className="row g-5">
                        <div className="col-lg-4 col-md-6">
                            <div className="service-item bg-light rounded d-flex flex-column align-items-center justify-content-center text-center">
                                <div className="service-icon mb-4">
                                    <i class="fa-solid fa-2x fa-user-doctor text-white"></i>
                                </div>
                                <h4 className="mb-3">Emergency Care</h4>
                                <p className="m-0">Kasd dolor no lorem nonumy sit labore tempor at justo rebum rebum stet, justo elitr dolor amet sit</p>
                                <a className="btn btn-lg btn-primary rounded-pill" href="">
                                    <i className="bi-solid bi-arrow-right"></i>
                                </a>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6">
                            <div className="service-item bg-light rounded d-flex flex-column align-items-center justify-content-center text-center">
                                <div className="service-icon mb-4">
                                    <i className="fa-solid fa-2x fa-procedures text-white"></i>
                                </div>
                                <h4 className="mb-3">Operation & Surgery</h4>
                                <p className="m-0">Kasd dolor no lorem nonumy sit labore tempor at justo rebum rebum stet, justo elitr dolor amet sit</p>
                                <a className="btn btn-lg btn-primary rounded-pill" href="">
                                    <i className="bi bi-arrow-right"></i>
                                </a>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6">
                            <div className="service-item bg-light rounded d-flex flex-column align-items-center justify-content-center text-center">
                                <div className="service-icon mb-4">
                                    <i className="fa-solid fa-2x fa-stethoscope text-white"></i>
                                </div>
                                <h4 className="mb-3">Outdoor Checkup</h4>
                                <p className="m-0">Kasd dolor no lorem nonumy sit labore tempor at justo rebum rebum stet, justo elitr dolor amet sit</p>
                                <a className="btn btn-lg btn-primary rounded-pill" href="">
                                    <i className="bi bi-arrow-right"></i>
                                </a>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6">
                            <div className="service-item bg-light rounded d-flex flex-column align-items-center justify-content-center text-center">
                                <div className="service-icon mb-4">
                                    <i className="fa-solid fa-2x fa-ambulance text-white"></i>
                                </div>
                                <h4 className="mb-3">Ambulance Service</h4>
                                <p className="m-0">Kasd dolor no lorem nonumy sit labore tempor at justo rebum rebum stet, justo elitr dolor amet sit</p>
                                <a className="btn btn-lg btn-primary rounded-pill" href="">
                                    <i className="bi bi-arrow-right"></i>
                                </a>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6">
                            <div className="service-item bg-light rounded d-flex flex-column align-items-center justify-content-center text-center">
                                <div className="service-icon mb-4">
                                    <i className="fa-solid fa-2x fa-pills text-white"></i>
                                </div>
                                <h4 className="mb-3">Medicine & Pharmacy</h4>
                                <p className="m-0">Kasd dolor no lorem nonumy sit labore tempor at justo rebum rebum stet, justo elitr dolor amet sit</p>
                                <a className="btn btn-lg btn-primary rounded-pill" href="">
                                    <i className="bi bi-arrow-right"></i>
                                </a>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6">
                            <div className="service-item bg-light rounded d-flex flex-column align-items-center justify-content-center text-center">
                                <div className="service-icon mb-4">
                                    <i className="fa-solid fa-2x fa-microscope text-white"></i>
                                </div>
                                <h4 className="mb-3">Blood Testing</h4>
                                <p className="m-0">Kasd dolor no lorem nonumy sit labore tempor at justo rebum rebum stet, justo elitr dolor amet sit</p>
                                <a className="btn btn-lg btn-primary rounded-pill" href="">
                                    <i className="bi bi-arrow-right"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* <!-- Services End --> */}

            {/* <!-- Team Start --> */}
            <div className="container-fluid py-5" id='doctors'>
                <div className="container">
                    <div className="text-center mx-auto mb-5" style={{ maxWidth: "500px" }}>
                        <h5 className="d-inline-block text-primary text-uppercase border-bottom border-5">
                            Our Doctors
                        </h5>
                        <h1 className="display-4">Qualified Healthcare Professionals</h1>
                    </div>
                    {doctorVisible && (
                        <OwlCarousel className="owl-theme" {...options}>
                            {doctors && doctors.length > 0 && (
                                doctors.map((doctor) => (
                                    <Link to={auth?.token ? `/user/appointment/${doctor?.id}` : '/login'} key={doctor?.id} className="team-item">
                                        <div className="row g-0 bg-light rounded overflow-hidden">
                                            <div className="col-12 col-sm-5 h-100">
                                                <img
                                                    className="img-fluid h-100 w-auto"
                                                    src={doctor.photo || "/images/team-1.jpg"}
                                                    alt={`${doctor.first_name} ${doctor.last_name}`}
                                                    style={{ objectFit: "cover" }}
                                                />
                                            </div>
                                            <div className="col-12 col-sm-7 h-100 d-flex flex-column">
                                                <div className="mt-3 p-4">
                                                    <h3>{`${doctor.first_name} ${doctor.last_name}`}</h3>
                                                    <h6 className="fw-normal fst-italic text-primary mb-4">
                                                        {doctor.degree || "Specialist"}
                                                    </h6>
                                                    <p className="m-0">
                                                        Experienced in providing high-quality care and ensuring patient satisfaction.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </OwlCarousel>
                    )}
                </div>
            </div>
            {/* <!-- Team End --> */}


            <Footer/>

            {/* <!-- Back to Top --> */}
            {/* <a href="#" className="btn btn-lg btn-primary btn-lg-square back-to-top"><i className="bi bi-arrow-up"></i></a> */}
        </div >

    )
}

export default HomePage