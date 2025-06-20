import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary';

const storage = new CloudinaryStorage({
  cloudinary,
  params: async () => {
    return {
      folder: 'pet_app',
      allowed_formats: ['jpg', 'png', 'jpeg'],
      transformation: [{ width: 800, height: 800, crop: 'limit' }],
    };
  },
});

const upload = multer({ storage });

export default upload;
