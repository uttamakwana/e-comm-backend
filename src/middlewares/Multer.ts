import multer from 'multer';
import { v4 as uuid } from 'uuid';

//* creating a storage to store the photo in a temporary storage rather then storing in a RAM
const storage = multer.diskStorage({
 // specifying the destination where images will store
 destination(req, file, callback) {
  callback(null, "uploads");
 },
 // specifying the filename
 filename(req, file, callback) {
  const id = uuid();
  const extensionName = file.originalname.split(".").pop();
  const fileName = `${id}.${extensionName}`
  callback(null, fileName);
 }
});

// we can use this middelware wherever we are uplading any kind of static data(images)
export const singleUpload = multer({ storage }).single("photo");
