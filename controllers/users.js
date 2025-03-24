const { validationResult } = require("express-validator");
const { knex } = require("../database/db")
const jwt = require("jsonwebtoken");
const fs = require('fs')
const { hashPassword, comparePassword, isBase64Image, uploadImage, sendMailAsync, createUserAuditing, compileTemplate } = require("../helpers/helper");

const signupUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        createUserAuditing({
            user_id: null,
            action: 'registered',
            description: 'user validation error',
            data: req.body,
        })
        return res.status(400).json({ errors: errors.array() });
    }

    const { first_name, last_name, email, password } = req.body;

    let auditData = {
        user_id: null,
        action: 'registered',
        description: 'user failure',
        data: req.body,
    };
    try {

        const existingUser = await knex('users').where('email', email).first();
        if (existingUser) {
            createUserAuditing(auditData)
            return res.status(200).json({
                error: true,
                message: "User already registered with this email.",
            });
        }

        const role = await knex('user_role').where('name', 'Patient').first();
        if (!role) {
            createUserAuditing(auditData)
            return res.status(400).json({
                error: true,
                message: "Patient role not found. Please check the database.",
            });
        }

        const hashedPassword = await hashPassword(password);

        const [newUserId] = await knex('users')
            .insert({
                first_name,
                last_name,
                email,
                role_id: role.id,
                password: hashedPassword,
            })
            .returning('id');

        const emailTemplateData = {
            first_name,
            last_name,
            current_year: new Date().getFullYear(),
            domain_name: process.env.DOMAIN_NAME || "Our Clinic",
        };

        const emailContent = compileTemplate(emailTemplateData, './templates/welcomeEmail.html');

        sendMailAsync({
            from: process.env.MAIL_AUTH_USER,
            to: email,
            subject: 'Welcome to Our Service!',
            html: emailContent,
        });

        auditData = {
            user_id: null,
            action: 'registered',
            description: 'successfully',
            data: req.body,
        };

        createUserAuditing(auditData)

        return res.status(201).json({
            error: false,
            message: `Thank you, ${first_name}, for registering with us! Your account has been created successfully`,
        });
    } catch (error) {
        createUserAuditing(auditData)
        console.error("Error in signupUser:", error.message);
        res.status(500).json({
            error: true,
            message: "Internal server error. Please try again later.",
        });
    }
};


const loginUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        createUserAuditing({
            user_id: null,
            action: 'login',
            description: 'validation error',
            data: req.body,
        })
        return res.status(400).json({ error: true, errors: errors.array() });
    }

    const { email, password } = req.body;

    let auditData = {
        user_id: null,
        action: 'login',
        description: 'failure',
        data: req.body,
    };
    try {

        const user = await knex('users').where('email', email).first();
        if (!user) {
            createUserAuditing(auditData);

            return res.status(200).json({
                error: true,
                message: "Wrong credentials. Please check your email or password.",
            });
        }

        if (!user?.is_active) {
            createUserAuditing(auditData);

            return res.status(200).json({
                error: true,
                message: "Your account has been marked as inactive. You do not have permission to log in to the system. Please contact the system administrator.",
            });
        }

        const match = await comparePassword(password, user.password);
        if (!match) {
            createUserAuditing(auditData);

            return res.status(200).json({
                error: true,
                message: "Wrong credentials. Please check your email or password.",
            });
        }

        const token = await jwt.sign({ user }, process.env.JWT_SECRET_KEY, { expiresIn: "365 days", });

        auditData = {
            ...auditData,
            user_id: user.id,
            description: 'successfully',
        };

        createUserAuditing(auditData);

        return res.status(200).send({
            error: false,
            message: "Login successfully !",
            data: {
                user,
                token
            }
        });
    } catch (error) {
        createUserAuditing(auditData);
        console.log(error.message);
        return res.status(500).send("Server error");
    }
};


const createUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        createUserAuditing({
            user_id: req.user.id,
            action: 'created',
            description: 'user validation error',
            data: {
                ...req.body,
                ...(req.body.photo && { photo: undefined }),
            },
        })
        return res.status(400).json({ errors: errors.array() });
    }

    const { first_name, last_name, email, password, role_id, clinic_id, degree, photo } = req.body;
    let auditData = {
        user_id: req.user.id,
        action: 'created',
        description: 'user failure',
        data: {
            ...req.body,
            ...(req.body.photo && { photo: undefined }),
        },
    };

    try {
        const existingUser = await knex('users').where('email', email).first()
        if (existingUser) {
            createUserAuditing(auditData);
            return res.status(200).json({
                error: true,
                message: "User already register with this email.",
            });
        }

        const hashedPassword = await hashPassword(password);

        const userDetail = {
            first_name,
            last_name,
            email,
            role_id,
            degree: degree ? degree : null,
            password: hashedPassword
        };

        if (role_id == 2) {
            userDetail.clinic_id = clinic_id?.value ? clinic_id?.value : null
        }

        if (photo && isBase64Image(photo)) {
            const uploadPath = "./uploads/images/user/";
            const imageName = uploadImage(photo, uploadPath);
            userDetail.photo = imageName;
        }

        const newUser = await knex('users').insert(userDetail);

        auditData = {
            user_id: req.user.id,
            action: 'created',
            description: 'successfully',
            data: {
                ...req.body,
                ...(req.body.photo && { photo: undefined }),
            },
        };
        createUserAuditing(auditData);

        return res.status(201).json({
            error: false,
            message: "User created successfully.",
            user: newUser[0]
        });
    } catch (error) {
        console.log(error.message);
        createUserAuditing(auditData);
        res.status(500).send("Server error");
    }
};

const getAllUsers = async (req, res) => {
    let { sortField, sortOrder, page, limit, filter, isActiveUsers } = req.query;

    filter = filter || null;
    page = page ? parseInt(page) : 1;
    limit = limit ? parseInt(limit) : 10;
    sortOrder = parseInt(sortOrder) || -1;
    sortField = sortField || 'created_at';
    isActiveUsers = isActiveUsers == "false" ? 0 : 1;

    try {
        let query = knex('users')
            .select(
                'users.id',
                'users.first_name',
                'users.last_name',
                'users.email',
                'users.clinic_id',
                'users.role_id',
                'users.degree',
                'users.created_at',
                'users.photo',
                'users.is_active',
                'user_role.name as role_name',
                'clinic.name as clinic_name'
            )
            .innerJoin('user_role', 'users.role_id', 'user_role.id')
            .leftJoin('clinic', 'users.clinic_id', 'clinic.id');

        if (filter && filter !== 'null') {
            query = query.where((qb) => {
                qb.where('users.first_name', 'like', `%${filter}%`)
                    .orWhere('users.last_name', 'like', `%${filter}%`)
                    .orWhere('users.email', 'like', `%${filter}%`)
                    .orWhere('users.degree', 'like', `%${filter}%`)
                    .orWhere('user_role.name', 'like', `%${filter}%`)
                    .orWhere('clinic.name', 'like', `%${filter}%`);
            });
        }

        query = query.andWhere('users.is_active', isActiveUsers);

        // Add condition to exclude role_id 3
        query = query.andWhereNot('users.role_id', 3);

        if (sortField !== 'undefined' && sortOrder) {
            const sortColumn =
                sortField === 'clinic_name' ? 'clinic.name' : `users.${sortField}`;
            query = query.orderBy(sortColumn, sortOrder === -1 ? 'desc' : 'asc');
        }

        const totalCountQuery = query.clone().clearSelect().clearOrder().count('* as totalCount').first();
        const totalCountResult = await totalCountQuery;
        const totalCount = totalCountResult.totalCount;

        if (page && limit) {
            const offset = (page - 1) * limit;
            query = query.offset(offset).limit(limit);
        }

        const users = await query;

        const formattedUsers = users.map((u) => {
            const photoUrl = u.photo ? `${DOMAIN}/images/user/${u.photo}` : null;
            return {
                ...u,
                photo: photoUrl,
            };
        });

        return res.status(200).send({
            error: false,
            message: "All users retrieved successfully.",
            data: formattedUsers,
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit),
            totalCount: totalCount,
        });
    } catch (error) {
        console.error(error.message);
        return res.status(500).send("Server error");
    }
};

const getAllDoctors = async (req, res) => {
    try {
        const { id } = req.params
        const doctors = await knex('users')
            .where('role_id', 2)
            .andWhere('is_active', 1)
            .andWhere('clinic_id', id)
            .select('id', 'first_name', 'last_name', 'email', 'clinic_id', 'role_id', 'degree', 'created_at', 'photo')

        const formattedDoctors = doctors.map((d) => {
            const photoUrl = d.photo ? `${DOMAIN}/images/user/${d.photo}` : null;
            return {
                ...d,
                photo: photoUrl,
            };
        });

        return res.status(200).json({
            error: false,
            message: "Doctors get successfully.",
            data: formattedDoctors
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Server error");
    }
};

const getSingleUser = async (req, res) => {
    try {
        const { id } = req.params

        const user = await knex('users')
            .where('id', id)
            .select('id', 'first_name', 'last_name', 'email', 'clinic_id', 'role_id', 'degree', 'created_at', 'photo', 'is_active')
            .first();

        if (!user) {
            return res.status(200).json({
                error: true,
                message: "User not found",
            });
        }

        return res.status(200).json({
            error: false,
            message: "User get successfully.",
            data: {
                ...user,
                photo: user.photo ? `${DOMAIN}/images/user/${user.photo}` : null,
            }
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Server error");
    }
};

const updatePassword = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        createUserAuditing({
            user_id: req.user.id,
            action: 'edited',
            description: 'update password validation error',
            data: { ...req.body, ...req.params },
        })
        return res.status(400).json({ errors: errors.array() });
    }
    const { id } = req.params;
    const { password } = req.body;

    let auditData = {
        user_id: req.user.id,
        action: 'edited',
        description: 'update password failure',
        data: { ...req.body, ...req.params },
    };

    try {
        const existingUser = await knex("users").where("id", id).first();
        if (!existingUser) {
            createUserAuditing(auditData)
            return res.status(200).json({
                error: true,
                message: "User not found",
            });
        }
        const hashedPassword = await hashPassword(password);

        const updateDetail = {
            password: hashedPassword,
        }

        await new knex('users').where('id', id).update(updateDetail);

        auditData = {
            user_id: req.user.id,
            action: 'edited',
            description: 'update password successfully',
            data: { ...req.body, ...req.params },
        };
        createUserAuditing(auditData)

        return res.status(200).json({
            error: false,
            message: "User password updated successfully.",
        });
    } catch (error) {
        console.log(error.message);
        createUserAuditing(auditData)
        res.status(500).send("Server error");
    }
}

const updateUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        createUserAuditing({
            user_id: req.user.id,
            action: 'edited',
            description: 'update user failure',
            data: {
                ...req.body,
                ...req.params,
                ...(req.body.photo && { photo: undefined }),
            },
        })
        return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params
    const { first_name, last_name, email, role_id, clinic_id, degree, photo, is_active } = req.body;

    let auditData = {
        user_id: req.user.id,
        action: 'edited',
        description: 'update user failure',
        data: {
            ...req.body,
            ...req.params,
            ...(req.body.photo && { photo: undefined }),
        },
    };

    try {
        const existingUser = await knex('users').where('id', id).first()
        if (!existingUser) {
            createUserAuditing(auditData)
            return res.status(200).json({
                error: true,
                message: "User not found",
            });
        }

        const updateUserDetail = {
            first_name,
            last_name,
            email,
            role_id,
            clinic_id: clinic_id?.value ? clinic_id?.value : null,
            degree: degree ? degree : null,
            is_active: is_active ? 1 : 0
        };

        if (photo && isBase64Image(photo)) {
            const uploadPath = "./uploads/images/user/";

            if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath, { recursive: true });
            }

            if (existingUser.photo) {
                const oldFilePath = `${uploadPath}${existingUser.photo}`;
                if (fs.existsSync(oldFilePath)) {
                    try {
                        fs.unlinkSync(oldFilePath);
                    } catch (err) {
                        console.error("Error deleting old image:", err);
                    }
                }
            }

            try {
                const imageName = uploadImage(photo, uploadPath);
                updateUserDetail.photo = imageName;
            } catch (err) {
                createUserAuditing(auditData)
                console.error("Error uploading new image:", err);
            }
        } else if (!photo) {
            if (existingUser.photo) {
                const oldFilePath = `./uploads/images/user/${existingUser.photo}`;

                try {
                    if (fs.existsSync(oldFilePath)) {
                        fs.unlinkSync(oldFilePath);
                    }
                } catch (err) {
                    createUserAuditing(auditData)
                    console.error("Error deleting old image:", err);
                }
            }
            updateUserDetail.photo = null;
        }

        await new knex('users').where('id', id).update(updateUserDetail);

        auditData = {
            user_id: req.user.id,
            action: 'edited',
            description: 'update user successfully',
            data: {
                ...req.body,
                ...req.params,
                ...(req.body.photo && { photo: undefined }),
            },
        };
        createUserAuditing(auditData)

        return res.status(200).json({
            error: false,
            message: "User updated successfully.",
        });
    } catch (error) {
        console.log(error.message);
        createUserAuditing(auditData)
        res.status(500).send("Server error");
    }
};

const deleteUser = async (req, res) => {
    let auditData = {
        user_id: req.user.id,
        action: 'deleted',
        data: req.params,
        description: 'user failure',
    };

    try {
        const { id } = req.params

        const existingUser = await knex('users').where('id', id).first()
        if (!existingUser) {
            createUserAuditing(auditData)
            return res.status(200).json({
                error: true,
                message: "User not found",
            });
        }

        await new knex('users').where('id', id).del();

        if (existingUser.photo) {
            const oldFilePath = `./uploads/images/user/${existingUser.photo}`;
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
            description: `user successfully`
        }
        createUserAuditing(auditData)

        return res.status(200).json({
            error: false,
            message: "User delete successfully.",
        });
    } catch (error) {
        console.log(error.message);
        createUserAuditing(auditData)
        res.status(500).send("Server error");
    }
};

const getAllActions = async (req, res) => {
    let { sortField, sortOrder, page, limit, filter } = req.query;

    filter = filter || null;
    page = page ? parseInt(page) : null;
    limit = limit ? parseInt(limit) : null;
    sortOrder = parseInt(sortOrder) || -1;
    sortField = sortField || 'created_at';

    try {
        let baseQuery = knex('users_auditing')
            .leftJoin('users', 'users_auditing.user_id', 'users.id')
            .leftJoin('user_role', 'users.role_id', 'user_role.id')
            .select(
                'users_auditing.*',
                'users.first_name',
                'users.last_name',
                'user_role.name as role',
                knex.raw("CONCAT(users.first_name, ' ', users.last_name) AS full_name")
            );

        if (filter && filter !== 'null') {
            baseQuery = baseQuery.where((qb) => {
                qb.where('users_auditing.action', 'like', `%${filter}%`)
                    .orWhere('users_auditing.description', 'like', `%${filter}%`)
                    .orWhere('users.first_name', 'like', `%${filter}%`)
                    .orWhere('users.last_name', 'like', `%${filter}%`)
                    .orWhere('user_role.name', 'like', `%${filter}%`);
            });
        }

        if (sortField !== 'undefined' && sortOrder) {
            baseQuery = baseQuery.orderBy(sortField, sortOrder === -1 ? 'desc' : 'asc');
        }

        const totalCountQuery = knex('users_auditing')
            .count('* as totalCount')
            .first();

        const totalCountResult = await totalCountQuery;
        const totalCount = totalCountResult.totalCount;

        if (page && limit) {
            const offset = (page - 1) * limit;
            baseQuery = baseQuery.offset(offset).limit(limit);
        }

        const results = await baseQuery;

        return res.status(200).send({
            error: false,
            message: "All actions retrieved successfully.",
            data: results,
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit),
            totalCount: totalCount
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).send("Server error");
    }
};

module.exports = {
    signupUser,
    loginUser,
    createUser,
    getAllUsers,
    getAllDoctors,
    getAllActions,
    getSingleUser,
    updateUser,
    updatePassword,
    deleteUser
}