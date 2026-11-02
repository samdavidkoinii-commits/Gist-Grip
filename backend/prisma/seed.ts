import { PrismaClient, UserRole, RecordStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();
async function main(){
 const adminPassword=process.env.ADMIN_SEED_PASSWORD;
 if(!adminPassword && process.env.NODE_ENV==='production') throw new Error('ADMIN_SEED_PASSWORD is required when seeding production');
 const passwordHash=await bcrypt.hash(adminPassword || 'development-only-admin-password',10);
 const customerHash=await bcrypt.hash(process.env.CUSTOMER_SEED_PASSWORD || 'development-only-customer-password',10);
 const admin=await prisma.user.upsert({where:{email:'admin@gistgrip.local'},update:{name:'Gist & Grip Admin',role:UserRole.ADMIN},create:{name:'Gist & Grip Admin',email:'admin@gistgrip.local',passwordHash,role:UserRole.ADMIN}});
 await prisma.user.upsert({where:{email:'customer@gistgrip.local'},update:{},create:{name:'Demo Customer',email:'customer@gistgrip.local',phone:'0240000000',passwordHash:customerHash}});
 const cat=await prisma.serviceCategory.upsert({where:{slug:'braids'},update:{name:'Braids'},create:{name:'Braids',slug:'braids',description:'Professional braid styles.'}});
 const services=[['Knotless Braids','knotless-braids',220,180,'Clean, lightweight knotless braids with a polished finish.'],['Boho Knotless','boho-knotless',300,240,'Soft boho knotless styling with texture and movement.'],['Stitch Cornrows','stitch-cornrows',180,150,'Precise stitch lines and neat cornrow patterns.'],['Goddess Braids','goddess-braids',260,210,'Statement goddess braids with a soft, elegant finish.'],['Fulani Braids','fulani-braids',240,210,'Pattern-rich Fulani-inspired braid styling.'],['Feed-In Braids','feed-in-braids',170,150,'Sleek feed-in cornrows for a neat everyday look.']] as const;
 for(const [name,slug,price,duration,description] of services) await prisma.service.upsert({where:{slug},update:{name,price,durationMinutes:duration,description,status:RecordStatus.ACTIVE,categoryId:cat.id},create:{name,slug,price,durationMinutes:duration,description,categoryId:cat.id,status:RecordStatus.ACTIVE}});
 const staffSeed=[['Lead Braider','lead@gistgrip.local','Senior Braider','Known for clean parts, balanced tension and polished finishes.',5],['Style Braider','style@gistgrip.local','Braids Specialist','Specializes in knotless, stitch and statement braid styles.',4],['Finishing Braider','finish@gistgrip.local','Braids Specialist','Detail-focused finishing for sleek, wearable styles.',3]] as const;
 const braidServices=await prisma.service.findMany({where:{categoryId:cat.id}});
 for(const [name,email,position,bio,years] of staffSeed){
  const user=await prisma.user.upsert({where:{email},update:{name,role:UserRole.STAFF},create:{name,email,passwordHash,role:UserRole.STAFF}});
  const staff=await prisma.staff.upsert({where:{userId:user.id},update:{position,bio,experienceYears:years,status:RecordStatus.ACTIVE},create:{userId:user.id,position,bio,experienceYears:years,status:RecordStatus.ACTIVE}});
  for(const service of braidServices) await prisma.staffService.upsert({where:{staffId_serviceId:{staffId:staff.id,serviceId:service.id}},update:{},create:{staffId:staff.id,serviceId:service.id}});
  for(let day=1;day<=6;day++) await prisma.workingHour.upsert({where:{staffId_dayOfWeek:{staffId:staff.id,dayOfWeek:day}},update:{startTime:'09:00',endTime:'18:00',isAvailable:true},create:{staffId:staff.id,dayOfWeek:day,startTime:'09:00',endTime:'18:00',isAvailable:true}});
 }
 const setting=await prisma.setting.findFirst(); if(!setting) await prisma.setting.create({data:{salonName:'Gist & Grip Brands',email:'',phone:'+233243311619',address:'Kasoa, Ghana',instagram:'@gist.grip.braider',whatsapp:'+233243311619',depositPercentage:25}});
 const gallery=[['Knotless Braids','https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=1000&q=85'],['Boho Knotless','https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=1000&q=85'],['Stitch Cornrows','https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&w=1000&q=85'],['Goddess Braids','https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=85'],['Fulani Braids','https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=1000&q=85'],['Feed-In Braids','https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1000&q=85']];
 for(const [title,imageUrl] of gallery){const exists=await prisma.galleryItem.findFirst({where:{title}}); if(!exists) await prisma.galleryItem.create({data:{title,imageUrl,category:'Braids'}})}
 console.log('Seeded Gist & Grip Brands.',admin.email);
}
main().finally(()=>prisma.$disconnect());
