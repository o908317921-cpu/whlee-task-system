'use client';
import {useCallback,useEffect,useState} from 'react';import {useRouter} from 'next/navigation';import {api} from '@/lib/api';
import Board from '@/components/Board';import Tasks from '@/components/Tasks';import Admin from '@/components/Admin';import PasswordForm from '@/components/PasswordForm';
export default function Dash(){const r=useRouter();const [me,setMe]=useState<any>(null);const [k,setK]=useState(0);
const load=useCallback(()=>api('me').then(setMe).catch(()=>r.push('/')),[r]);useEffect(()=>{load()},[load]);
if(!me)return null;
const out=async()=>{await api('logout','POST');r.push('/')};
return <main className="mx-auto max-w-5xl space-y-4 p-4 md:p-6"><header className="flex items-center justify-between"><h1 className="text-xl font-bold text-blue-700">工作任務分配系統</h1>
<div className="flex items-center gap-3 text-sm"><span>{me.name}（{me.role==='admin'?'管理者':'社員'}）</span><button className="btn-o" onClick={out}>登出</button></div></header>
{me.mustChange?<PasswordForm forced onDone={load}/>:<div className="grid gap-4 md:grid-cols-3"><div className="space-y-4"><Board refresh={k}/><PasswordForm onDone={load}/></div>
<div className="space-y-4 md:col-span-2"><Tasks me={me} onChange={()=>setK(k+1)}/>{me.role==='admin'&&<Admin/>}</div></div>}</main>}
