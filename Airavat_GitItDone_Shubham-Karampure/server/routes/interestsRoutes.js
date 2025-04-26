const express = require('express');
const interestsRoutes = express.Router();

const { updateInterests, getInterests, deleteInterests  } = require('../controllers/InterestsController');

interestsRoutes.post('/add-interest', updateInterests);
interestsRoutes.post('/get-interests', getInterests);
interestsRoutes.delete('/delete-interest', deleteInterests);

module.exports = interestsRoutes;