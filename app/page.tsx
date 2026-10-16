'use client';
import {useState} from 'react';import {useRouter} from 'next/navigation';import {api,onlyAlnum} from '@/lib/api';import Board from '@/components/Board';
export default function Login(){const r=useRouter();const [u,setU]=useState('');const [p,setP]=useState('');const [next,setNext]=useState('');const [e,setE]=useState('');const [show,setShow]=useState(false);const [busy,setBusy]=useState(false);const [changing,setChanging]=useState(false);
const go=async(ev:React.FormEvent)=>{ev.preventDefault();setE('');if(!u||!p){setE('請輸入帳號和密碼。');return}setBusy(true);try{await api('login','POST',{username:u,password:p});r.push('/dashboard')}catch(x:any){setE(x.message||'登入失敗，請稍後再試。')}finally{setBusy(false)}};
const change=async(ev:React.FormEvent)=>{ev.preventDefault();setE('');if(!u||!p||!next){setE('請輸入帳號、目前密碼和新密碼。');return}setBusy(true);try{await api('change-password','POST',{username:u,oldPassword:p,newPassword:next});setP(next);setNext('');setE('密碼已更新，請使用新密碼登入。');setChanging(false)}catch(x:any){setE(x.message||'更改密碼失敗。')}finally{setBusy(false)}};
return <main className="mx-auto grid max-w-4xl gap-6 p-6 md:grid-cols-2 md:pt-16"><Board/>
<form onSubmit={changing?change:go} className="card space-y-3 self-start"><h1 className="text-xl font-bold text-blue-700">工作任務分配系統</h1>
<input className="inp" placeholder="帳號" autoComplete="username" value={u} onChange={x=>{setU(onlyAlnum(x.target.value));setE('')}}/>
<div className="space-y-1"><input className={`inp ${e.includes('密碼')?'border-red-500':''}`} placeholder={changing?'目前密碼':'密碼'} autoComplete={changing?'current-password':'current-password'} type={show?'text':'password'} value={p} onChange={x=>{setP(x.target.value);setE('')}}/>
<button type="button" className="btn-o" onClick={()=>setShow(!show)}>{show?'隱藏密碼':'顯示密碼'}</button></div>
{changing&&<input className="inp" placeholder="新密碼（6–32 碼英文字母或數字）" autoComplete="new-password" type={show?'text':'password'} value={next} onChange={x=>{setNext(onlyAlnum(x.target.value));setE('')}}/>}
{e&&<p role="alert" className={`text-sm font-medium ${e.includes('已更新')?'text-green-700':'text-red-600'}`}>{e}</p>}
<button className="btn w-full" disabled={busy}>{busy?'請稍候…':changing?'儲存新密碼':'登入'}</button>
<button type="button" className="btn-o w-full" onClick={()=>{setChanging(!changing);setE('');setNext('')}}>{changing?'返回登入':'更改密碼'}</button>
<p className="text-xs text-slate-500">密碼僅能使用英文字母與數字</p></form></main>}
