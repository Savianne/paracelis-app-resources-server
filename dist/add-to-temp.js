"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const express_1 = __importDefault(require("express"));
const nanoid_1 = require("nanoid");
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
// Set up multer storage
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './temp-upload'); // Specify the destination folder for uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, `${(0, nanoid_1.nanoid)(15)}.${path_1.default.extname(file.originalname)}`); // Set the filename for uploaded files
    },
});
// Create a multer upload instance
exports.upload = (0, multer_1.default)({ storage });
const UploaderRouter = express_1.default.Router();
UploaderRouter.post('/add-to-temp', (req, res) => {
    exports.upload.single('picture')(req, res, (err) => {
        var _a;
        if (err) {
            console.error('Error uploading file:', err);
            res.status(500).json({ success: false, error: "Error uploading file!" });
        }
        else {
            if (!req.file) {
                console.error('Error uploading file:', err);
                res.status(400).json({ success: false, error: "No file uploaded!" });
            }
            else {
                res.json({ success: true, data: { filename: (_a = req.file) === null || _a === void 0 ? void 0 : _a.filename } });
            }
        }
    });
});
exports.default = UploaderRouter;
