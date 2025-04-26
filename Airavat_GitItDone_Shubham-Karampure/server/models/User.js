const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        // required: true
    },
    lastName: {
        type: String,
        // required: true
    },
    email : {
        type : String,
        required : true,
        unique: true // Assuming email should be unique now
    },
    password: {
        type: String,
        required: true
    },
    education_level: {
        type: String,
        default: 'middle_school'
    },
    domains : {
        type: String,
        default: []
    },
});

const User = mongoose.model('User', userSchema);
module.exports = User;