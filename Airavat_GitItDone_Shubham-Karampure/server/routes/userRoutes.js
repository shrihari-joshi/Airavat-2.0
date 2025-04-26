const express = require('express');
const userRoutes = express.Router();

const { userDetails, userLogin } = require('../controllers/userController');

userRoutes.post('/auth/register', userDetails);
userRoutes.post('/auth/login', userLogin);

module.exports = userRoutes;