import fs from 'fs';import crypto from 'crypto';
const F=process.env.DB_FILE||'data/db.json';
export type User={username:string;name:string;role:'admin'|'member';hash:string;mustChange:boolean};
export type Task={id:string;title:string;desc:string;type:'fixed'|'weekly'|'temporary';points:number;week?:string;state:Record<string,{status:'claimed'|'done';by:string}>};
export type DB={users:User[];tasks:Task[];log:{user:string;pts:number;at:string}[]};
export const DEFAULT_PW='87238723';
export const hash=(p:string)=>{const s=crypto.randomBytes(8).toString('hex');return s+':'+crypto.scryptSync(p,s,32).toString('hex')};
export const check=(p:string,h:string)=>{const[s,k]=h.split(':');return crypto.timingSafeEqual(crypto.scryptSync(p,s,32),Buffer.from(k,'hex'))};
export const save=(d:DB)=>{fs.mkdirSync('data',{recursive:true});fs.writeFileSync(F,JSON.stringify(d,null,1))};
export function load():DB{
 if(!fs.existsSync(F))save({users:[{username:'admin',name:'管理者',role:'admin',hash:hash(DEFAULT_PW),mustChange:true}],tasks:[],log:[]});
 const db:DB=JSON.parse(fs.readFileSync(F,'utf8'));
 if(!db.users.some(u=>u.username==='whlee')){
  db.users.push({username:'whlee',name:'管理者',role:'admin',hash:hash(DEFAULT_PW),mustChange:true});
  save(db);
 }
 return db;
}
const day=(d:Date)=>d.toLocaleDateString('sv',{timeZone:'Asia/Taipei'});
export const monthKey=(d=new Date())=>day(d).slice(0,7);
export const today=()=>day(new Date());
export const weekKey=()=>{const d=new Date(today()+'T00:00:00Z');d.setUTCDate(d.getUTCDate()-((d.getUTCDay()+6)%7));return d.toISOString().slice(0,10)};
// 每月積分 = 本月 log 加總，換月自動歸零（歷史紀錄保留）
export const board=(db:DB)=>{const m=monthKey();return db.users.map(u=>({username:u.username,name:u.name,pts:db.log.filter(l=>l.user===u.username&&l.at.slice(0,7)===m).reduce((a,l)=>a+l.pts,0)})).sort((a,b)=>b.pts-a.pts)};
