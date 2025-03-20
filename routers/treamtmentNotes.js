const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const { auth, isDoctor } = require('../middleware/auth');

const { getAllNotes, getSingleNote, createNote, updateNote, deleteNote } = require('../controllers/treatmentNotes');

router.get('/', auth, isDoctor, getAllNotes)

router.get('/:id', auth, isDoctor, getSingleNote)

router.post("/create",
    check('appointment_id', 'Appointment is required.').notEmpty(),
    check('patient_information', 'Patient is required.').notEmpty(),
    check('prescription', 'Prescription is required.').notEmpty(),
    auth,
    isDoctor,
    createNote
)

router.put("/update/:id",
    check('appointment_id', 'Appointment is required.').notEmpty(),
    check('patient_information', 'Patient is required.').notEmpty(),
    check('prescription', 'Prescription is required.').notEmpty(),
    auth,
    isDoctor,
    updateNote
)

router.delete("/delete/:id", auth, isDoctor, deleteNote)

module.exports = router

