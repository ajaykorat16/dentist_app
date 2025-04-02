import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'bootstrap/dist/css/bootstrap.css';
import './index.css';
import { Routes, Route } from 'react-router-dom';
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
import ContactUs from './pages/ContactUs';
import ContactUsList from './pages/ContactUsList';
import ActionList from './pages/ActionList';
import DodtorList from './pages/DocorList';
import AppointmentDetails from './pages/AppointmentDetails';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/contact-us" element={<ContactUs />} />
      <Route path="/clinic/:id" element={<DodtorList />} />

      <Route path="/user" element={<UserRoutes />}>
        <Route path="appointment/:id" element={<CreateAppointment />} />
        <Route path="appointments" element={<UserAppointment />} />
        <Route path="appointments-details/:appointmentId" element={<AppointmentDetails />} />
      </Route>

      <Route path="/admin" element={<AdminRoutes />}>
        <Route path="doctor/list" element={<UserList role="doctor" />} />
        <Route path="staff/list" element={<UserList role="staff" />} />
        <Route path="clinic/list" element={<ClnicList />} />
        <Route path="inquiries/list" element={<ContactUsList />} />
        <Route path="action/list" element={<ActionList />} />
      </ Route>

      <Route path="/doctor" element={<DoctorRoute />}>
        <Route path="appointment/list" element={<DoctorAppointment />} />
      </ Route>
    </Routes>
  );
}

export default App;
