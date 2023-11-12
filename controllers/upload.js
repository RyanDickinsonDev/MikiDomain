const fs = require('fs-extra');
const path = require('path');
const sharp = require('sharp'); // Import the sharp package
const Employee = require('../models/Employee');

const multer = require('multer');

// Configure multer storage
const storage = multer.diskStorage({
  destination: 'uploads/', // Specify the destination directory for uploaded files
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname);
    cb(null, uniqueSuffix + fileExtension);
  },
});

// Create multer instance
const upload = multer({ storage: storage });

// Handle profile picture upload
exports.uploadProfilePicture = (req, res, next) => {
  upload.single('file')(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // Multer error occurred
      return res.status(500).json({ error: 'Failed to upload file' });
    } else if (err) {
      // Other error occurred
      return res.status(500).json({ error: 'Failed to upload file' });
    }
    // No error, proceed to process the upload
    processUpload(req, res, next);
  });

};

const processUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { filename, path: filePath } = req.file;
    


    // Create the destination directory if it doesn't exist
    const destinationDir = path.join(__dirname, '../client/uploads');
    await fs.ensureDir(destinationDir);

    //Save the file to a permanent location
    const destinationPath = path.join(destinationDir, filename);
    await fs.move(filePath, destinationPath);

    // Insert file information into the employees table
    const user_id  = req.session.userId;
    await Employee.updateProfilePicture(user_id, filename);

    return res.status(200).json({ message: 'File uploaded successfully', redirectUrl: "dashboard" });
  } catch (error) {
    console.error('Error uploading file:', error);
    return res.status(500).json({ error: 'Failed to upload file' });
  }
};


exports.getProfilePicture = async (req, res) => {
  try {
    const userId = req.session.userId; // Get the user ID from the session or wherever it's stored
    const employee = await Employee.findById(userId); // Fetch the employee record from the database

    if (!employee || !employee.profile_picture) {
      // If employee record or profile picture is not found
      return res.status(404).json({ error: 'Profile picture not found' });
    }

    const profilePicturePath = path.join(__dirname, '../client/uploads', employee.profile_picture);

    // Serve the profile picture as a static file
    res.sendFile(profilePicturePath);
  } catch (error) {
    console.error('Error retrieving profile picture:', error);
    return res.status(500).json({ error: 'Failed to retrieve profile picture' });
  }
};