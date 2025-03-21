const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const multer = require('multer');
const path = require('path')
const { auth, isAdmin } = require('../middleware/auth');

const { createClinic, getAllClinics, getSingleClinic, updateClinic, deleteClinic, getAllClinicWithoutPagination } = require('../controllers/clinic');

router.get('/', auth, isAdmin, getAllClinics)

router.get('/without-pagination', getAllClinicWithoutPagination)

router.get('/:id', auth, isAdmin, getSingleClinic)

router.post("/create",
    check('name', 'Clinic name is required.').notEmpty(),
    check('address', 'Address is required.').notEmpty(),
    check('start_time', 'Start time is required.').notEmpty(),
    check('end_time', 'End time is required.').notEmpty(),
    auth,
    isAdmin,
    createClinic
)

router.put("/update/:id",
    check('name', 'Clinic name is required.').notEmpty(),
    check('address', 'Address is required.').notEmpty(),
    check('start_time', 'Start time is required.').notEmpty(),
    check('end_time', 'End time is required.').notEmpty(),
    auth,
    isAdmin,
    updateClinic
)

router.delete("/delete/:id", auth, isAdmin, deleteClinic)

module.exports = router

