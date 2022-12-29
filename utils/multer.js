const multer = require('multer');
const fs = require('fs');

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/')
    },
    filename(req, file, cb) {
        cb(null, file.originalname);
    }
});

const fileFilter = async (req, file, cb) => {
    //   check if file name already exists
    const check = fs.existsSync("./uploads/" + file.originalname)

    if (check) {
        return cb(null, new Error("File with the same name already exists"))
    }

    if (file.mimetype === 'image/jpeg'
        || file.mimetype === 'image/jpg'
        || file.mimetype === 'image/png') {
        cb(null, true);

    }
    else {
        return cb({ message: 'This image format is not allowed' }, false)
    }
    return true
}
const upload = multer({
    storage,
    limits: { fileSize: 1024 * 1024 * 5 },
    fileFilter
});

module.exports = upload