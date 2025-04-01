import { useState, useEffect, useContext, createContext, useRef } from "react";
import { baseURL } from "../lib";
import axios from 'axios'
import { useNavigate } from "react-router-dom";

const AuthContext = createContext()

const AuthProvider = ({ children }) => {

    const [restaurantId, setRestaurantId] = useState(null)
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [auth, setAuth] = useState({
        user: null,
        token: ""
    })

    const toast = useRef(null);
    const navigate = useNavigate()

    const logout = () => {
        try {
            const data = localStorage.getItem('auth')
            if (data) {
                localStorage.removeItem("auth")
                setAuth({
                    user: null,
                    token: ""
                })
                setIsLoggedIn(false)
                navigate("/login")
            }
        } catch (error) {
            console.log(error);
        }
    };

    axios.defaults.headers.common["Authorization"] = auth?.token

    const login = async (credential) => {
        try {
            const { data } = await axios.post(`${baseURL}/user/login`, credential);

            if (data.error === false) {
                setIsLoggedIn(true)
                setTimeout(function () {
                    toast.current?.show({ severity: 'success', summary: data.data.user.first_name, detail: data.message, life: 3000 })
                }, 500);
                setAuth({
                    ...auth,
                    user: data.data.user,
                    token: data.data.token
                })
                if (data.data.user.restaurant_id) {
                    setRestaurantId(data.data.user.restaurant_id)
                }
                localStorage.setItem('auth', JSON.stringify(data.data))
                return data.data
            } else {
                toast.current?.show({ severity: 'error', summary: 'Login', detail: data.message, life: 3000 })
            }
        } catch (error) {
            if (error.response) {
                const errors = error.response.data.errors;
                if (errors && Array.isArray(errors) && errors.length > 0) {
                    if (errors.length > 1) {
                        toast.current?.show({ severity: 'error', summary: 'Login', detail: "Please fill all mandatory fields.", life: 3000 })
                    } else {
                        toast.current?.show({ severity: 'error', summary: 'Login', detail: errors[0].msg, life: 3000 })
                    }
                }
            } else {
                toast.current?.show({ severity: 'error', summary: 'Login', detail: 'An error occurred. Please try again later.', life: 3000 })
            }
        }
    };

    const register = async (credential) => {
        try {
            const { data } = await axios.post(`${baseURL}/user/register`, credential);

            if (data.error === false) {
                setTimeout(function () {
                    toast.current?.show({ severity: 'success', summary: 'Register', detail: data.message, life: 3000 })
                }, 500);
            } else {
                toast.current?.show({ severity: 'error', summary: 'Register', detail: data.message, life: 3000 })
            }
            return data;
        } catch (error) {
            if (error.response) {
                const errors = error.response.data.errors;
                if (errors && Array.isArray(errors) && errors.length > 0) {
                    if (errors.length > 1) {
                        toast.current?.show({ severity: 'error', summary: 'Login', detail: "Please fill all mandatory fields.", life: 3000 })
                    } else {
                        toast.current?.show({ severity: 'error', summary: 'Login', detail: errors[0].msg, life: 3000 })
                    }
                }
            } else {
                toast.current?.show({ severity: 'error', summary: 'Login', detail: 'An error occurred. Please try again later.', life: 3000 })
            }
        }
    }

    useEffect(() => {
        const data = localStorage.getItem("auth");
        if (data) {
            const parseData = JSON.parse(data);
            setAuth({
                user: parseData.user,
                token: parseData.token,
                permissions: parseData.permissions,
            });
            setIsLoggedIn(true);
        }
    
        if (auth?.token) {
            axios.defaults.headers.common["Authorization"] = `Bearer ${auth.token}`;
        }
    
        const interceptor = axios.interceptors.response.use(
            (response) => response, 
            (error) => {
                if (error.response && error.response.status === 401) {
                    logout(); 
                }
                return Promise.reject(error); 
            }
        );
    
        return () => axios.interceptors.response.eject(interceptor);
    }, [auth.token]);
    

    return (
        <AuthContext.Provider value={{ auth, login, register, logout, isLoggedIn, toast }}>
            {children}
        </AuthContext.Provider>
    )
}

const useAuth = () => useContext(AuthContext)

export { useAuth, AuthProvider }