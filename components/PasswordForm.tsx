'use client';
import {useState} from 'react';import {api,onlyAlnum} from '@/lib/api';
export default function PasswordForm({forced,onDone}:{forced?:boolean;onDone:()=>void}){
const [p,setP]=useState('');const [msg,setMsg]=useState('');const [show,setShow]=useState(false);const [open,setOpen]=useState(!!forced);
const change=(v:string)=>{const c=onlyAlnum(v);setMsg(c!==v?'密碼僅能使用英文字母與數字。':'');setP(c)};
const go=async(e:React.FormEvent)=>{e.preventDefault();try{await api('password','POST',{password:p});setP('');setMsg('密碼已更新。');onDone();if(!forced)setOpen(false)}catch(x:any){setMsg(x.message)}};
if(!forced&&!open)return <button type="button" className="btn-o w-full" onClick={()=>setOpen(true)}>更改密碼</button>;
return <form onSubmit={go} className="card space-y-3"><h2 className="font-bold text-blue-700">{forced?'首次登入，請先設定新密碼':'更改密碼'}</h2>
<div className="space-y-1"><input className="inp" type={show?'text':'password'} autoComplete="new-password" value={p} onChange={e=>change(e.target.value)} placeholder="新密碼（6–32 碼英文字母或數字）"/><button type="button" className="text-sm text-blue-700 underline" onClick={()=>setShow(!show)}>{show?'隱藏密碼':'顯示密碼'}</button></div>
{msg&&<p className={`text-sm ${msg.includes('已更新')?'text-green-700':'text-red-600'}`}>{msg}</p>}<div className="flex gap-2"><button className="btn" disabled={p.length<6}>儲存新密碼</button>{!forced&&<button type="button" className="btn-o" onClick={()=>{setOpen(false);setP('');setMsg('')}}>取消</button>}</div></form>}
