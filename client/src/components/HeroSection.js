import React from 'react'
import { Link } from 'react-router-dom'
import { HashLink } from 'react-router-hash-link'
import { useAuth } from '../contexts/AuthContext'
import { copanyName } from '../lib'

const HeroSection = () => {
    const {auth} = useAuth()

    return (
        <div className="container-fluid bg-primary py-5 mb-5 hero-header">
            <div className="container py-5">
                <div className="row justify-content-start">
                    <div className="col-lg-8 text-center text-lg-start">
                        <h5 className="d-inline-block text-primary text-uppercase border-bottom border-5 custom-border">
                            Welcome To {copanyName}
                        </h5>
                        <h1 className="display-1 text-white mb-md-4">
                            Best Dentalcare Solution In Your City
                        </h1>
                        <div className="pt-2">
                            <HashLink
                                smooth
                                to="#doctors"
                                className="btn btn-light rounded-pill py-md-3 px-md-5 mx-2"
                            >
                                Find Doctor
                            </HashLink>
                            <Link
                                to={auth?.token ? `/user/appointments` : '/login'}
                                className="btn btn-outline-light rounded-pill py-md-3 px-md-5 mx-2"
                            >
                                My Appointments
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HeroSection