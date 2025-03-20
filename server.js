require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { createServer } = require('http');
const PORT = process.env.PORT || 8080
const bodyParser = require('body-parser');
global.DOMAIN = process.env.DOMAIN

const user = require("./routers/users")
const clinic = require("./routers/clinic")
const appointment = require("./routers/appointment")
const treatmentNote = require("./routers/treamtmentNotes")

const app = express()
const server = createServer(app);

app.use(cors())
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(express.json())
app.use("/images", express.static("uploads/images"));

app.use("/user", user)
app.use("/clinic", clinic)
app.use("/appointment", appointment)
app.use("/note", treatmentNote)

server.listen(PORT, () => {
  console.log(`Server running in http://localhost:${PORT}`);  
})
