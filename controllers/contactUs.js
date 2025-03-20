const { validationResult } = require("express-validator");
const { knex } = require("../database/db");
const { createUserAuditing, sendMailAsync, compileTemplate } = require("../helpers/helper");

const createContactUs = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        createUserAuditing({
            user_id: null,
            action: 'created',
            description: 'contact validation error',
            data: req.body,
        })
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, phone_number, message } = req.body;
    let auditData = {
        user_id: null,
        action: 'created',
        description: 'contact failure',
        data: req.body,
    };

    try {
        const contactUsDetail = {
            name,
            phone_number,
            message
        };

        await knex('contact_us').insert(contactUsDetail);

        sendMailAsync({
            from: process.env.MAIL_AUTH_USER,
            to: process.env.ADMIN_EMAIL,
            subject: 'New Contact Form Submission',
            html: compileTemplate({
                name: req.body.name,
                phone_number: req.body.phone_number,
                message: req.body.message,
                current_year: new Date().getFullYear(),
            }, './templates/contactUsAdminTemplate.html'),
        });

        auditData = {
            ...auditData,
            description: 'contact successfully'
        };
        createUserAuditing(auditData);

        return res.status(201).json({
            error: false,
            message: "Thank you for reaching out to us! Your message has been successfully submitted. Our team will get back to you shortly.",
        });
    } catch (error) {
        console.log(error.message);
        createUserAuditing(auditData);
        res.status(500).send("Server error");
    }
};

const getAllContactUs = async (req, res) => {
    let { sortField, sortOrder, page, limit, filter } = req.query

    filter = filter || null;
    page = page ? parseInt(page) : null;
    limit = limit ? parseInt(limit) : null;
    sortOrder = parseInt(sortOrder) || -1;
    sortField = sortField || 'created_at';

    try {
        let query = knex('contact_us')

        if (filter && filter !== 'null') {
            query = query.where((qb) => {
                qb.where('name', 'like', `%${filter}%`)
                    .orWhere('phone_number', 'like', `%${filter}%`)
                    .orWhere('message', 'like', `%${filter}%`)
            });
        }

        if (sortField !== 'undefined' && sortOrder) {
            query = query.orderBy(sortField, sortOrder === -1 ? 'desc' : 'asc');
        }

        const totalCountQuery = query.clone().count('* as totalCount').first();
        const totalCountResult = await totalCountQuery;
        const totalCount = totalCountResult.totalCount;

        if (page && limit) {
            const offset = (page - 1) * limit;
            query = query.offset(offset).limit(limit);
        }

        const notes = await query;

        return res.status(200).send({
            error: false,
            message: "All contacts retrieved successfully.",
            data: notes,
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit),
            totalCount: totalCount
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).send("Server error");
    }
};

const getSingleContactUs = async (req, res) => {
    try {
        const { id } = req.params

        const appointment = await knex('contact_us').where('id', id).first()
        if (!appointment) {
            return res.status(200).json({
                error: true,
                message: "Contact not found",
            });
        }


        return res.status(200).json({
            error: false,
            message: "Contact get successfully.",
            data: appointment
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Server error");
    }
};

module.exports = {
    createContactUs,
    getAllContactUs,
    getSingleContactUs
}