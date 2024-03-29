import multer from "multer";

// Create a multer upload middleware with the specified configuration
export function createMulterUpload() {
  // Use memory storage to store the file
  const storage = multer.memoryStorage();

  // Return the multer middleware with the storage configuration
  return multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
    fileFilter: function (req, file, cb) {
      // Only allow image MIME types
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
        cb(new Error("Only image files are allowed!"));
      } else {
        cb(null, true);
      }
    },
  });
}
