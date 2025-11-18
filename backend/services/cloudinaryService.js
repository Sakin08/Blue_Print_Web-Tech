import { cloudinary } from '../config/index.js';

export const uploadImage = async (file) => {
  const result = await cloudinary.uploader.upload(file.path, {
    folder: 'campus_hub',
    transformation: [{ width: 800, crop: 'limit' }],
  });
  return result.secure_url;
};