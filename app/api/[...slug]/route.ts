import {NextRequest,NextResponse as R} from 'next/server';import crypto from 'crypto';
import {load,save,hash,check,board,weekKey,today,DB,DEFAULT_PW} from '@/lib/db';
const SEC=process.env.SECRET||'change-me-in-production';
const sign=(u:string)=>u+'.'+crypto.createHmac('sha256',SEC).update(u).digest('hex');
const PW=/^[A-Za-z0-9]{6,32}$/,UN=/^[A-Za-z0-9]{3,20}$/;
const err=(m:string,s=400)=>R.json({error:m},{status:s});
function who(req:NextRequest,db:DB){const c=req.cookies.get('s')?.value||'',i=c.lastIndexOf('.'),u=c.slice(0,i);return i>0&&sign(u)===c?db.users.find(x=>x.username===u):undefined}
async function h(req:NextRequest,{params}:{params:{slug:string[]}}){
const [a,b,c]=params.slug,db=load(),m=req.method,body:any=m==='GET'?{}:await req.json().catch(()=>({}));
if(a==='board')return R.json(board(db));
if(a==='login'){const u=db.users.find(x=>x.username===body.username);if(!u||!check(String(body.password||''),u.hash))return err('帳號或密碼錯誤',401);const r=R.json({ok:1});r.cookies.set('s',sign(u.username),{httpOnly:true,sameSite:'lax',path:'/'});return r}
if(a==='logout'){const r=R.json({ok:1});r.cookies.delete('s');return r}
const me=who(req,db);if(!me)return err('請先登入',401);
const admin=me.role==='admin',wk=weekKey();
if(a==='me')return R.json({username:me.username,name:me.name,role:me.role,mustChange:me.mustChange});
if(a==='password'){const p=String(body.password||'');if(!PW.test(p))return err('密碼只能包含英文字母與數字，長度 6–32 碼');if(p===DEFAULT_PW)return err('新密碼不可與預設密碼相同');me.hash=hash(p);me.mustChange=false;save(db);return R.json({ok:1})}
if(a==='users'){if(!admin)return err('需要管理者權限',403);
 if(m==='GET')return R.json(db.users.map(({hash,...u})=>u));
 if(m==='POST'){const un=String(body.username||'');if(!UN.test(un))return err('帳號只能是 3–20 碼英文字母或數字');if(db.users.some(x=>x.username===un))return err('帳號已存在');
  db.users.push({username:un,name:String(body.name||un).slice(0,20),role:body.role==='admin'?'admin':'member',hash:hash(DEFAULT_PW),mustChange:true});save(db);return R.json({ok:1})}}
if(a==='tasks'){
 if(m==='GET')return R.json(db.tasks.filter(t=>t.type==='fixed'||t.week===wk).map(({state,...t})=>({...t,st:state[wk]||null})));
 if(m==='POST'&&!b){if(!admin)return err('需要管理者權限',403);const type=body.type==='fixed'?'fixed':'weekly';if(!String(body.title||'').trim())return err('請輸入任務名稱');
  db.tasks.push({id:crypto.randomUUID(),title:String(body.title).slice(0,60),desc:String(body.desc||'').slice(0,500),type,points:Math.max(0,Number(body.points)||0),week:type==='weekly'?wk:undefined,state:{}});save(db);return R.json({ok:1})}
 const t=db.tasks.find(x=>x.id===b);if(!t)return err('找不到任務',404);
 if(m==='PATCH'){if(!admin)return err('需要管理者權限',403);if(!String(body.title||'').trim())return err('請輸入任務名稱');t.title=String(body.title).slice(0,60);t.desc=String(body.desc||'').slice(0,500);t.points=Math.max(0,Number(body.points)||0);save(db);return R.json({ok:1})}
 if(m==='DELETE'){if(!admin)return err('需要管理者權限',403);db.tasks=db.tasks.filter(x=>x!==t);save(db);return R.json({ok:1})}
 if(m==='POST'&&c==='claim'){if(t.state[wk])return err('此任務本週已被領取');t.state[wk]={status:'claimed',by:me.username};save(db);return R.json({ok:1})}
 if(m==='POST'&&c==='complete'){const s=t.state[wk];if(!s||s.status!=='claimed'||s.by!==me.username)return err('只有領取者可以完成任務');s.status='done';db.log.push({user:me.username,pts:t.points,at:today()});save(db);return R.json({ok:1})}
 if(m==='POST'&&c==='release'){const s=t.state[wk];if(!s||s.status!=='claimed'||(s.by!==me.username&&!admin))return err('無法放棄此任務');delete t.state[wk];save(db);return R.json({ok:1})}}
return err('Not found',404)}
export const GET=h,POST=h,PATCH=h,DELETE=h;
