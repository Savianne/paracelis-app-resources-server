import express, { RequestHandler, Request, Response } from 'express';
import { customAlphabet, nanoid } from 'nanoid';
import path from "path";
import fs from "fs-extra";
import multer from 'multer';

// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './temp-upload'); // Specify the destination folder for uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, `${nanoid(15)}.${path.extname(file.originalname)}`); // Set the filename for uploaded files
  },
});

  // Create a multer upload instance
export const upload = multer({ storage });

const UploaderRouter = express.Router();

UploaderRouter.post('/add-to-temp', (req, res) => {
  upload.single('picture')(req, res, (err) => {
    if (err) {
      console.error('Error uploading file:', err);
      res.status(500).json({success: false, error: "Error uploading file!"});
    } else {
      if (!req.file) {
        console.error('Error uploading file:', err);
        res.status(400).json({success: false, error: "No file uploaded!" });
      } else {
          res.json({success: true, data: { filename: req.file?.filename } });
      }
    }
  });
})

UploaderRouter.post('/move-to-gallery', async (req, res) => {
  console.log(req.body)
  const images = req.body.images as string[];
  if (!images || images.length === 0) {
    res.status(400).json({ success: false, error: "No images provided!" });
  }

  try {
    const movePromises = images.map(image => 
      fs.move(
        path.join(__dirname, "../", "temp-upload", image),
        path.join(__dirname, "../", "public/images/gallery", image)
      ).then(() => {
        return { image, success: true };
      }).catch(err => {
        return { image, success: false, error: `Failed to move ${image}: ${err.message}` };
      })
    );

     // Wait for all promises to finish
     const results = await Promise.all(movePromises);

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
  catch(err) {
    console.log(err)
    res.status(500).json({ success: false, error: `Internal server error:` });
  }
});

UploaderRouter.post("/delete-image", async (req, res) => {
  const imagesFolder = path.join(__dirname, '../public/images/gallery');
  const imageName = req.body.data;

  const imagePath = path.join(imagesFolder, imageName);

  try {
    // Check if the image file exists
    if (fs.existsSync(imagePath)) {
      // Delete the image file
      fs.unlinkSync(imagePath);
      res.json({ success: true });
    } else {
      res.json({ success: false, error: "Image not found" });
    }
  } catch (error) {
    console.log(error)
    res.json({ success: false, error: "Failed to delete image" });
  }

});

UploaderRouter.post("/delete-images", async (req, res) => {
  const imagesFolder = path.join(__dirname, '../public/images/gallery');
  const { images } = req.body.data; // Array of image names

  if (!Array.isArray(images) || images.length === 0) {
    res.json({ success: false, error: "Invalid or empty image list" });
    return;
  }

  let deletedImages = [];
  let failedImages = [];

  try {
    for (const imageName of images) {
      const imagePath = path.join(imagesFolder, imageName);

      if (fs.existsSync(imagePath)) {
        // Delete the image file
        fs.unlinkSync(imagePath);
        deletedImages.push(imageName);
      } else {
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

  } catch (error) {
    console.error(error);
    res.json({ success: false, error: "An error occurred while deleting images" });
  }
});


export default UploaderRouter;
