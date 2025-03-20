import { useContext, createContext } from "react";
import { baseURL } from "../lib";
import { useAuth } from "./AuthContext";
import axios from 'axios'

const ContactContext = createContext()

const ContactProvider = ({ children }) => {

    const { auth, toast } = useAuth();

    const headers = {
        Authorization: auth?.token,
    };

    const getAllContacts = async (currentPage, rowsPerPage, sortField, sortOrder, filter) => {
        try {
            let { data } = await axios.get(`${baseURL}/contact-us?page=${currentPage}&limit=${rowsPerPage}&sortOrder=${sortOrder}&sortField=${sortField}&filter=${filter}`, { headers })
            if (data.error === false) {
                return data
            }
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Contact Us', detail: 'An error occurred. Please try again later.', life: 3000 })
        }
    }

    const getSingleContact = async (id) => {
        try {
            let { data } = await axios.get(`${baseURL}/contact-us/${id}`, { headers })
            if (data.error === false) {
                return data.data
            }
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Contact Us', detail: 'An error occurred. Please try again later.', life: 3000 })
        }
    }

    const createContact = async (contactDetail) => {
        try {
            const { data } = await axios.post(`${baseURL}/contact-us/create`, contactDetail);
            if (data.error === false) {
                setTimeout(function () {
                    toast.current?.show({ severity: 'success', summary: 'Contact Us', detail: data.message, life: 3000 })
                }, 500);
                return data
            } else {
                toast.current?.show({ severity: 'error', summary: 'Contact Us', detail: data.message, life: 3000 })
            }
        } catch (error) {
            if (error.response) {
                const errors = error.response.data.errors;
                if (errors && Array.isArray(errors) && errors.length > 0) {
                    toast.current?.show({ severity: 'error', summary: 'Contact Us', detail: errors[0].msg, life: 3000 })
                }
            } else {
                toast.current?.show({ severity: 'error', summary: 'Contact Us', detail: 'An error occurred. Please try again later.', life: 3000 })
            }
        }
    }

    return (
        <ContactContext.Provider value={{ getAllContacts, getSingleContact, createContact }}>
            {children}
        </ContactContext.Provider>
    )
}

const useContact = () => useContext(ContactContext)

export { useContact, ContactProvider }