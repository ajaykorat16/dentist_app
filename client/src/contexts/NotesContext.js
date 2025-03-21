import { useContext, createContext } from "react";
import { baseURL } from "../lib";
import { useAuth } from "./AuthContext";
import axios from 'axios'

const NotesContext = createContext()

const NotesProvider = ({ children }) => {

    const { auth, toast } = useAuth();

    const headers = {
        Authorization: auth?.token,
    };

    const getAllNotes = async (currentPage, rowsPerPage, sortField, sortOrder, filter) => {
        try {
            let { data } = await axios.get(`${baseURL}/note?page=${currentPage}&limit=${rowsPerPage}&sortOrder=${sortOrder}&sortField=${sortField}&filter=${filter}`, { headers })
            if (data.error === false) {
                return data
            }
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Note', detail: 'An error occurred. Please try again later.', life: 3000 })
        }
    }

    const getSingleNote = async (id) => {
        try {
            let { data } = await axios.get(`${baseURL}/note/${id}`, { headers })
            if (data.error === false) {
                return data.data
            }
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Note', detail: 'An error occurred. Please try again later.', life: 3000 })
        }
    }

    const createNote = async (noteDetail) => {
        try {
            const { data } = await axios.post(`${baseURL}/note/create`, noteDetail, { headers });
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

    const updateNote = async (id, noteDetail) => {
        try {
            const { data } = await axios.put(`${baseURL}/note/update/${id}`, noteDetail, { headers });
            if (data.error === false) {
                setTimeout(function () {
                    toast.current?.show({ severity: 'success', summary: 'Note', detail: data.message, life: 3000 })
                }, 500);
                return data
            } else {
                toast.current?.show({ severity: 'error', summary: 'Note', detail: data.message, life: 3000 })
            }
        } catch (error) {
            if (error.response) {
                const errors = error.response.data.errors;
                if (errors && Array.isArray(errors) && errors.length > 0) {
                    if (errors.length > 1) {
                        toast.current?.show({ severity: 'error', summary: 'Note', detail: "Please fill all mandatory fields.", life: 3000 })
                    } else {
                        toast.current?.show({ severity: 'error', summary: 'Note', detail: errors[0].msg, life: 3000 })
                    }
                }
            } else {
                toast.current?.show({ severity: 'error', summary: 'Note', detail: 'An error occurred. Please try again later.', life: 3000 })
            }
        }
    }

    const deleteNote = async (id) => {
        try {
            const { data } = await axios.delete(`${baseURL}/note/delete/${id}`, { headers });
            if (data.error === false) {
                setTimeout(function () {
                    toast.current?.show({ severity: 'success', summary: 'Note', detail: data.message, life: 3000 })
                }, 500);
                return data
            } else {
                toast.current?.show({ severity: 'error', summary: 'Note', detail: data.message, life: 3000 })
            }
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Note', detail: 'An error occurred. Please try again later.', life: 3000 })
        }
    }

    return (
        <NotesContext.Provider value={{ getAllNotes, getSingleNote, createNote, updateNote, deleteNote }}>
            {children}
        </NotesContext.Provider>
    )
}

const useNote = () => useContext(NotesContext)

export { useNote, NotesProvider }