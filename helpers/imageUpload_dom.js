const multer = require('multer');
const path = require('path');

// Set The Storage Engine
const storage = multer.diskStorage({
    
    destination: (req, file, callback) => {
        callback(null, './public/schuploads/');
    },
    
    filename: (req, file, callback) => {
        callback(null, "schimg_" + req.user.id + "_" + file.originalname);
    }
});

// Initialise Upload
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10000000
    },
    fileFilter: (req, file, callback) => {
        checkFileType(file, callback);
    }
}).single('schImgUpload'); // Must be the name as the HTML file upload input

// Check File Type
function checkFileType(file, callback) {

    // Allowed file extensions
    const filetypes = /jpeg|jpg|png|gif/;

    // Test extension
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    // Test mime
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype && extname) {
        return callback(null, true);
    } else {
        callback({ message: 'Images Only' });
    }
}
module.exports = upload; 