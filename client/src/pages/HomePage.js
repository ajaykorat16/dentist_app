import React, { useEffect, useState } from 'react'
import "owl.carousel/dist/assets/owl.carousel.css";
import "owl.carousel/dist/assets/owl.theme.default.css";
import OwlCarousel from "react-owl-carousel";
import 'primeicons/primeicons.css';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar'
import { useAuth } from '../contexts/AuthContext';
import { Toast } from 'primereact/toast';
import { HashLink } from "react-router-hash-link";
import Footer from '../components/Footer';
import { useClinic } from '../contexts/ClinicContext';
import HeroSection from '../components/HeroSection';

const HomePage = () => {
    const { getClinicsWithoutPagination } = useClinic()
    const { auth, toast } = useAuth()

    const [clinics, setClinics] = useState([])
    const [clinicVisible, setClinicVisible] = useState(false)
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

    const ftechClinics = async () => {
        const data = await getClinicsWithoutPagination()

        if (!data.error) {
            setClinics(data.data)
            setClinicVisible(true)

            const clinicCount = data?.data?.length;

            setOptions({
                loop: clinicCount > 1,
                margin: 10,
                nav: true,
                dots: true,
                autoplay: clinicCount > 1,
                autoplayTimeout: 3000,
                responsive: {
                    0: { items: Math.min(clinicCount, 1) },
                    768: { items: Math.min(clinicCount, 2) },
                    1000: { items: Math.min(clinicCount, 2) },
                },
            });

        }
    }

    useEffect(() => {
        ftechClinics()
    }, [])

    return (
        <div className='home-page'>
            {/* // <!-- Navbar Start --> */}
            <Navbar />
            <Toast ref={toast} />
            {/* // <!-- Navbar End --> */}

            {/* // <!-- Hero Start --> */}
            <HeroSection />

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
                                    <i className="fa-solid fa-2x fa-user-doctor text-white"></i>
                                </div>
                                <h4 className="mb-3">Emergency Care</h4>
                                <p className="m-0">Kasd dolor no lorem nonumy sit labore tempor at justo rebum rebum stet, justo elitr dolor amet sit</p>
                                <Link className="btn btn-lg btn-primary rounded-pill" >
                                    <i className="bi-solid bi-arrow-right"></i>
                                </Link>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6">
                            <div className="service-item bg-light rounded d-flex flex-column align-items-center justify-content-center text-center">
                                <div className="service-icon mb-4">
                                    <i className="fa-solid fa-2x fa-procedures text-white"></i>
                                </div>
                                <h4 className="mb-3">Operation & Surgery</h4>
                                <p className="m-0">Kasd dolor no lorem nonumy sit labore tempor at justo rebum rebum stet, justo elitr dolor amet sit</p>
                                <Link className="btn btn-lg btn-primary rounded-pill" >
                                    <i className="bi bi-arrow-right"></i>
                                </Link>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6">
                            <div className="service-item bg-light rounded d-flex flex-column align-items-center justify-content-center text-center">
                                <div className="service-icon mb-4">
                                    <i className="fa-solid fa-2x fa-stethoscope text-white"></i>
                                </div>
                                <h4 className="mb-3">Outdoor Checkup</h4>
                                <p className="m-0">Kasd dolor no lorem nonumy sit labore tempor at justo rebum rebum stet, justo elitr dolor amet sit</p>
                                <Link className="btn btn-lg btn-primary rounded-pill" >
                                    <i className="bi bi-arrow-right"></i>
                                </Link>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6">
                            <div className="service-item bg-light rounded d-flex flex-column align-items-center justify-content-center text-center">
                                <div className="service-icon mb-4">
                                    <i className="fa-solid fa-2x fa-ambulance text-white"></i>
                                </div>
                                <h4 className="mb-3">Ambulance Service</h4>
                                <p className="m-0">Kasd dolor no lorem nonumy sit labore tempor at justo rebum rebum stet, justo elitr dolor amet sit</p>
                                <Link className="btn btn-lg btn-primary rounded-pill" >
                                    <i className="bi bi-arrow-right"></i>
                                </Link>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6">
                            <div className="service-item bg-light rounded d-flex flex-column align-items-center justify-content-center text-center">
                                <div className="service-icon mb-4">
                                    <i className="fa-solid fa-2x fa-pills text-white"></i>
                                </div>
                                <h4 className="mb-3">Medicine & Pharmacy</h4>
                                <p className="m-0">Kasd dolor no lorem nonumy sit labore tempor at justo rebum rebum stet, justo elitr dolor amet sit</p>
                                <Link className="btn btn-lg btn-primary rounded-pill" >
                                    <i className="bi bi-arrow-right"></i>
                                </Link>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6">
                            <div className="service-item bg-light rounded d-flex flex-column align-items-center justify-content-center text-center">
                                <div className="service-icon mb-4">
                                    <i className="fa-solid fa-2x fa-microscope text-white"></i>
                                </div>
                                <h4 className="mb-3">Blood Testing</h4>
                                <p className="m-0">Kasd dolor no lorem nonumy sit labore tempor at justo rebum rebum stet, justo elitr dolor amet sit</p>
                                <Link className="btn btn-lg btn-primary rounded-pill" >
                                    <i className="bi bi-arrow-right"></i>
                                </Link>
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
                            Our Clinics
                        </h5>
                        <h1 className="display-4">Your Trusted Healthcare Clinics</h1>
                    </div>
                    {clinicVisible && (
                        <OwlCarousel className="owl-theme" {...options}>
                            {clinics && clinics.length > 0 && (
                                clinics.map((clinic) => (
                                    <Link to={`/clinic/${clinic?.id}`} key={clinic?.id} className="team-item">
                                        <div className="row g-0 bg-light rounded overflow-hidden">
                                            <div className="col-12 col-sm-5 h-100">
                                                <img
                                                    className="img-fluid h-100 w-auto"
                                                    src={clinic.photo || "/images/blog-2.jpg"}
                                                    alt={clinic.name}
                                                    style={{ objectFit: "cover" }}
                                                />
                                            </div>
                                            <div className="col-12 col-sm-7 h-100 d-flex flex-column">
                                                <div className="mt-3 p-4">
                                                    <h3>{clinic.name}</h3>

                                                    <p className="m-0 text-primary">
                                                        {clinic.address}
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

            <Footer />

            {/* <!-- Back to Top --> */}
            {/* <a href="#" className="btn btn-lg btn-primary btn-lg-square back-to-top"><i className="bi bi-arrow-up"></i></a> */}
        </div >

    )
}

export default HomePage