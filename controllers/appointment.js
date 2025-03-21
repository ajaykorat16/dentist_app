const moment = require('moment');
const { validationResult } = require("express-validator");
const { knex } = require("../database/db");
const { sendMailAsync, compileTemplate, createUserAuditing, formatToLocalDate } = require('../helpers/helper');

function isValidAppointment(appointmentTime, startTime, endTime) {
    const timeToSeconds = (time) => {
        const [hours, minutes, seconds] = time.split(':').map(Number);
        return hours * 3600 + minutes * 60 + (seconds || 0);
    };

    const appointmentTimeOnly = appointmentTime.split('T')[1] + ':00';

    const appointmentSeconds = timeToSeconds(appointmentTimeOnly);
    const startSeconds = timeToSeconds(startTime);
    const endSeconds = timeToSeconds(endTime);

    return appointmentSeconds >= startSeconds && appointmentSeconds <= endSeconds;
}

const createAppointment = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        createUserAuditing({
            user_id: req.user.id,
            action: 'created',
            description: 'appointment validation error',
            data: req.body,
        })
        return res.status(400).json({ errors: errors.array() });
    }

    const { doctor_id, patient_id, appointment_time, slot, medical_history } = req.body;
    let auditData = {
        user_id: req.user.id,
        action: 'created',
        description: 'appointment failure',
        data: req.body,
    };

    try {
        const [clinic] = await knex('users')
            .join('clinic_operation_hours', 'users.clinic_id', '=', 'clinic_operation_hours.clinic_id')
            .join('clinic', 'users.clinic_id', '=', 'clinic.id')
            .select('users.*', 'clinic.name as clinic_name', 'clinic.address as clinic_address', 'clinic_operation_hours.start_time', 'clinic_operation_hours.end_time')
            .where('users.id', doctor_id);

        const [patient] = await knex('users').where('users.id', patient_id);

        const [newAppointment] = await knex('appointment')
            .insert({ doctor_id, patient_id, appointment_time, slot, medical_history })
            .returning('id');

        sendMailAsync({
            from: process.env.MAIL_AUTH_USER,
            to: clinic.email,
            subject: 'New Appointment Booked',
            html: compileTemplate({
                doctor_name: `${clinic.first_name} ${clinic.last_name}`,
                patient_name: `${patient.first_name} ${patient.last_name}`,
                medical_history: medical_history || "No significant medical history",
                clinic_name: clinic.clinic_name,
                appointment_date: new Date(appointment_time).toLocaleDateString(),
                appointment_time: slot,
                current_year: new Date().getFullYear(),
            }, './templates/appointmentNotificationDoctor.html'),
        })

        auditData = {
            ...auditData,
            description: `appointment successfully`
        }
        createUserAuditing(auditData);

        return res.status(201).json({
            error: false,
            message: "Appointment created successfully.",
            appointment: newAppointment,
        });

    } catch (error) {
        console.error(error.message);
        createUserAuditing(auditData);
        return res.status(500).send("Server error");
    }
};

const getAllAppointment = async (req, res) => {
    let { sortField, sortOrder, page, limit, filter } = req.query

    filter = filter || null;
    page = page ? parseInt(page) : null;
    limit = limit ? parseInt(limit) : null;
    sortOrder = parseInt(sortOrder) || -1;
    sortField = sortField || 'created_at';

    try {
        let query = knex('appointment');

        if (filter && filter !== 'null') {
            query = query.where('status', 'like', `%${filter}%`);
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

        const appointment = await query;

        return res.status(200).send({
            error: false,
            message: "All appointment retrieved successfully.",
            data: appointment,
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit),
            totalCount: totalCount
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).send("Server error");
    }
};

const getUserAppointments = async (req, res) => {
    const { role_id, id } = req.user;
    let { sortField, sortOrder, page, limit, filter, statusFilter } = req.query;

    filter = filter || null;
    statusFilter = statusFilter || null;
    page = page ? parseInt(page) : 1;
    limit = limit ? parseInt(limit) : 10;
    sortOrder = parseInt(sortOrder) || -1;
    sortField = sortField || 'created_at';

    try {
        let query = knex('appointment');

        if (role_id === 3) {
            query = query
                .where('appointment.patient_id', id)
                .join('users', 'appointment.doctor_id', 'users.id')
                .select('appointment.*', 'users.first_name as doctor_name');
        } else if (role_id === 2) {
            query = query
                .where('appointment.doctor_id', id)
                .join('users', 'appointment.patient_id', 'users.id')
                .select('appointment.*', 'users.first_name as patient_name');
        } else {
            return res.status(403).send({
                error: true,
                message: "Unauthorized role",
            });
        }

        if (filter && filter !== 'null') {
            const parsedFilter = moment(filter, 'DD-MM-YYYY HH:mm', true).isValid()
                ? moment(filter, 'DD-MM-YYYY HH:mm').format('YYYY-MM-DD HH:mm:ss')
                : null;

            query = query.andWhere((qb) => {
                qb.where('appointment.status', 'like', `%${filter}%`)
                    .orWhere('users.first_name', 'like', `%${filter}%`)
                    .orWhere('appointment.medical_history', 'like', `%${filter}%`);

                if (parsedFilter) {
                    qb.orWhere('appointment.appointment_time', 'like', `%${parsedFilter}%`);
                }
            });
        }

        if (statusFilter && statusFilter !== 'null') {
            query = query.andWhere('appointment.status', '=', statusFilter);
        }

        if (sortField !== 'undefined' && sortOrder) {
            const sortColumn =
                sortField === 'patient_name' || sortField === 'doctor_name'
                    ? 'users.first_name'
                    : sortField === 'appointment_time'
                        ? 'appointment.appointment_time'
                        : `appointment.${sortField}`;

            query = query.orderBy(sortColumn, sortOrder === -1 ? 'desc' : 'asc');
        }

        const totalCountQuery = query.clone().clearOrder().clearSelect().count('* as totalCount').first();
        const totalCountResult = await totalCountQuery;
        const totalCount = totalCountResult.totalCount;

        if (page && limit) {
            const offset = (page - 1) * limit;
            query = query.offset(offset).limit(limit);
        }

        const appointments = await query;

        const formattedAppointments = appointments.map((a) => {
            const localDate = new Date(a.appointment_time);

            const year = localDate.getFullYear();
            const month = String(localDate.getMonth() + 1).padStart(2, '0');
            const day = String(localDate.getDate()).padStart(2, '0');
            const hours = String(localDate.getHours()).padStart(2, '0');
            const minutes = String(localDate.getMinutes()).padStart(2, '0');

            return {
                ...a,
                appointment_time: `${year}-${month}-${day}T${hours}:${minutes}`,
            };
        });

        return res.status(200).send({
            error: false,
            message: "Appointments retrieved successfully.",
            data: formattedAppointments,
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit),
            totalCount: totalCount,
        });
    } catch (error) {
        console.error(error.message);
        return res.status(500).send("Server error");
    }
};

const getSingleAppointment = async (req, res) => {
    try {
        const { id } = req.params;

        const appointment = await knex('appointment').where('id', id).first();
        if (!appointment) {
            return res.status(200).json({
                error: true,
                message: "Appointment not found",
            });
        }

        const localDate = new Date(appointment.appointment_time);
        const year = localDate.getFullYear();
        const month = String(localDate.getMonth() + 1).padStart(2, '0');
        const day = String(localDate.getDate()).padStart(2, '0');
        const localAppointmentTime = `${year}-${month}-${day}`;

        const formattedAppointment = {
            ...appointment,
            appointment_time: localAppointmentTime,
        };

        return res.status(200).json({
            error: false,
            message: "Appointment retrieved successfully.",
            data: formattedAppointment,
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Server error");
    }
};

const updateAppointment = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        createUserAuditing({
            user_id: req.user.id,
            action: 'edited',
            description: 'appointment update validation error',
            data: { ...req.body, ...req.params },
        })
        return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { doctor_id, patient_id, appointment_time, slot, medical_history, status, cancel_reason } = req.body;
    let auditData = {
        user_id: req.user.id,
        action: 'edited',
        description: 'appointment update failure',
        data: { ...req.body, ...req.params },
    };

    try {
        const existingAppointment = await knex('appointment').where('id', id).first();
        if (!existingAppointment) {
            createUserAuditing(auditData);
            return res.status(404).json({
                error: true,
                message: "Appointment not found",
            });
        }

        const [clinic] = await knex('users')
            .join('clinic_operation_hours', 'users.clinic_id', '=', 'clinic_operation_hours.clinic_id')
            .join('clinic', 'users.clinic_id', '=', 'clinic.id')
            .select('users.*', 'clinic.name as clinic_name', 'clinic.address as clinic_address', 'clinic_operation_hours.start_time', 'clinic_operation_hours.end_time')
            .where('users.id', existingAppointment.doctor_id);

        const localDate = new Date(existingAppointment.appointment_time);
        const year = localDate.getFullYear();
        const month = String(localDate.getMonth() + 1).padStart(2, '0');
        const day = String(localDate.getDate()).padStart(2, '0');
        const localAppointmentTime = `${year}-${month}-${day}`;

        const isRescheduled =
            appointment_time &&
            appointment_time !== localAppointmentTime ||
            existingAppointment.slot !== slot;

        const updateAppoinmentDetail = {
            doctor_id,
            patient_id,
            appointment_time,
            slot,
            medical_history,
            status,
            cancel_reason
        };

        await knex('appointment').where('id', id).update(updateAppoinmentDetail);

        if (isRescheduled) {
            const [doctor] = await knex('users')
                .join('clinic', 'users.clinic_id', '=', 'clinic.id')
                .select('users.first_name', 'users.last_name', 'users.email', 'clinic.name as clinic_name')
                .where('users.id', existingAppointment.doctor_id);

            const [patient] = await knex('users')
                .select('first_name', 'last_name')
                .where('id', existingAppointment.patient_id);

            const emailTemplateData = {
                doctor_name: `${doctor.first_name} ${doctor.last_name}`,
                patient_name: `${patient.first_name} ${patient.last_name}`,
                medical_history: existingAppointment?.medical_history || "No significant medical history",
                new_date: new Date(appointment_time).toLocaleDateString(),
                new_time: slot,
                current_year: new Date().getFullYear()
            };

            const emailContent = compileTemplate(emailTemplateData, './templates/appointmentRescheduled.html');

            sendMailAsync({
                from: process.env.MAIL_AUTH_USER,
                to: doctor.email,
                subject: 'Appointment Rescheduled',
                html: emailContent,
            });
        }

        auditData = {
            ...auditData,
            description: `appointment update successfully`
        }
        createUserAuditing(auditData);

        return res.status(200).json({
            error: false,
            message: "Appointment updated successfully.",
        });
    } catch (error) {
        console.error(error.message);
        createUserAuditing(auditData);
        res.status(500).send("Server error");
    }
};

const updateStatus = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        createUserAuditing({
            user_id: req.user.id,
            action: 'edited',
            description: 'appointment status update validation error',
            data: req.params,
        })
        return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    let auditData = {
        user_id: req.user.id,
        action: 'edited',
        description: 'appointment status update failure',
        data: req.params,
    };

    try {
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
            .where('appointment.id', id)
            .first();

        if (!existingAppointment) {
            createUserAuditing(auditData);
            return res.status(404).json({
                error: true,
                message: "Appointment not found",
            });
        }

        const existingNote = await knex('treatment_notes').where('appointment_id', id).first();
        if (!existingNote) {
            createUserAuditing(auditData);
            return res.status(404).json({
                error: true,
                message: "Treatment notes not found for this appointment",
            });
        }

        await knex('appointment').where('id', id).update({ status: "completed" });

        const emailTemplateData = {
            patient_name: `${existingAppointment.patient_first_name} ${existingAppointment.patient_last_name}`,
            appointment_date: new Date(existingAppointment.appointment_time).toLocaleDateString(),
            appointment_time: existingAppointment.slot,
            clinic_name: existingAppointment.clinic_name,
            prescription: existingNote.prescription || "No prescription provided.",
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
            description: `appointment status update successfully`
        }
        createUserAuditing(auditData);

        return res.status(200).json({
            error: false,
            message: "Appointment completed successfully.",
        });
    } catch (error) {
        console.error(error.message);
        createUserAuditing(auditData);
        res.status(500).send("Server error");
    }
};

const cancelAppointment = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        createUserAuditing({
            user_id: req.user.id,
            action: 'edited',
            description: 'appointment status validation error',
            data: { ...req.body, ...req.params },
        });
        return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { cancel_reason } = req.body;

    let auditData = {
        user_id: req.user.id,
        action: 'edited',
        description: 'appointment status cancel failure',
        data: { ...req.body, ...req.params },
    };

    try {
        const existingAppointment = await knex('appointment')
            .where('id', id)
            .andWhere('status', 'scheduled')
            .first();

        if (!existingAppointment) {
            createUserAuditing(auditData);
            return res.status(404).json({
                error: true,
                message: "Appointment not found",
            });
        }

        const updateAppoinmentDetail = {
            status: 'cancelled',
            cancel_reason
        };
        await knex('appointment').where('id', id).update(updateAppoinmentDetail);

        const [doctor] = await knex('users')
            .join('clinic', 'users.clinic_id', '=', 'clinic.id')
            .select('users.first_name', 'users.last_name', 'users.email', 'clinic.name as clinic_name')
            .where('users.id', existingAppointment.doctor_id);

        const [patient] = await knex('users')
            .select('first_name', 'last_name', 'email')
            .where('id', existingAppointment.patient_id);

        let emailTemplateData = {
            patient_name: `${patient.first_name} ${patient.last_name}`,
            doctor_name: `${doctor.first_name} ${doctor.last_name}`,
            appointment_date: new Date(existingAppointment.appointment_time).toLocaleDateString(),
            appointment_time: existingAppointment.slot,
            cancel_reason: cancel_reason || "No reason provided",
            clinic_name: doctor.clinic_name,
            current_year: new Date().getFullYear(),
        };

        let emailContent, recipientEmail;

        if (req.user.role_id === 3) {
            emailTemplateData = {
                ...emailTemplateData,
                is_doctor: false
            };
            emailContent = compileTemplate(emailTemplateData, './templates/appointmentCancelled.html');
            recipientEmail = doctor.email;
        } else if (req.user.role_id === 2) {
            emailTemplateData = {
                ...emailTemplateData,
                is_doctor: true
            };
            emailContent = compileTemplate(emailTemplateData, './templates/appointmentCancelled.html');
            recipientEmail = patient.email;
        } else {
            createUserAuditing(auditData);
            return res.status(403).json({
                error: true,
                message: "Unauthorized role to cancel appointment",
            });
        }

        sendMailAsync({
            from: process.env.MAIL_AUTH_USER,
            to: recipientEmail,
            subject: 'Appointment Cancelled',
            html: emailContent,
        });

        auditData = {
            ...auditData,
            description: `appointment status cancel successfully`,
        };
        createUserAuditing(auditData);

        return res.status(200).json({
            error: false,
            message: "Appointment cancelled successfully.",
        });
    } catch (error) {
        console.error(error.message);
        createUserAuditing(auditData);
        res.status(500).send("Server error");
    }
};

const deleteAppointment = async (req, res) => {
    const { id } = req.params

    let auditData = {
        user_id: req.user.id,
        action: 'deleted',
        data: req.params,
        description: 'appointment failure',
    };

    try {
        const existingClinic = await knex('appointment').where('id', id).first()
        if (!existingClinic) {
            createUserAuditing(auditData)
            return res.status(200).json({
                error: true,
                message: "Appointment not found",
            });
        }

        await new knex('appointment').where('id', id).del();

        auditData = {
            ...auditData,
            description: `appointment successfully`
        }
        createUserAuditing(auditData)

        return res.status(200).json({
            error: false,
            message: "Appointment delete successfully.",
        });
    } catch (error) {
        console.log(error.message);
        createUserAuditing(auditData)
        res.status(500).send("Server error");
    }
};

const getAppointmentSlots = async (req, res) => {
    try {
        const { id } = req.params;
        const { date } = req.query;

        const doctor = await knex('users')
            .join('clinic_operation_hours', 'users.clinic_id', 'clinic_operation_hours.clinic_id')
            .select(
                'users.*',
                'clinic_operation_hours.start_time',
                'clinic_operation_hours.end_time'
            )
            .where('users.id', id)
            .first();

        if (!doctor) {
            return res.status(404).json({
                error: true,
                message: "Doctor not found.",
                data: [],
            });
        }

        const appointments = await knex('appointment')
            .where('doctor_id', id)
            .andWhere('status', 'scheduled');

        const startTime = doctor.start_time;
        const endTime = doctor.end_time;



        const bookedSlots = appointments
            .filter(appointment => {
                const localAppointmentTime = formatToLocalDate(appointment.appointment_time);

                return localAppointmentTime === date;
            })
            .map(appointment => appointment.slot);

        const generateSlots = (start, end) => {
            const slots = [];
            let currentTime = new Date(`${date}T${start}`);
            const endTime = new Date(`${date}T${end}`);

            while (currentTime < endTime) {
                const nextTime = new Date(currentTime.getTime() + 60 * 60 * 1000);
                if (nextTime > endTime) break;

                const slot = `${currentTime.toTimeString().slice(0, 5)} - ${nextTime.toTimeString().slice(0, 5)}`;
                slots.push({
                    slot,
                    disabled: bookedSlots.includes(slot),
                });

                currentTime = nextTime;
            }
            return slots;
        };

        const slots = generateSlots(startTime, endTime);

        return res.status(200).json({
            error: false,
            message: "Appointment slots retrieved successfully.",
            data: slots,
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error");
    }
};


module.exports = {
    createAppointment,
    getAllAppointment,
    getSingleAppointment,
    getUserAppointments,
    getAppointmentSlots,
    updateStatus,
    updateAppointment,
    cancelAppointment,
    deleteAppointment
}