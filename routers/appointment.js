const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const { auth, isAdmin, isDoctor } = require('../middleware/auth');
const { getAllAppointment, getSingleAppointment, createAppointment, updateAppointment, deleteAppointment, getUserAppointments, cancelAppointment, updateStatus } = require('../controllers/appointment');

router.get('/', auth, isAdmin, getAllAppointment)

router.get('/user-appointments', auth, getUserAppointments)

router.get('/get-appointment/:id', auth, getSingleAppointment)

router.post("/create",
    check('doctor_id', 'Doctor is required.').notEmpty(),
    check('patient_id', 'Patient is required.').notEmpty(),
    check('appointment_time', 'Appointment time is required.').notEmpty(),
    auth,
    createAppointment
)

router.put("/update-status/:id",
    auth,
    isDoctor,
    updateStatus
)

router.put("/update/:id",
    auth,
    updateAppointment
)

router.put("/cancel-appointment/:id",
    check('cancel_reason', 'Cancel reason is required.').notEmpty(),
    auth,
    cancelAppointment
)

router.delete("/delete/:id", auth, isAdmin, deleteAppointment)

module.exports = router

