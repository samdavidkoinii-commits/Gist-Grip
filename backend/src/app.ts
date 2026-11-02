import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config.js';
import auth from './routes/auth.js';
import publicRoutes from './routes/public.js';
import appointments from './routes/appointments.js';
import admin from './routes/admin.js';
import upload from './routes/upload.js';
import payments from './routes/payments.js';

declare global { namespace Express { interface Request { bodyRaw?: string } } }
const rawBody=(req:any,_res:any,buf:Buffer)=>{req.bodyRaw=buf.toString('utf8')};
export const app=express();
const allowedOrigins=config.frontendUrl.split(',').map(origin=>origin.trim()).filter(Boolean);
app.use(helmet());
app.use(cors({origin(origin,callback){callback(null,!origin || allowedOrigins.includes(origin));},credentials:true}));
app.use(rateLimit({windowMs:15*60*1000,max:400,standardHeaders:true,legacyHeaders:false}));
app.get('/api/health',(_req,res)=>res.json({success:true,status:'ok',service:'gist-grip-brands-api'}));
app.use('/api/v1/auth',express.json(),auth);
app.use('/api/v1',express.json(),publicRoutes);
app.use('/api/v1/appointments',express.json(),appointments);
app.use('/api/v1/admin',express.json(),admin);
app.post('/api/v1/payments/webhook',express.json({verify:rawBody}),payments as any);
app.use('/api/v1/payments',express.json(),payments);
app.use('/api/v1/uploads',upload);
app.use((err:any,_req:any,res:any,_next:any)=>{console.error(err);res.status(500).json({success:false,message:'Internal server error'});});
