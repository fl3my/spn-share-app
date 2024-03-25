import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export const saveImage = (file: Express.Multer.File): string => {
  // Generate a unique filename
  const filename = uuidv4() + path.extname(file.originalname);

  // Define the uploads directory path
  const uploadsDir = path.join(__dirname, "..", "..", "public", "uploads");

  // Check if the uploads directory exists and if not, create it
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Save the image to the uploads directory
  const filePath = path.join(
    __dirname,
    "..",
    "..",
    "public",
    "uploads",
    filename
  );

  // Write the image in the buffer to the uploads directory
  fs.writeFileSync(filePath, file.buffer);

  // Return the created filename
  return filename;
};

export const deleteImage = (filename: string): void => {
  // Generate the file path
  const oldImagePath = path.join(
    __dirname,
    "..",
    "..",
    "public",
    "uploads",
    filename
  );

  // Delete the image file
  fs.unlinkSync(oldImagePath);
};

export function updateImage(
  oldFilename: string,
  file: Express.Multer.File
): string {
  // Delete the old image file
  deleteImage(oldFilename);

  // Save the new image file and get the filename
  const newFilename = saveImage(file);

  return newFilename;
}
