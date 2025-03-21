import { useContext, createContext } from "react";
import { baseURL } from "../lib";
import { useAuth } from "./AuthContext";
import axios from 'axios'

const UserContext = createContext()

const UserProvider = ({ children }) => {

    const { auth, toast } = useAuth();

    const headers = {
        Authorization: auth?.token,
    };

    const getAllUsers = async (currentPage, rowsPerPage, sortField, sortOrder, filter, isActiveUsers) => {
        try {
            let { data } = await axios.get(`${baseURL}/user?page=${currentPage}&limit=${rowsPerPage}&sortOrder=${sortOrder}
                                             &sortField=${sortField}&filter=${filter}&isActiveUsers=${isActiveUsers}`, { headers })
            if (data.error === false) {
                return data
            }
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'User', detail: 'An error occurred. Please try again later.', life: 3000 })
        }
    }

    const getAllActions = async (currentPage, rowsPerPage, sortField, sortOrder, filter) => {
        try {
            let { data } = await axios.get(`${baseURL}/user/actions?page=${currentPage}&limit=${rowsPerPage}&sortOrder=${sortOrder}
                                             &sortField=${sortField}&filter=${filter}`, { headers })
            if (data.error === false) {
                return data
            }
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Actions', detail: 'An error occurred. Please try again later.', life: 3000 })
        }
    }

    const getAllDoctors = async (clinicId) => {
        try {
            let { data } = await axios.get(`${baseURL}/user/doctors/${clinicId}`, { headers })
            if (data.error === false) {
                return data
            }
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'User', detail: 'An error occurred. Please try again later.', life: 3000 })
        }
    }

    const getSingleUser = async (id) => {
        try {
            let { data } = await axios.get(`${baseURL}/user/get-user/${id}`, { headers })
            if (data.error === false) {
                return data.data
            }
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'User', detail: 'An error occurred. Please try again later.', life: 3000 })
        }
    }

    const createUser = async (userDetail) => {
        try {
            const { data } = await axios.post(`${baseURL}/user/create`, userDetail, { headers });
            if (data.error === false) {
                setTimeout(function () {
                    toast.current?.show({ severity: 'success', summary: 'User', detail: data.message, life: 3000 })
                }, 500);
                return data
            } else {
                toast.current?.show({ severity: 'error', summary: 'User', detail: data.message, life: 3000 })
            }
        } catch (error) {
            if (error.response) {
                const errors = error.response.data.errors;
                if (errors && Array.isArray(errors) && errors.length > 0) {
                    toast.current?.show({ severity: 'error', summary: 'User', detail: errors[0].msg, life: 3000 })
                }
            } else {
                toast.current?.show({ severity: 'error', summary: 'User', detail: 'An error occurred. Please try again later.', life: 3000 })
            }
        }
    }

    const updateUser = async (id, userDetail) => {
        try {
            const { data } = await axios.put(`${baseURL}/user/update/${id}`, userDetail, { headers });
            if (data.error === false) {
                setTimeout(function () {
                    toast.current?.show({ severity: 'success', summary: 'User', detail: data.message, life: 3000 })
                }, 500);
                return data
            } else {
                toast.current?.show({ severity: 'error', summary: 'User', detail: data.message, life: 3000 })
            }
        } catch (error) {
            if (error.response) {
                const errors = error.response.data.errors;
                if (errors && Array.isArray(errors) && errors.length > 0) {
                    if (errors.length > 1) {
                        toast.current?.show({ severity: 'error', summary: 'User', detail: "Please fill all mandatory fields.", life: 3000 })
                    } else {
                        toast.current?.show({ severity: 'error', summary: 'User', detail: errors[0].msg, life: 3000 })
                    }
                }
            } else {
                toast.current?.show({ severity: 'error', summary: 'User', detail: 'An error occurred. Please try again later.', life: 3000 })
            }
        }
    }

    const updatePassword = async (id, newPassword) => {
        try {
            const { data } = await axios.put(`${baseURL}/user/update/password/${id}`, { password: newPassword }, { headers });
            if (data.error === false) {
                setTimeout(function () {
                    toast.current?.show({ severity: 'success', summary: 'Users', detail: data.message, life: 3000 })
                }, 500);
                return data
            } else {
                toast.current?.show({ severity: 'error', summary: 'Users', detail: data.message, life: 3000 })
            }
        } catch (error) {
            if (error.response) {
                const errors = error.response.data.errors;
                if (errors && Array.isArray(errors) && errors.length > 0) {
                    toast.current?.show({ severity: 'error', summary: 'Users', detail: errors[0].msg, life: 3000 })
                }
            } else {
                toast.current?.show({ severity: 'error', summary: 'Users', detail: 'An error occurred. Please try again later.', life: 3000 })
            }
        }
    }

    const deleteUser = async (id) => {
        try {
            const { data } = await axios.delete(`${baseURL}/user/delete/${id}`, { headers });
            if (data.error === false) {
                setTimeout(function () {
                    toast.current?.show({ severity: 'success', summary: 'User', detail: data.message, life: 3000 })
                }, 500);
                return data
            } else {
                toast.current?.show({ severity: 'error', summary: 'User', detail: data.message, life: 3000 })
            }
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'User', detail: 'An error occurred. Please try again later.', life: 3000 })
        }
    }

    return (
        <UserContext.Provider value={{ getAllUsers, getAllActions, getAllDoctors, getSingleUser, createUser, updateUser, updatePassword, deleteUser }}>
            {children}
        </UserContext.Provider>
    )
}

const useUser = () => useContext(UserContext)

export { useUser, UserProvider }