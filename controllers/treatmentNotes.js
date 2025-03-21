const { validationResult } = require("express-validator");
const { knex } = require("../database/db");
const { createUserAuditing, compileTemplate, sendMailAsync } = require("../helpers/helper");

const createNote = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        createUserAuditing({
            user_id: req.user.id,
            action: 'created',
            description: 'treatment note validation error',
            data: req.body,
        })
        return res.status(400).json({ errors: errors.array() });
    }

    const { appointment_id, patient_information, prescription } = req.body;
    let auditData = {
        user_id: req.user.id,
        action: 'created',
        description: 'treatment note failure',
        data: req.body,
    };

    try {
        const noteDetail = {
            appointment_id,
            patient_information,
            prescription
        };

        const [newNote] = await knex('treatment_notes').insert(noteDetail);

        const existingAppointment = await knex('appointment')
            .join('users as patients', 'appointment.patient_id', '=', 'patients.id')
            .join('users as doctors', 'appointment.doctor_id', '=', 'doctors.id')
            .join('clinic', 'doctors.clinic_id', '=', 'clinic.id')
            .select(
                'appointment.appointment_time',
                'patients.email as patient_email',
                'patients.first_name as patient_first_name',
                'patients.last_name as patient_last_name',
                'clinic.name as clinic_name'
            )
            .where('appointment.id', appointment_id)
            .first();

        if (!existingAppointment) {
            createUserAuditing(auditData);
            return res.status(404).json({
                error: true,
                message: "Appointment not found",
            });
        }

        await knex('appointment').where('id', appointment_id).update({ status: "completed" });

        const emailTemplateData = {
            patient_name: `${existingAppointment.patient_first_name} ${existingAppointment.patient_last_name}`,
            appointment_date: new Date(existingAppointment.appointment_time).toLocaleDateString(),
            appointment_time: new Date(existingAppointment.appointment_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            clinic_name: existingAppointment.clinic_name,
            prescription: prescription || "No prescription provided.",
            current_year: new Date().getFullYear(),
        };

        const emailContent = compileTemplate(emailTemplateData, './templates/appointmentCompleted.html');

        sendMailAsync({
            from: process.env.MAIL_AUTH_USER,
            to: existingAppointment.patient_email,
            subject: 'Appointment Completed',
            html: emailContent,
        });

        auditData = {
            ...auditData,
            description: 'treatment note successfully'
        };
        createUserAuditing(auditData);

        return res.status(201).json({
            error: false,
            message: "Appointment completed successfully.",
            note: newNote
        });
    } catch (error) {
        console.log(error.message);
        createUserAuditing(auditData);
        res.status(500).send("Server error");
    }
};

const getAllNotes = async (req, res) => {
    let { sortField, sortOrder, page, limit, filter } = req.query

    filter = filter || null;
    page = page ? parseInt(page) : null;
    limit = limit ? parseInt(limit) : null;
    sortOrder = parseInt(sortOrder) || -1;
    sortField = sortField || 'created_at';

    try {
        let query = knex('treatment_notes');

        if (filter && filter !== 'null') {
            query = query.where('prescription', 'like', `%${filter}%`);
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
            message: "All treatment notes retrieved successfully.",
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

const getSingleNote = async (req, res) => {
    try {
        const { id } = req.params

        const appointment = await knex('treatment_notes').where('appointment_id', id).first()

        if (!appointment) {
            return res.status(200).json({
                error: true,
                message: "Treatment note not found",
            });
        }


        return res.status(200).json({
            error: false,
            message: "Treatment note get successfully.",
            data: appointment
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Server error");
    }
};

const updateNote = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        createUserAuditing({
            user_id: req.user.id,
            action: 'edited',
            description: 'treatment note validation error',
            data: { ...req.body, ...req.params },
        })
        return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params
    const { appointment_id, patient_information, prescription } = req.body;
    let auditData = {
        user_id: req.user.id,
        action: 'edited',
        description: 'treatment note failure',
        data: { ...req.body, ...req.params },
    };

    try {
        const existingNote = await knex('treatment_notes').where('appointment_id', id).first()
        if (!existingNote) {
            createUserAuditing(auditData);
            return res.status(200).json({
                error: true,
                message: "Treatment note not found",
            });
        }

        const updateNoteDetail = {
            appointment_id,
            patient_information,
            prescription
        };

        await new knex('treatment_notes').where('appointment_id', id).update(updateNoteDetail);

        auditData = {
            ...auditData,
            description: `treatment note successfully`
        }
        createUserAuditing(auditData);

        return res.status(200).json({
            error: false,
            message: "Treatment note updated successfully.",
        });
    } catch (error) {
        console.log(error.message);
        createUserAuditing(auditData);
        res.status(500).send("Server error");
    }
};

const deleteNote = async (req, res) => {
    const { id } = req.params

    let auditData = {
        user_id: req.user.id,
        action: 'deleted',
        data: req.params,
        description: 'treatment note failure',
    };
    try {
        const existingNote = await knex('treatment_notes').where('id', id).first()
        if (!existingNote) {
            createUserAuditing(auditData)
            return res.status(200).json({
                error: true,
                message: "Treatment note not found",
            });
        }

        await new knex('treatment_notes').where('id', id).del();

        auditData = {
            ...auditData,
            description: `treatment note successfully`
        }
        createUserAuditing(auditData)

        return res.status(200).json({
            error: false,
            message: "Treatment note delete successfully.",
        });
    } catch (error) {
        console.log(error.message);
        createUserAuditing(auditData)
        res.status(500).send("Server error");
    }
};

module.exports = {
    createNote,
    getAllNotes,
    getSingleNote,
    updateNote,
    deleteNote
}