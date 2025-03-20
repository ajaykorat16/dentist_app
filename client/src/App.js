import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'bootstrap/dist/css/bootstrap.css';
import './index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import UserList from './pages/UserList';
import AdminRoutes from "./Routes/AdminRoutes";
import ClnicList from './pages/ClinicList';
import DoctorRoute from './Routes/DoctorRoute';
import DoctorAppointment from './pages/DoctorAppointment';
import HomePage from './pages/HomePage';
import CreateAppointment from './pages/CreateAppointment';
import UserRoutes from './Routes/UserRoutes';
import UserAppointment from './pages/UserAppointment';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/user" element={<UserRoutes />}>
          <Route path="appointment/:id" element={<CreateAppointment />} /> {/* Relative path */}
          <Route path="appointments" element={<UserAppointment />} /> {/* Relative path */}
        </Route>

        <Route path="/admin" element={<AdminRoutes />}>
          <Route path="user/list" element={<UserList />} />
          <Route path="clinic/list" element={<ClnicList />} />
        </ Route>

        <Route path="/doctor" element={<DoctorRoute />}>
          <Route path="appointment/list" element={<DoctorAppointment />} />
        </ Route>
      </Routes>
    </BrowserRouter >
  );
}

export default App;
