const { knex } = require("../database/db")
const jwt = require('jsonwebtoken');

const auth = function (req, res, next) {

    let token = req.headers.authorization
    if (!token) {
        return res.status(401).json({ error: true, message: 'No token, authorization denied' });
    }

    if (token.startsWith('Bearer ')) {
        const splitToken = token.split(' ');
        if (splitToken.length !== 2) {
            return res.status(401).json({ error: true, message: 'Invalid token format, authorization denied' });
        }
        token = splitToken[1];
    }

    try {
        jwt.verify(token, process.env.JWT_SECRET_KEY, (error, decoded) => {
            if (error) {
                console.log(error)
                return res.status(401).json({ error: true, message: 'Token is not valid' });
            } else {
                req.user = decoded.user;
                next();
            }
        });
    } catch (err) {
        console.error('something wrong with auth middleware');
        res.status(500).json({ msg: 'Server Error' });
    }
};

const isAdmin = async (req, res, next) => {
    try {
        const user = await knex('users').where('id', req.user.id).first()
        if (user.role_id !== 1) {
            return res.status(401).send({
                error: true,
                message: "UnAuthorized Access"
            })
        } else {
            next();
        }
    } catch (error) {
        return res.status(401).send({
            error: true,
            message: "Error In Admin Middleware",
            error: error.message
        })
    }
}

const isDoctor = async (req, res, next) => {
    try {
        const user = await knex('users').where('id', req.user.id).first()
        if (user.role_id !== 2) {
            return res.status(401).send({
                error: true,
                message: "UnAuthorized Access"
            })
        } else {
            next();
        }
    } catch (error) {
        return res.status(401).send({
            error: true,
            message: "Error In Admin Middleware",
            error: error.message
        })
    }
}

module.exports = { auth, isAdmin, isDoctor }