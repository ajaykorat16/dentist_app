import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { baseURL } from "../lib";
import Spinner from "../components/Spinner";
import axios from "axios";

const AdminRoutes = () => {
  const [ok, setOk] = useState(false);
  const auth = JSON.parse(localStorage.getItem('auth'))
  axios.defaults.headers.common["Authorization"] = auth?.token

  useEffect(() => {
    const authCheck = async () => {
      const res = await axios.get(`${baseURL}/user/admin-auth`);
      if (res.data.ok) {
        setOk(true);
      } else {
        setOk(false);
      }
    };
    if (auth?.token) authCheck();
  }, [auth?.token]);

  return ok ? <Outlet /> : <Spinner />;
};

export default AdminRoutes;
