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
  const signature=await fs.readFile(req.file.path);
  const jpeg=signature.length>=3 && signature[0]===0xff && signature[1]===0xd8 && signature[2]===0xff;
  const png=signature.length>=8 && signature.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  const webp=signature.length>=12 && signature.subarray(0,4).toString('ascii')==='RIFF' && signature.subarray(8,12).toString('ascii')==='WEBP';
  if(!jpeg&&!png&&!webp){
    await fs.unlink(req.file.path).catch(()=>{});
    return res.status(400).json({success:false,message:'The uploaded file is not a valid supported image'});
  }
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
