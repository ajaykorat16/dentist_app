const bcrypt = require("bcrypt");
const saltRounds = 10;
const mimeTypes = require('mime-types');
const fs = require('fs')
const path = require('path')
const { promisify } = require('util');
const hbs = require("handlebars")
const nodemailer = require("nodemailer")
const { knex } = require("../database/db");

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: 587,
    secure: false,
    auth: {
        user: process.env.MAIL_AUTH_USER,
        pass: process.env.MAIL_AUTH_PASS,
    },
});

const sendMailAsync = promisify(transporter.sendMail).bind(transporter);

const hashPassword = async (password) => {
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    } catch (error) {
        console.log(error);
    }
};

const comparePassword = async (password, hashPassword) => {
    try {
        return bcrypt.compare(password, hashPassword);
    } catch (error) {
        console.log(error);
    }
};

function decodeBase64Image(dataString) {
    var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
        response = {};

    if (!matches || matches.length !== 3) {
        return new Error('Invalid input string');
    }

    response.type = matches[1];
    response.data = Buffer.from(matches[2], 'base64');

    return response;
}

function getExtensionFromImage(filename) {
    return filename.split('.').pop().toLowerCase();
}

const isBase64Image = (str) => {
    return /^data:image\/([a-zA-Z+]+);base64,/.test(str);
};

function uploadImage(image, uploadPath, fileName = Date.now()) {
    const decodedImg = decodeBase64Image(image);
    const imageBuffer = decodedImg.data;
    const type = decodedImg.type;
    const extension = mimeTypes.extension(type) || 'png';
    const imgName = `${fileName}.${extension}`;

    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath);
    }

    try {
        fs.writeFileSync(uploadPath + imgName, imageBuffer, 'utf8');
        return imgName;
    } catch (err) {
        console.error("Image upload error", err);
    }
}

const compileTemplate = function (data, template) {
    try {
        var html = fs.readFileSync(template, "utf8")
        const templateScript = hbs.compile(html)

        const res = templateScript(data)
        return res
    } catch (error) {
        console.error('Error reading the file:', error.message);
    }
}

const createUserAuditing = async (data) => {
    try {
        if (
            !data ||
            typeof data !== 'object' ||
            !data.action ||
            !data.description
        ) {
            throw new Error(
                "Invalid data provided. The object must contain 'action', and 'description'."
            );
        }

        await knex('users_auditing').insert(data);
        // console.log("Data successfully inserted into users_auditing.");
    } catch (error) {
        console.error("Error inserting data into users_auditing:", error.message);
        throw error;
    }
};

const formatToLocalDate = (dateInput) => {
    const localDate = new Date(dateInput);
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

module.exports = {
    sendMailAsync,
    hashPassword,
    comparePassword,
    decodeBase64Image,
    getExtensionFromImage,
    isBase64Image,
    uploadImage,
    compileTemplate,
    createUserAuditing,
    formatToLocalDate
}