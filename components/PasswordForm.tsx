'use client';
import {useState} from 'react';import {api,onlyAlnum} from '@/lib/api';
export default function PasswordForm({forced,onDone}:{forced?:boolean;onDone:()=>void}){
const [p,setP]=useState('');const [msg,setMsg]=useState('');
const change=(v:string)=>{const c=onlyAlnum(v);setMsg(c!==v?'已自動移除英數字以外的字元':'');setP(c)};
const go=async(e:React.FormEvent)=>{e.preventDefault();try{await api('password','POST',{password:p});setP('');setMsg('密碼已更新');onDone()}catch(x:any){setMsg(x.message)}};
return <form onSubmit={go} className="card space-y-3"><h2 className="font-bold text-blue-700">{forced?'首次登入，請設定新密碼':'修改密碼'}</h2>
<input className="inp" type="password" value={p} onChange={e=>change(e.target.value)} placeholder="新密碼（6–32 碼英文字母或數字）"/>
{msg&&<p className="text-sm text-blue-600">{msg}</p>}<button className="btn" disabled={p.length<6}>儲存新密碼</button></form>}
