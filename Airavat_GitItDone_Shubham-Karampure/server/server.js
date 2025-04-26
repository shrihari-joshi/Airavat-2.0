const express = require('express');
const { mongoose } = require('mongoose');
const path = require('path');
const cors = require('cors');
require("dotenv").config();

const corsOptions = require('./configs/corsOptions');
const credentials = require('./middlewares/credentials');
const dbConnect = require("./configs/dbConn");

const app = express();
const server = require('http').createServer(app);
dbConnect();

app.use(credentials);
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use('/uploads/images', express.static(path.join(__dirname, 'uploads/images')));
app.use('/uploads/videos', express.static(path.join(__dirname, 'uploads/images')));

// ROUTES
app.use('/image', require('./routes/imageRoutes'));
app.use('/video', require('./routes/videoRoutes'));
app.use('/user', require('./routes/userRoutes'));
app.use('/chapter', require('./routes/chapterRoutes')); 
app.use('/interests', require('./routes/interestsRoutes'));
app.use('/comic-blog', require('./routes/comicRoutes'));

// DATABASE CONNECTION EVENTS
mongoose.connection.on('open', () => {
    console.log('Connected to MongoDB');
    server.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    });
});
app.use('/uploads/images', express.static(path.join(__dirname, 'uploads/images')));

app.get('/test-image', (req, res) => {
  res.sendFile(path.join(__dirname, 'uploads/images/dc_image3.jpeg'));
});

mongoose.connection.on('error', (err) => {
    console.log(err);
});
