import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import { demo } from '../store.js';
import { initializePaystack } from '../services/payment.js';
import { sendBookingConfirmation } from '../services/email.js';

const router = Router();
const bookSchema = z.object({serviceId:z.number().int().positive(),staffId:z.number().int().positive(),date:z.string(),startTime:z.string(),customerName:z.string().min(2),phone:z.string().min(7),email:z.email(),note:z.string().optional(),payDeposit:z.boolean().default(true)});
function addMinutes(time:string, mins:number){const [h,m]=time.split(':').map(Number); const d=new Date(2000,0,1,h,m+mins); return d.toTimeString().slice(0,5);}
function overlaps(aStart:string,aEnd:string,bStart:string,bEnd:string){return aStart < bEnd && bStart < aEnd;}

router.get('/availability', async (req,res)=>{
  const serviceId=Number(req.query.serviceId), staffId=Number(req.query.staffId), date=String(req.query.date);
  if(!serviceId || !staffId || !date) return res.status(400).json({success:false,message:'serviceId, staffId and date are required'});
  const service:any = prisma ? await prisma.service.findUnique({where:{id:serviceId}}) : demo.services.find(s=>s.id===serviceId);
  if(!service) return res.status(404).json({success:false,message:'Service not found'});
  const blocked:any[] = prisma ? await prisma.appointment.findMany({where:{staffId,appointmentDate:new Date(date),status:{notIn:['CANCELLED','NO_SHOW']}},select:{startTime:true,endTime:true}}) : demo.appointments.filter(a=>a.staffId===staffId && a.date===date && !['CANCELLED','NO_SHOW'].includes(a.status));
  const slots:string[]=[];
  for(let hour=9;hour<=17;hour++) for(const minute of [0,30]) { const start=`${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}`; const end=addMinutes(start,service.durationMinutes); if(end>'18:00') continue; if(!blocked.some(b=>overlaps(start,end,b.startTime,b.endTime))) slots.push(start); }
  res.json({success:true,data:{date,slots}});
});

router.post('/', async (req,res)=>{
  const parsed=bookSchema.safeParse(req.body); if(!parsed.success) return res.status(400).json({success:false,message:'Invalid booking details'});
  const d=parsed.data; const endTime=addMinutes(d.startTime,(prisma ? await prisma.service.findUniqueOrThrow({where:{id:d.serviceId}}):demo.services.find(s=>s.id===d.serviceId)!).durationMinutes);
  if(prisma){
    const customer= req.user ? await prisma.user.findUnique({where:{id:req.user.id}}) : await prisma.user.findUnique({where:{email:d.email}});
    const existing=await prisma.appointment.findFirst({where:{staffId:d.staffId,appointmentDate:new Date(d.date),status:{notIn:['CANCELLED','NO_SHOW']},startTime:{lt:endTime},endTime:{gt:d.startTime}}});
    if(existing) return res.status(409).json({success:false,message:'The selected time is no longer available',error:'TIME_SLOT_UNAVAILABLE'});
    const user = customer ?? await prisma.user.create({data:{name:d.customerName,email:d.email,phone:d.phone,passwordHash:bcrypt.hashSync(Math.random().toString(36),10)}});
    const service=await prisma.service.findUniqueOrThrow({where:{id:d.serviceId}});
    const bookingNumber=`SAL-${new Date().toISOString().slice(0,10).replaceAll('-','')}-${Math.floor(1000+Math.random()*9000)}`;
    const deposit=50;
    const appointment=await prisma.appointment.create({data:{bookingNumber,customerId:user.id,staffId:d.staffId,serviceId:d.serviceId,appointmentDate:new Date(d.date),startTime:d.startTime,endTime,totalAmount:service.price,depositAmount:deposit,balanceAmount:service.price-deposit,customerNote:d.note},include:{service:true,staff:{include:{user:true}},customer:true}});
    if(!d.payDeposit){ await sendBookingConfirmation(d.email,{name:user.name,bookingNumber,service:service.name,date:d.date,time:d.startTime,staff:appointment.staff.user.name,amount:service.price}); return res.status(201).json({success:true,data:{appointment,payment:null}}); }
    const reference=`LUM-${appointment.id}-${Date.now()}`;
    await prisma.payment.create({data:{appointmentId:appointment.id,customerId:user.id,transactionReference:reference,amount:deposit,currency:'GHS'}});
    const payment=await initializePaystack(d.email,deposit,reference);
    await sendBookingConfirmation(d.email,{name:user.name,bookingNumber,service:service.name,date:d.date,time:d.startTime,staff:appointment.staff.user.name,amount:service.price});
    return res.status(201).json({success:true,data:{appointment,payment}});
  }
  const service=demo.services.find(s=>s.id===d.serviceId)!; const overlap=demo.appointments.some(a=>a.staffId===d.staffId&&a.date===d.date&&!['CANCELLED','NO_SHOW'].includes(a.status)&&overlaps(d.startTime,endTime,a.startTime,a.endTime)); if(overlap) return res.status(409).json({success:false,message:'The selected time is no longer available',error:'TIME_SLOT_UNAVAILABLE'});
  let user=demo.users.find(u=>u.email===d.email); if(!user){user={id:Math.max(...demo.users.map(u=>u.id))+1,name:d.customerName,email:d.email,phone:d.phone,passwordHash:'',role:'CUSTOMER'};demo.users.push(user);}
  const staff=demo.staff.find(s=>s.id===d.staffId)!; const id=demo.appointments.length+1; const bookingNumber=`SAL-${Date.now().toString().slice(-8)}`; const deposit=50; const appt={id,bookingNumber,customerId:user.id,staffId:d.staffId,serviceId:d.serviceId,date:d.date,startTime:d.startTime,endTime,status:'PENDING',totalAmount:service.price,depositAmount:deposit,balanceAmount:service.price-deposit,note:d.note}; demo.appointments.push(appt);
  const payment=await initializePaystack(d.email,deposit,`LUM-DEMO-${id}-${Date.now()}`); await sendBookingConfirmation(d.email,{name:user.name,bookingNumber,service:service.name,date:d.date,time:d.startTime,staff:staff.name,amount:service.price}); res.status(201).json({success:true,data:{appointment:appt,payment}});
});

router.get('/', requireAuth, async (req,res)=>{
  if(prisma){const role=req.user!.role; const where:any=role==='CUSTOMER'?{customerId:req.user!.id}:{}; const appointments=await prisma.appointment.findMany({where,include:{service:true,customer:true,staff:{include:{user:true}},payments:true},orderBy:{appointmentDate:'desc'}}); return res.json({success:true,data:appointments});}
  const list=demo.appointments.filter(a=>req.user!.role==='CUSTOMER'?a.customerId===req.user!.id:true).map(a=>({...a,service:demo.services.find(s=>s.id===a.serviceId),staff:demo.staff.find(s=>s.id===a.staffId),customer:demo.users.find(u=>u.id===a.customerId)})); res.json({success:true,data:list});
});

router.patch('/:id/status', requireAuth, requireRoles('ADMIN','SUPER_ADMIN','STAFF'), async(req,res)=>{const id=Number(req.params.id), status=String(req.body.status); if(prisma){const a=await prisma.appointment.update({where:{id},data:{status:status as any}}); return res.json({success:true,data:a});} const a=demo.appointments.find(x=>x.id===id); if(!a)return res.status(404).json({success:false,message:'Appointment not found'}); a.status=status; res.json({success:true,data:a});});

export default router;
