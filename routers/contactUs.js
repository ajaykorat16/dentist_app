const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const { createContactUs, getAllContactUs, getSingleContactUs } = require('../controllers/contactUs');


router.get('/', auth, isAdmin, getAllContactUs)

router.get('/:id', auth, isAdmin, getSingleContactUs)

router.post("/create",
    check('name', 'Name is required.').notEmpty(),
    check('phone_number', 'Phone is required.').notEmpty(),
    check('phone_number', 'Please enter a valid phone number.').isLength({ min: 10, max: 13 }),
    check('message', 'Message is required.').notEmpty(),
    createContactUs
)

module.exports = router
