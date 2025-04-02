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

            {/* <!-- Team Start --> */}
            <div className="container-fluid py-5" id='doctors'>
                <div className="container">
                    <div className="text-center mx-auto mb-5" style={{ maxWidth: "500px" }}>
                        <h5 className="d-inline-block text-primary text-uppercase border-bottom border-5">
                            Our Clinics
                        </h5>
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
                                                    src={clinic.image || "/images/blog-2.jpg"}
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