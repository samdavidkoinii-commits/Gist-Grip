import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { findUserByEmail } from '../store.js';
import { signToken } from '../utils/auth.js';
import { prisma } from '../db.js';
import { demo } from '../store.js';

const router = Router();
const schema = z.object({ email:z.email(), password:z.string().min(6), name:z.string().min(2).optional(), phone:z.string().optional() });

router.post('/register', async (req,res) => {
  const parsed = schema.safeParse(req.body); if(!parsed.success) return res.status(400).json({success:false,message:'Invalid registration details'});
  const {email,password,name,phone} = parsed.data;
  if(await findUserByEmail(email)) return res.status(409).json({success:false,message:'Email already registered'});
  const passwordHash = await bcrypt.hash(password,10);
  if(prisma){
    const user = await prisma.user.create({data:{email,name:name!,phone,passwordHash}});
    const token = signToken({id:user.id,email:user.email,name:user.name,role:user.role});
    return res.status(201).json({success:true,data:{token,user:{id:user.id,name:user.name,email:user.email,role:user.role}}});
  }
  const user = {id: Math.max(...demo.users.map(u=>u.id))+1,name:name!,email,phone,passwordHash,role:'CUSTOMER' as const};
  demo.users.push(user);
  return res.status(201).json({success:true,data:{token:signToken({id:user.id,email:user.email,name:user.name,role:user.role}),user:{id:user.id,name:user.name,email:user.email,role:user.role}}});
});

router.post('/login', async (req,res)=>{
  const parsed = z.object({email:z.email(),password:z.string()}).safeParse(req.body); if(!parsed.success) return res.status(400).json({success:false,message:'Invalid login details'});
  const user:any = await findUserByEmail(parsed.data.email); if(!user) return res.status(401).json({success:false,message:'Invalid email or password'});
  if(!(await bcrypt.compare(parsed.data.password,user.passwordHash))) return res.status(401).json({success:false,message:'Invalid email or password'});
  const token = signToken({id:user.id,email:user.email,name:user.name,role:user.role});
  res.json({success:true,data:{token,user:{id:user.id,name:user.name,email:user.email,role:user.role}}});
});

export default router;
