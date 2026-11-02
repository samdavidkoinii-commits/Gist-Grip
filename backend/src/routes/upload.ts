import { Router } from 'express';
import multer from 'multer';
import fs from 'node:fs/promises';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import { uploadImage } from '../services/cloudinary.js';
const router=Router();
const upload=multer({
  dest:'tmp/',
  limits:{fileSize:5*1024*1024},
  fileFilter:(_req,file,callback)=>{
    callback(null,['image/jpeg','image/png','image/webp'].includes(file.mimetype));
  }
});
router.post('/image',requireAuth,requireRoles('ADMIN','SUPER_ADMIN'),upload.single('image'),async(req,res)=>{
  if(!req.file)return res.status(400).json({success:false,message:'No image supplied or unsupported image type'});
  try{
    const result=await uploadImage(req.file.path);
    await fs.unlink(req.file.path).catch(()=>{});
    return res.json({success:true,data:result});
  }catch(error){
    console.error('Image upload failed',error);
    await fs.unlink(req.file.path).catch(()=>{});
    return res.status(500).json({success:false,message:'Image upload failed'});
  }
});
export default router;
