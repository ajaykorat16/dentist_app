import React, { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { Toast } from 'primereact/toast';
import { HashLink } from "react-router-hash-link";
import Footer from '../components/Footer';
import HeroSection from '../components/HeroSection';

const DoctorList = () => {
    const params = useParams();
    const { getAllDoctors } = useUser();
    const { auth, toast } = useAuth();

    const [doctors, setDoctors] = useState([]);

    const fetchDoctors = async () => {
        const clinicId = params.id
        const data = await getAllDoctors(clinicId);
        if (!data.error) {
            setDoctors(data.data);
        }
    };

    useEffect(() => {
        fetchDoctors();
    }, []);

    return (
        <div className="home-page">
            {/* Navbar */}
            <Navbar />
            <Toast ref={toast} />

            {/* Hero Section */}
            <HeroSection />

            {/* Doctors Section */}
            <div className="container-fluid py-5" id="doctors">
                <div className="container">
                    <div className="text-center mx-auto mb-5" style={{ maxWidth: "500px" }}>
                        <h5 className="d-inline-block text-primary text-uppercase border-bottom border-5">
                            Our Doctors
                        </h5>
                        <h1 className="display-4">Meet Our Experienced Doctors</h1>
                    </div>

                    <div className="row">
                        {doctors && doctors.length > 0 ? (
                            doctors.map((doctor) => (
                                <div className="col-md-4 col-sm-6 mb-4" key={doctor.id}>
                                    <Link to={auth?.token ? `/user/appointment/${doctor.id}` : '/login'} className="card border-0 shadow-sm text-decoration-none ">
                                        <img
                                            src={doctor.photo || "/images/team-1.jpg"}
                                            alt={`${doctor.first_name} ${doctor.last_name}`}
                                            className="card-img-top"
                                            style={{
                                                height: "250px",
                                                objectFit: "contain",
                                                backgroundColor: "#f8f9fa",
                                                padding: "10px",
                                            }}
                                        />
                                        <div className="card-body text-center">
                                            <h5 className="card-title">
                                                {`${doctor.first_name} ${doctor.last_name}`}
                                            </h5>
                                            <h6 className="card-subtitle text-primary mb-3">
                                                {doctor.degree || "Specialist"}
                                            </h6>
                                            <p className="card-text">
                                                Experienced in providing high-quality care and ensuring patient satisfaction.
                                            </p>
                                        </div>
                                    </Link>
                                </div>
                            ))
                        ) : (
                            <div className="text-center">
                                <p>No doctors available at the moment. Please check back later.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default DoctorList;
