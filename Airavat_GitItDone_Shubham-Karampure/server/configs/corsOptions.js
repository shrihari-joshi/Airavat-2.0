const allowedOrigins = require('./allowedOrigin');
const cors = require('cors');

// Allow all origins
const corsOptions = {
    origin: allowedOrigins.includes('*') ? '*' : allowedOrigins,
    optionsSuccessStatus: 200
};

module.exports = corsOptions