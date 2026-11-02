import { Router } from 'express';
import { prisma } from '../db.js';
import { demo } from '../store.js';
import { z } from 'zod';
import { sendContactMessage } from '../services/email.js';

const router = Router();

router.get('/services', async (_req,res)=>{
  const services = prisma ? await prisma.service.findMany({where:{status:'ACTIVE'},include:{category:true},orderBy:{id:'asc'}}) : demo.services.map(s=>({...s,category:{name:s.category}}));
  res.json({success:true,data:services});
});
router.get('/services/:id', async (req,res)=>{
  const id=Number(req.params.id); const service = prisma ? await prisma.service.findUnique({where:{id},include:{category:true}}) : demo.services.find(s=>s.id===id);
  if(!service) return res.status(404).json({success:false,message:'Service not found'}); res.json({success:true,data:service});
});
router.get('/staff', async (_req,res)=>{
  const staff = prisma ? await prisma.staff.findMany({where:{status:'ACTIVE'},include:{user:true,services:{include:{service:true}}}}) : demo.staff;
  res.json({success:true,data:staff});
});
router.get('/gallery', async (_req,res)=>{
  const gallery = prisma ? await prisma.galleryItem.findMany({where:{status:'ACTIVE'},orderBy:{createdAt:'desc'}}) : [
    {id:1,title:'Knotless Braids',imageUrl:'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=1000&q=85',category:'Braids'},
    {id:2,title:'Boho Knotless',imageUrl:'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=1000&q=85',category:'Braids'},
    {id:3,title:'Stitch Cornrows',imageUrl:'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&w=1000&q=85',category:'Braids'},
    {id:4,title:'Goddess Braids',imageUrl:'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=85',category:'Braids'},
    {id:5,title:'Fulani Braids',imageUrl:'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=1000&q=85',category:'Braids'},
    {id:6,title:'Feed-In Braids',imageUrl:'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1000&q=85',category:'Braids'}
  ];
  res.json({success:true,data:gallery});
});
router.get('/promotions', async (_req,res)=>{
  const promotions = prisma ? await prisma.promotion.findMany({where:{status:'ACTIVE',endDate:{gte:new Date()}},orderBy:{endDate:'asc'}}) : [];
  res.json({success:true,data:promotions});
});
router.get('/settings', async (_req,res)=>{
  const settings = prisma ? await prisma.setting.findFirst() : {salonName:'Gist & Grip Brands',email:'',phone:'+233243311619',address:'Kasoa, Ghana',instagram:'@gist.grip.braider',whatsapp:'+233243311619',depositPercentage:25};
  res.json({success:true,data:settings});
});
router.post('/contact', async (req,res)=>{
  const parsed=z.object({
    name:z.string().trim().min(2).max(100),
    phone:z.string().trim().min(7).max(30),
    instagram:z.string().trim().max(100).optional().default(''),
    message:z.string().trim().min(10).max(2000)
  }).safeParse(req.body);
  if(!parsed.success)return res.status(400).json({success:false,message:'Please complete all contact details'});
  try{
    await sendContactMessage(parsed.data);
    return res.json({success:true,message:'Your message has been sent'});
  }catch(error){
    console.error('Contact message failed',error);
    return res.status(503).json({success:false,message:'Message delivery is temporarily unavailable'});
  }
});
export default router;
