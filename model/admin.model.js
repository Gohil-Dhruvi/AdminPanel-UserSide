
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

const adminSchema = mongoose.Schema({
    firstname: String,
    lastname: String,
    email: String,
    password: String,
    gender: String,
    hobbies: Array,
    image: String,
})

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "..", "uploads"));
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}`);
    }
});

adminSchema.statics.uploadImage = multer({ storage: storage }).single('image');

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;