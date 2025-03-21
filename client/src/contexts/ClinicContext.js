import { useContext, createContext } from "react";
import { baseURL } from "../lib";
import { useAuth } from "./AuthContext";
import axios from 'axios'

const ClinicContext = createContext()

const ClinicProvider = ({ children }) => {

    const { auth, toast } = useAuth();

    const headers = {
        Authorization: auth?.token,
    };

    const getAllClinics = async (currentPage, rowsPerPage, sortField, sortOrder, filter) => {
        try {
            let { data } = await axios.get(`${baseURL}/clinic?page=${currentPage}&limit=${rowsPerPage}&sortOrder=${sortOrder}&sortField=${sortField}&filter=${filter}`, { headers })
            if (data.error === false) {
                return data
            }
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Clinic', detail: 'An error occurred. Please try again later.', life: 3000 })
        }
    }
    const getClinicsWithoutPagination = async () => {
        try {
            let { data } = await axios.get(`${baseURL}/clinic/without-pagination`)
            if (data.error === false) {
                return data
            }
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Clinic', detail: 'An error occurred. Please try again later.', life: 3000 })
        }
    }

    const getSingleClinic = async (id) => {
        try {
            let { data } = await axios.get(`${baseURL}/clinic/${id}`, { headers })
            if (data.error === false) {
                return data.data
            }
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Clinic', detail: 'An error occurred. Please try again later.', life: 3000 })
        }
    }

    const createClinic = async (clinicDetail) => {
        try {
            const { data } = await axios.post(`${baseURL}/clinic/create`, clinicDetail, { headers });
            if (data.error === false) {
                setTimeout(function () {
                    toast.current?.show({ severity: 'success', summary: 'Clinic', detail: data.message, life: 3000 })
                }, 500);
                return data
            } else {
                toast.current?.show({ severity: 'error', summary: 'Clinic', detail: data.message, life: 3000 })
            }
        } catch (error) {
            if (error.response) {
                const errors = error.response.data.errors;
                if (errors && Array.isArray(errors) && errors.length > 0) {
                    toast.current?.show({ severity: 'error', summary: 'Clinic', detail: errors[0].msg, life: 3000 })
                }
            } else {
                toast.current?.show({ severity: 'error', summary: 'Clinic', detail: 'An error occurred. Please try again later.', life: 3000 })
            }
        }
    }

    const updateClinic = async (id, clinicDetail) => {
        try {
            const { data } = await axios.put(`${baseURL}/clinic/update/${id}`, clinicDetail, { headers });
            if (data.error === false) {
                setTimeout(function () {
                    toast.current?.show({ severity: 'success', summary: 'Clinic', detail: data.message, life: 3000 })
                }, 500);
                return data
            } else {
                toast.current?.show({ severity: 'error', summary: 'Clinic', detail: data.message, life: 3000 })
            }
        } catch (error) {
            if (error.response) {
                const errors = error.response.data.errors;
                if (errors && Array.isArray(errors) && errors.length > 0) {
                    if (errors.length > 1) {
                        toast.current?.show({ severity: 'error', summary: 'Clinic', detail: "Please fill all mandatory fields.", life: 3000 })
                    } else {
                        toast.current?.show({ severity: 'error', summary: 'Clinic', detail: errors[0].msg, life: 3000 })
                    }
                }
            } else {
                toast.current?.show({ severity: 'error', summary: 'Clinic', detail: 'An error occurred. Please try again later.', life: 3000 })
            }
        }
    }

    const deleteClinic = async (id) => {
        try {
            const { data } = await axios.delete(`${baseURL}/clinic/delete/${id}`, { headers });
            if (data.error === false) {
                setTimeout(function () {
                    toast.current?.show({ severity: 'success', summary: 'Clinic', detail: data.message, life: 3000 })
                }, 500);
                return data
            } else {
                toast.current?.show({ severity: 'error', summary: 'Clinic', detail: data.message, life: 3000 })
            }
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Clinic', detail: 'An error occurred. Please try again later.', life: 3000 })
        }
    }

    return (
        <ClinicContext.Provider value={{ getAllClinics, getSingleClinic, getClinicsWithoutPagination, createClinic, updateClinic, deleteClinic }}>
            {children}
        </ClinicContext.Provider>
    )
}

const useClinic = () => useContext(ClinicContext)

export { useClinic, ClinicProvider }