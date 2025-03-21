import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { copanyName } from '../lib';

const Navbar = () => {
    const { auth, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div className="container-fluid sticky-top bg-white shadow-sm">
            <div className="container">
                <nav className="navbar navbar-expand-lg bg-white navbar-light py-3 py-lg-0">
                    <Link to="/" className="navbar-brand">
                        <h1 className="m-0 text-uppercase text-primary"><i className="fa-solid fa-house-medical me-2"></i>{copanyName}</h1>
                    </Link>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarCollapse">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarCollapse">
                        <div className="navbar-nav ms-auto py-0">
                            <Link
                                to="/"
                                className={`nav-item nav-link ${isActive('/') ? 'active' : ''}`}
                            >
                                Home
                            </Link>
                            {auth?.token ? (
                                <>
                                    <Link
                                        to="/user/appointments"
                                        className={`nav-item nav-link ${isActive('/user/appointments') ? 'active' : ''}`}
                                    >
                                        Appointments
                                    </Link>
                                    <div className="nav-item dropdown">
                                        <Link
                                            className="nav-link dropdown-toggle"
                                            data-bs-toggle="dropdown"
                                        >
                                            {auth?.user?.first_name}
                                        </Link>
                                        <div className="dropdown-menu m-0">
                                            <button
                                                className="dropdown-item"
                                                onClick={handleLogout}
                                            >
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <Link
                                    to="/login"
                                    className={`nav-item nav-link ${isActive('/login') ? 'active' : ''}`}
                                >
                                    Login
                                </Link>
                            )}
                            <Link
                                to="/contact-us"
                                className={`nav-item nav-link ${isActive('/contact-us') ? 'active' : ''}`}
                            >
                                Contact
                            </Link>
                        </div>
                    </div>
                </nav>
            </div>
        </div>
    );
};

export default Navbar;
