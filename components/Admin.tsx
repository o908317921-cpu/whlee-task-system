'use client';
import {useCallback,useEffect,useState} from 'react';import {api,onlyAlnum} from '@/lib/api';
type Request={id:string;username:string;name:string;createdAt:string};
export default function Admin({onChange}:{onChange?:()=>void}){
const [us,setUs]=useState<any[]>([]);const [requests,setRequests]=useState<Request[]>([]);const [f,setF]=useState({username:'',name:'',role:'member'});const [m,setM]=useState('');
const load=useCallback(()=>Promise.all([api('users'),api('password-requests')]).then(([u,q])=>{setUs(u);setRequests(q)}).catch((x:any)=>setM(x.message)),[]);useEffect(()=>{load();const timer=setInterval(load,15000);return()=>clearInterval(timer)},[load]);
const add=async(e:React.FormEvent)=>{e.preventDefault();try{await api('users','POST',f);setM('已建立帳號，預設密碼 87238723，首次登入須修改。');setF({...f,username:'',name:''});load()}catch(x:any){setM(x.message)}};
const decide=async(id:string,action:'approve'|'reject')=>{try{await api(`password-requests/${id}/${action}`,'POST',{});setM(action==='approve'?'已核准密碼更改。':'已拒絕密碼更改申請。');load();onChange?.()}catch(x:any){setM(x.message)}};
return <section className="card space-y-3"><h3 className="font-bold text-blue-700">管理員</h3>
<form onSubmit={add} className="grid gap-2 md:grid-cols-4"><input className="inp" placeholder="帳號" value={f.username} onChange={e=>setF({...f,username:onlyAlnum(e.target.value)})}/><input className="inp" placeholder="顯示名稱" value={f.name} onChange={e=>setF({...f,name:e.target.value})}/><select className="inp" value={f.role} onChange={e=>setF({...f,role:e.target.value})}><option value="member">一般社員</option><option value="admin">管理員</option></select><button className="btn">新增帳號</button></form>
{m&&<p className="text-sm text-blue-700">{m}</p>}
<div><h4 className="mb-2 font-semibold">待審核的密碼更改申請</h4>{requests.length===0?<p className="text-sm text-slate-500">目前沒有待審核申請。</p>:<ul className="space-y-2">{requests.map(q=><li key={q.id} className="flex flex-wrap items-center justify-between gap-2 border-t border-blue-50 py-2 text-sm"><span>{q.name}（{q.username}）提出更改密碼申請</span><span className="flex gap-2"><button className="btn" onClick={()=>decide(q.id,'approve')}>核准</button><button className="btn-o" onClick={()=>decide(q.id,'reject')}>拒絕</button></span></li>)}</ul>}</div>
<ul className="text-sm">{us.map(u=><li key={u.username} className="flex justify-between border-t border-blue-50 py-1"><span>{u.name}（{u.username}）</span><span>{u.role==='admin'?'管理員':'社員'}{u.mustChange&&' · 首次登入須更改密碼'}</span></li>)}</ul></section>}
