'use client';
import {useState} from 'react';import {useRouter} from 'next/navigation';import {api,onlyAlnum} from '@/lib/api';import Board from '@/components/Board';
export default function Login(){const r=useRouter();const [u,setU]=useState('');const [p,setP]=useState('');const [e,setE]=useState('');
const go=async(ev:React.FormEvent)=>{ev.preventDefault();try{await api('login','POST',{username:u,password:p});r.push('/dashboard')}catch(x:any){setE(x.message)}};
return <main className="mx-auto grid max-w-4xl gap-6 p-6 md:grid-cols-2 md:pt-16"><Board/>
<form onSubmit={go} className="card space-y-3 self-start"><h1 className="text-xl font-bold text-blue-700">工作任務分配系統</h1>
<input className="inp" placeholder="帳號" value={u} onChange={x=>setU(onlyAlnum(x.target.value))}/><input className="inp" type="password" placeholder="密碼" value={p} onChange={x=>setP(onlyAlnum(x.target.value))}/>
{e&&<p className="text-sm text-red-600">{e}</p>}<button className="btn w-full">登入</button><p className="text-xs text-slate-500">密碼僅限英文字母與數字</p></form></main>}
