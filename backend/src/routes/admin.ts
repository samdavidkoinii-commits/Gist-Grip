import { Router } from 'express';
import { prisma } from '../db.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import { demo } from '../store.js';

const router=Router(); router.use(requireAuth,requireRoles('ADMIN','SUPER_ADMIN'));
router.get('/dashboard',async(_req,res)=>{if(prisma){const [appointments,customers,services,staff,revenue]=await Promise.all([prisma.appointment.count({where:{appointmentDate:new Date(new Date().toDateString())}}),prisma.user.count({where:{role:'CUSTOMER'}}),prisma.service.count({where:{status:'ACTIVE'}}),prisma.staff.count({where:{status:'ACTIVE'}}),prisma.payment.aggregate({where:{status:'SUCCESSFUL'},_sum:{amount:true}})]); return res.json({success:true,data:{appointmentsToday:appointments,customers,services,staff,revenue:revenue._sum.amount??0}})}res.json({success:true,data:{appointmentsToday:demo.appointments.filter(a=>a.date===new Date().toISOString().slice(0,10)).length,customers:demo.users.filter(u=>u.role==='CUSTOMER').length,services:demo.services.length,staff:demo.staff.length,revenue:demo.appointments.reduce((s,a)=>s+(a.depositAmount),0)}})});
router.get('/appointments',async(_req,res)=>{if(prisma){const data=await prisma.appointment.findMany({include:{customer:true,service:true,staff:{include:{user:true}},payments:true},orderBy:{appointmentDate:'asc'}}); return res.json({success:true,data});}res.json({success:true,data:demo.appointments});});
export default router;
