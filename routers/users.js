const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const multer = require('multer');
const path = require('path')
const { auth, isAdmin, isDoctor } = require('../middleware/auth');

const { signupUser, loginUser, createUser, getAllUsers, getSingleUser, updateUser, deleteUser, updatePassword, getAllDoctors } = require('../controllers/users');

router.get('/', auth, isAdmin, getAllUsers)

router.get('/doctors', getAllDoctors)

router.get('/admin-auth', auth, isAdmin, (req, res) => {
    res.status(200).json({ ok: true });
})

router.get('/user-auth', auth, (req, res) => {
    res.status(200).json({ ok: true });
})

router.get('/doctor-auth', auth, isDoctor, (req, res) => {
    res.status(200).json({ ok: true });
})

router.get('/get-user/:id', auth, isAdmin, getSingleUser)

router.post("/register",
    check('first_name', 'First name is required.').notEmpty(),
    check('last_name', 'Last name is required.').notEmpty(),
    check('email', 'Email is not valid.').isEmail(),
    check('password', 'Password is required').notEmpty(),
    check('password', 'Please enter a password with 8 or more characters.').isLength({ min: 8 }),
    signupUser
)

router.post("/login",
    check('email', 'Email is required.').notEmpty(),
    check('email', 'Email is not valid.').isEmail(),
    check('password', 'Password is required').notEmpty(),
    check('password', 'Please enter a password with 8 or more characters.').isLength({ min: 8 }),
    loginUser
)

router.post("/create",
    check('first_name', 'First name is required.').notEmpty(),
    check('last_name', 'Last name is required.').notEmpty(),
    check('email', 'Email is not valid.').isEmail(),
    check('role_id', 'Role is not valid.').notEmpty(),
    check('password', 'Password is required').notEmpty(),
    check('password', 'Please enter a password with 8 or more characters.').isLength({ min: 8 }),
    auth,
    isAdmin,
    createUser
)

router.put("/update/password/:id",
    check('password', 'Password is required').notEmpty(),
    check('password', 'Please enter a password with 8 or more characters.').isLength({ min: 8 }),
    auth,
    isAdmin,
    updatePassword
)

router.put("/update/:id",
    check('first_name', 'First name is required.').notEmpty(),
    check('last_name', 'Last name is required.').notEmpty(),
    check('email', 'Email is not valid.').isEmail(),
    check('role_id', 'Role is not valid.').notEmpty(),
    auth,
    isAdmin,
    updateUser
)

router.delete("/delete/:id", auth, isAdmin, deleteUser)

module.exports = router

