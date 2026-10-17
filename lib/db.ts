import fs from 'fs';import path from 'path';import crypto from 'crypto';
const F=process.env.DB_FILE||'data/db.json';
const KV_URL=process.env.KV_REST_API_URL||process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN=process.env.KV_REST_API_TOKEN||process.env.UPSTASH_REDIS_REST_TOKEN;
const KV_KEY='task-system:database';
export type User={username:string;name:string;role:'admin'|'member';hash:string;mustChange:boolean};
export type Task={id:string;title:string;desc:string;type:'fixed'|'weekly'|'temporary';points:number;week?:string;state:Record<string,{status:'claimed'|'done';by:string}>};
export type PasswordRequest={id:string;username:string;newHash:string;createdAt:string};
export type DB={users:User[];tasks:Task[];log:{user:string;pts:number;at:string}[];passwordRequests:PasswordRequest[]};
export const DEFAULT_PW='87238723';
export const hash=(p:string)=>{const s=crypto.randomBytes(8).toString('hex');return s+':'+crypto.scryptSync(p,s,32).toString('hex')};
export const check=(p:string,h:string)=>{const[s,k]=h.split(':');return crypto.timingSafeEqual(crypto.scryptSync(p,s,32),Buffer.from(k,'hex'))};
export async function save(d:DB){
 if(KV_URL&&KV_TOKEN){const r=await fetch(`${KV_URL.replace(/\/$/,'')}/pipeline`,{method:'POST',headers:{Authorization:`Bearer ${KV_TOKEN}`,'Content-Type':'application/json'},body:JSON.stringify([['SET',KV_KEY,JSON.stringify(d)]])});if(!r.ok)throw new Error(`Persistent database write failed (${r.status})`);const result=await r.json();if(result?.[0]?.error)throw new Error(`Persistent database write failed: ${result[0].error}`);return}
 if(process.env.NODE_ENV==='production')throw new Error('Persistent database is not configured. Set KV_REST_API_URL and KV_REST_API_TOKEN in the deployment environment.');
 fs.mkdirSync(path.dirname(F),{recursive:true});fs.writeFileSync(F,JSON.stringify(d,null,1));
}
export async function load():Promise<DB>{
 let raw:string|undefined;
 if(KV_URL&&KV_TOKEN){const r=await fetch(`${KV_URL.replace(/\/$/,'')}/get/${encodeURIComponent(KV_KEY)}`,{headers:{Authorization:`Bearer ${KV_TOKEN}`},cache:'no-store'});if(!r.ok)throw new Error(`Persistent database read failed (${r.status})`);const j=await r.json();if(j?.error)throw new Error(`Persistent database read failed: ${j.error}`);raw=typeof j.result==='string'?j.result:undefined}
 else if(process.env.NODE_ENV==='production')throw new Error('Persistent database is not configured. Set KV_REST_API_URL and KV_REST_API_TOKEN in the deployment environment.');
 else if(fs.existsSync(F))raw=fs.readFileSync(F,'utf8');
 const db:DB=raw?JSON.parse(raw):{users:[{username:'admin',name:'管理者',role:'admin',hash:hash(DEFAULT_PW),mustChange:true},{username:'whlee',name:'whlee',role:'admin',hash:hash(DEFAULT_PW),mustChange:true}],tasks:[],log:[],passwordRequests:[]};
 db.passwordRequests ||= [];
 if(!raw)await save(db);
 if(!db.users.some(u=>u.username==='whlee')){
  db.users.push({username:'whlee',name:'管理者',role:'admin',hash:hash(DEFAULT_PW),mustChange:true});
  await save(db);
 }
 return db;
}
const day=(d:Date)=>d.toLocaleDateString('sv',{timeZone:'Asia/Taipei'});
export const monthKey=(d=new Date())=>day(d).slice(0,7);
export const today=()=>day(new Date());
export const weekKey=()=>{const d=new Date(today()+'T00:00:00Z');d.setUTCDate(d.getUTCDate()-((d.getUTCDay()+6)%7));return d.toISOString().slice(0,10)};
// 每月積分 = 本月 log 加總，換月自動歸零（歷史紀錄保留）
export const board=(db:DB)=>{const m=monthKey();return db.users.map(u=>({username:u.username,name:u.name,pts:db.log.filter(l=>l.user===u.username&&l.at.slice(0,7)===m).reduce((a,l)=>a+l.pts,0)})).sort((a,b)=>b.pts-a.pts)};
