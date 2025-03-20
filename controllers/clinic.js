const { validationResult } = require("express-validator");
const { knex } = require("../database/db");
const fs = require('fs');
const { uploadImage, isBase64Image, createUserAuditing } = require("../helpers/helper");

const createClinic = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        createUserAuditing({
            user_id: req.user.id,
            action: 'created',
            description: 'clinic validation error',
            data: { ...req.body, ...req.file },
        })
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, address, start_time, end_time, image } = req.body;
    let auditData = {
        user_id: req.user.id,
        action: 'created',
        description: 'clinic failure',
        data: { ...req.body, ...req.file },
    };

    try {
        const existingClinic = await knex('clinic').where('name', name).first()
        if (existingClinic) {
            createUserAuditing(auditData);
            return res.status(200).json({
                error: true,
                message: "Clinic already register with this name.",
            });
        }

        const clinicDetail = {
            name,
            address
        };

        if (image && isBase64Image(image)) {
            const uploadPath = "./uploads/images/clinic/";
            const imageName = uploadImage(image, uploadPath);
            clinicDetail.image = imageName;
        }

        const [newClinic] = await knex('clinic').insert(clinicDetail);

        const clinicTime = {
            clinic_id: newClinic,
            start_time,
            end_time
        }

        await knex('clinic_operation_hours').insert(clinicTime);

        auditData = {
            ...auditData,
            description: 'clinic successfully'
        };
        createUserAuditing(auditData);

        return res.status(201).json({
            error: false,
            message: "Clinic updated successfully.",
            clinic: newClinic
        });
    } catch (error) {
        console.log(error.message);
        createUserAuditing(auditData);
        res.status(500).send("Server error");
    }
};

const getAllClinics = async (req, res) => {
    let { sortField, sortOrder, page, limit, filter } = req.query

    filter = filter || null;
    page = page ? parseInt(page) : null;
    limit = limit ? parseInt(limit) : null;
    sortOrder = parseInt(sortOrder) || -1;
    sortField = sortField || 'created_at';

    try {
        let query = knex('clinic');

        if (filter && filter !== 'null') {
            query = query.andWhere((qb) => {
                qb.where('name', 'like', `%${filter}%`)
                    .orWhere('address', 'like', `%${filter}%`)
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

        const clinics = await query;

        const formattedClinics = clinics.map((c) => {
            const photoUrl = c.image ? `${DOMAIN}/images/clinic/${c.image}` : null;
            return {
                ...c,
                image: photoUrl
            }
        })

        return res.status(200).send({
            error: false,
            message: "All clinics retrieved successfully.",
            data: formattedClinics,
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit),
            totalCount: totalCount
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).send("Server error");
    }
};

const getSingleClinic = async (req, res) => {
    try {
        const { id } = req.params

        const clinic = await knex('clinic').where('id', id).first()
        if (!clinic) {
            return res.status(200).json({
                error: true,
                message: "Clinic not found",
            });
        }

        const clinicTime = await knex('clinic_operation_hours').where('clinic_id', id).first()

        return res.status(200).json({
            error: false,
            message: "Clinic get successfully.",
            data: {
                ...clinic,
                image: clinic.image ? `${DOMAIN}/images/clinic/${clinic.image}` : null,
                start_time: clinicTime.start_time ? clinicTime.start_time : null,
                end_time: clinicTime.end_time ? clinicTime.end_time : null
            }
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Server error");
    }
};

const updateClinic = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        createUserAuditing({
            user_id: req.user.id,
            action: 'edited',
            description: 'update clinic validation error',
            data: { ...req.body, ...req.params, ...req.file },
        })
        return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params
    const { name, address, image, start_time, end_time } = req.body;

    let auditData = {
        user_id: req.user.id,
        action: 'edited',
        description: 'update clinic failure',
        data: { ...req.body, ...req.params, ...req.file },
    };
    try {

        const existingClinic = await knex('clinic').where('id', id).first()
        if (!existingClinic) {
            createUserAuditing(auditData);
            return res.status(200).json({
                error: true,
                message: "Clinic not found",
            });
        }

        const updateClinicDetail = {
            name,
            address
        };

        if (image && isBase64Image(image)) {
            const uploadPath = "./uploads/images/clinic/";

            try {
                if (!fs.existsSync(uploadPath)) {
                    fs.mkdirSync(uploadPath, { recursive: true });
                }

                if (existingClinic.image) {
                    const oldFilePath = `./uploads/images/clinic/${existingClinic.image}`;
                    if (fs.existsSync(oldFilePath)) {
                        fs.unlinkSync(oldFilePath);
                    }
                }

                const imageName = uploadImage(image, uploadPath);
                updateClinicDetail.image = imageName;

            } catch (err) {
                createUserAuditing(auditData);
                console.error("Error handling image upload or deletion:", err);
            }

        } else if (!image) {
            if (existingClinic.image) {
                const oldFilePath = `./uploads/images/clinic/${existingClinic.image}`;
                try {
                    if (fs.existsSync(oldFilePath)) {
                        fs.unlinkSync(oldFilePath);
                    }
                } catch (err) {
                    createUserAuditing(auditData);
                    console.error("Error deleting old image:", err);
                }
            }

            updateClinicDetail.image = null;
        }
        await new knex('clinic').where('id', id).update(updateClinicDetail);

        const clinicTime = {
            clinic_id: id,
            start_time,
            end_time
        }

        await new knex('clinic_operation_hours').where('clinic_id', id).update(clinicTime);

        auditData = {
            ...auditData,
            description: 'clinic successfully'
        };
        createUserAuditing(auditData);

        return res.status(200).json({
            error: false,
            message: "Clinic updated successfully.",
        });
    } catch (error) {
        console.log(error.message);
        createUserAuditing(auditData);
        res.status(500).send("Server error");
    }
};

const deleteClinic = async (req, res) => {
    const { id } = req.params
    let auditData = {
        user_id: req.user.id,
        action: 'deleted',
        data: req.params,
        description: 'clinic failure',
    };

    try {

        const existingClinic = await knex('clinic').where('id', id).first()
        if (!existingClinic) {
            createUserAuditing(auditData)
            return res.status(200).json({
                error: true,
                message: "Clinic not found",
            });
        }

        await new knex('clinic').where('id', id).del();
        await new knex('clinic_operation_hours').where('clinic_id', id).del();

        if (existingClinic.image) {
            const oldFilePath = `./uploads/images/clinic/${existingClinic.image}`;
            if (fs.existsSync(oldFilePath)) {
                try {
                    fs.unlinkSync(oldFilePath);
                } catch (err) {
                    createUserAuditing(auditData)
                    console.error("Error deleting old image", err);
                }
            }
        }

        auditData = {
            ...auditData,
            description: `clinic successfully`
        }
        createUserAuditing(auditData)

        return res.status(200).json({
            error: false,
            message: "Clinic delete successfully.",
        });
    } catch (error) {
        console.log(error.message);
        createUserAuditing(auditData)
        res.status(500).send("Server error");
    }
};

module.exports = {
    createClinic,
    getAllClinics,
    getSingleClinic,
    updateClinic,
    deleteClinic
}