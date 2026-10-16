'use client';
import {useCallback,useEffect,useState} from 'react';import {api,onlyAlnum} from '@/lib/api';
export default function Admin(){
const [us,setUs]=useState<any[]>([]);const [f,setF]=useState({username:'',name:'',role:'member'});const [m,setM]=useState('');
const load=useCallback(()=>api('users').then(setUs),[]);useEffect(()=>{load()},[load]);
const add=async(e:React.FormEvent)=>{e.preventDefault();try{await api('users','POST',f);setM('已建立，預設密碼 87238723，首次登入須修改');setF({...f,username:'',name:''});load()}catch(x:any){setM(x.message)}};
return <section className="card space-y-3"><h3 className="font-bold text-blue-700">帳號管理</h3>
<form onSubmit={add} className="grid gap-2 md:grid-cols-4"><input className="inp" placeholder="帳號（英數字）" value={f.username} onChange={e=>setF({...f,username:onlyAlnum(e.target.value)})}/><input className="inp" placeholder="顯示名稱" value={f.name} onChange={e=>setF({...f,name:e.target.value})}/>
<select className="inp" value={f.role} onChange={e=>setF({...f,role:e.target.value})}><option value="member">一般社員</option><option value="admin">管理者</option></select><button className="btn">新增帳號</button></form>
{m&&<p className="text-sm text-blue-600">{m}</p>}
<ul className="text-sm">{us.map(u=><li key={u.username} className="flex justify-between border-t border-blue-50 py-1"><span>{u.name}（{u.username}）</span><span>{u.role==='admin'?'管理者':'社員'}{u.mustChange&&' · 待改密碼'}</span></li>)}</ul></section>}
