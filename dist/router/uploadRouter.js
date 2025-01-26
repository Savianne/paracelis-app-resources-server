"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const express_1 = __importDefault(require("express"));
const nanoid_1 = require("nanoid");
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
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
UploaderRouter.post('/move-to-gallery', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.body);
    const images = req.body.images;
    if (!images || images.length === 0) {
        res.status(400).json({ success: false, error: "No images provided!" });
    }
    try {
        const movePromises = images.map(image => fs_extra_1.default.move(path_1.default.join(__dirname, "../", "temp-upload", image), path_1.default.join(__dirname, "../", "public/images/gallery", image)).then(() => {
            return { image, success: true };
        }).catch(err => {
            return { image, success: false, error: `Failed to move ${image}: ${err.message}` };
        }));
        // Wait for all promises to finish
        const results = yield Promise.all(movePromises);
        // Separate successful and failed operations
        const failed = results.filter(result => !result.success);
        const successful = results.filter(result => result.success);
        if (failed.length > 0) {
            res.status(400).json({
                success: false,
                message: "Some files could not be moved.",
                failed,
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "All files moved successfully.",
            successful,
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ success: false, error: `Internal server error:` });
    }
}));
UploaderRouter.post("/delete-image", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const imagesFolder = path_1.default.join(__dirname, '../public/images/gallery');
    const imageName = req.body.data;
    const imagePath = path_1.default.join(imagesFolder, imageName);
    try {
        // Check if the image file exists
        if (fs_extra_1.default.existsSync(imagePath)) {
            // Delete the image file
            fs_extra_1.default.unlinkSync(imagePath);
            res.json({ success: true });
        }
        else {
            res.json({ success: false, error: "Image not found" });
        }
    }
    catch (error) {
        console.log(error);
        res.json({ success: false, error: "Failed to delete image" });
    }
}));
UploaderRouter.post("/delete-images", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const imagesFolder = path_1.default.join(__dirname, '../public/images/gallery');
    const { images } = req.body.data; // Array of image names
    if (!Array.isArray(images) || images.length === 0) {
        res.json({ success: false, error: "Invalid or empty image list" });
        return;
    }
    let deletedImages = [];
    let failedImages = [];
    try {
        for (const imageName of images) {
            const imagePath = path_1.default.join(imagesFolder, imageName);
            if (fs_extra_1.default.existsSync(imagePath)) {
                // Delete the image file
                fs_extra_1.default.unlinkSync(imagePath);
                deletedImages.push(imageName);
            }
            else {
                failedImages.push({ imageName, error: "Image not found" });
            }
        }
        if (failedImages.length > 0) {
            res.json({
                success: false,
                message: "Some images could not be deleted",
                deletedImages,
                failedImages
            });
            return;
        }
        res.json({ success: true, message: "All images deleted successfully", deletedImages });
    }
    catch (error) {
        console.error(error);
        res.json({ success: false, error: "An error occurred while deleting images" });
    }
}));
exports.default = UploaderRouter;
