import { useContext, createContext } from "react";
import { baseURL } from "../lib";
import { useAuth } from "./AuthContext";
import axios from 'axios'

const AppointmentContext = createContext()

const AppointmentProvider = ({ children }) => {

    const { auth, toast } = useAuth();

    const headers = {
        Authorization: auth?.token,
    };

    const getAllAppointment = async (currentPage, rowsPerPage, sortField, sortOrder, filter, statusFilter) => {
        try {
            let url = `${baseURL}/appointment/user-appointments?page=${currentPage}&limit=${rowsPerPage}&sortOrder=${sortOrder}&sortField=${sortField}&filter=${filter}`;

            if (statusFilter) {
                url += `&statusFilter=${statusFilter}`;
            }

            let { data } = await axios.get(url, { headers });

            if (data.error === false) {
                return data;
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Appointment',
                detail: 'An error occurred. Please try again later.',
                life: 3000
            });
        }
    };

    const createAppointment = async (appointmentDetail) => {
        try {
            const { data } = await axios.post(`${baseURL}/appointment/create`, appointmentDetail, { headers });
            if (data.error === false) {
                setTimeout(function () {
                    toast.current?.show({ severity: 'success', summary: 'Appointment', detail: data.message, life: 3000 })
                }, 500);
                return data
            } else {
                toast.current?.show({ severity: 'error', summary: 'Appointment', detail: data.message, life: 3000 })
            }
        } catch (error) {
            if (error.response) {
                const errors = error.response.data.errors;
                if (errors && Array.isArray(errors) && errors.length > 0) {
                    toast.current?.show({ severity: 'error', summary: 'Appointment', detail: errors[0].msg, life: 3000 })
                }
            } else {
                toast.current?.show({ severity: 'error', summary: 'Appointment', detail: 'An error occurred. Please try again later.', life: 3000 })
            }
        }
    }

    const getSingleAppointment = async (id) => {
        try {
            let { data } = await axios.get(`${baseURL}/appointment/get-appointment/${id}`, { headers })
            if (data.error === false) {
                return data.data
            }
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Appointment', detail: 'An error occurred. Please try again later.', life: 3000 })
        }
    }

    const getAppointmentSlots = async (id, date) => {
        try {
            let { data } = await axios.get(`${baseURL}/appointment/get-slots/${id}?date=${date}`, { headers })
            if (data.error === false) {
                return data
            }
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Appointment', detail: 'An error occurred. Please try again later.', life: 3000 })
        }
    }

    const updateAppointmentStatus = async (id) => {
        try {
            const { data } = await axios.put(`${baseURL}/appointment/update-status/${id}`, { headers });
            if (data.error === false) {
                setTimeout(function () {
                    toast.current?.show({ severity: 'success', summary: 'Appointment', detail: data.message, life: 3000 })
                }, 500);
                return data
            } else {
                toast.current?.show({ severity: 'error', summary: 'Appointment', detail: data.message, life: 3000 })
            }
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Appointment', detail: 'An error occurred. Please try again later.', life: 3000 })
        }
    }

    const updateAppointment = async (id, appointmentDetail) => {
        try {
            const { data } = await axios.put(`${baseURL}/appointment/update/${id}`, appointmentDetail, { headers });
            if (data.error === false) {
                setTimeout(function () {
                    toast.current?.show({ severity: 'success', summary: 'Appointment', detail: data.message, life: 3000 })
                }, 500);
                return data
            } else {
                toast.current?.show({ severity: 'error', summary: 'Appointment', detail: data.message, life: 3000 })
            }
        } catch (error) {
            if (error.response) {
                const errors = error.response.data.errors;
                if (errors && Array.isArray(errors) && errors.length > 0) {
                    if (errors.length > 1) {
                        toast.current?.show({ severity: 'error', summary: 'Appointment', detail: "Please fill all mandatory fields.", life: 3000 })
                    } else {
                        toast.current?.show({ severity: 'error', summary: 'Appointment', detail: errors[0].msg, life: 3000 })
                    }
                }
            } else {
                toast.current?.show({ severity: 'error', summary: 'Appointment', detail: 'An error occurred. Please try again later.', life: 3000 })
            }
        }
    }

    const cancelAppointment = async (id, appointmentDetail) => {
        try {
            const { data } = await axios.put(`${baseURL}/appointment/cancel-appointment/${id}`, appointmentDetail, { headers });
            if (data.error === false) {
                setTimeout(function () {
                    toast.current?.show({ severity: 'success', summary: 'Appointment', detail: data.message, life: 3000 })
                }, 500);
                return data
            } else {
                toast.current?.show({ severity: 'error', summary: 'Appointment', detail: data.message, life: 3000 })
            }
        } catch (error) {
            if (error.response) {
                const errors = error.response.data.errors;
                if (errors && Array.isArray(errors) && errors.length > 0) {
                    if (errors.length > 1) {
                        toast.current?.show({ severity: 'error', summary: 'Appointment', detail: "Please fill all mandatory fields.", life: 3000 })
                    } else {
                        toast.current?.show({ severity: 'error', summary: 'Appointment', detail: errors[0].msg, life: 3000 })
                    }
                }
            } else {
                toast.current?.show({ severity: 'error', summary: 'Appointment', detail: 'An error occurred. Please try again later.', life: 3000 })
            }
        }
    }

    return (
        <AppointmentContext.Provider value={{ getAllAppointment, createAppointment, getSingleAppointment, updateAppointment, updateAppointmentStatus, cancelAppointment, getAppointmentSlots }}>
            {children}
        </AppointmentContext.Provider>
    )
}

const useAppointment = () => useContext(AppointmentContext);

export { useAppointment, AppointmentProvider }