const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/images');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // keep original name
    }
});

const upload = multer({ storage: storage });

module.exports = upload;
