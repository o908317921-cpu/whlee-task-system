'use client';
import {useCallback,useEffect,useState} from 'react';import {api} from '@/lib/api';
type T={id:string;title:string;desc:string;type:'fixed'|'weekly';points:number;st:{status:string;by:string}|null};
export default function Tasks({me,onChange}:{me:{username:string;role:string};onChange:()=>void}){
const [ts,setTs]=useState<T[]>([]);const [e,setE]=useState('');const [ed,setEd]=useState<T|null>(null);
const [f,setF]=useState({title:'',desc:'',points:5,type:'weekly'});const admin=me.role==='admin';
const load=useCallback(()=>api('tasks').then(setTs),[]);useEffect(()=>{load()},[load]);
const act=async(p:string,m='POST',b?:unknown)=>{try{setE('');await api(p,m,b);await load();onChange()}catch(x:any){setE(x.message)}};
const done=ts.filter(t=>t.st?.status==='done').length;
const card=(t:T)=><li key={t.id} className="rounded-xl border border-blue-100 p-4">
{ed?.id===t.id?<div className="space-y-2"><input className="inp" value={ed.title} onChange={x=>setEd({...ed,title:x.target.value})}/><textarea className="inp" value={ed.desc} onChange={x=>setEd({...ed,desc:x.target.value})}/>
<input className="inp w-24" type="number" value={ed.points} onChange={x=>setEd({...ed,points:+x.target.value})}/>
<div className="flex gap-2"><button className="btn" onClick={async()=>{await act('tasks/'+t.id,'PATCH',ed);setEd(null)}}>儲存</button><button className="btn-o" onClick={()=>setEd(null)}>取消</button></div></div>
:<><div className="flex justify-between gap-3"><div><b>{t.title}</b><p className="whitespace-pre-wrap text-sm text-slate-600">{t.desc}</p></div><span className="shrink-0 font-semibold text-blue-700">{t.points} 分</span></div>
<div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
{!t.st&&<button className="btn" onClick={()=>act(`tasks/${t.id}/claim`)}>領取</button>}
{t.st?.status==='claimed'&&<><span className="text-blue-600">進行中：{t.st.by}</span>{t.st.by===me.username&&<button className="btn" onClick={()=>act(`tasks/${t.id}/complete`)}>完成</button>}{(t.st.by===me.username||admin)&&<button className="btn-o" onClick={()=>act(`tasks/${t.id}/release`)}>放棄</button>}</>}
{t.st?.status==='done'&&<span className="text-green-600">✓ 已完成：{t.st.by}</span>}
{admin&&<><button className="btn-o" onClick={()=>setEd(t)}>編輯</button><button className="btn-o" onClick={()=>confirm('確定刪除？')&&act('tasks/'+t.id,'DELETE')}>刪除</button></>}</div></>}</li>;
const sec=(title:string,type:string)=><section className="card"><h3 className="mb-3 font-bold text-blue-700">{title}</h3><ul className="space-y-3">{ts.filter(t=>t.type===type).map(card)}</ul>{!ts.some(t=>t.type===type)&&<p className="text-sm text-slate-500">目前沒有任務</p>}</section>;
return <div className="space-y-4"><div className="card"><div className="mb-1 flex justify-between text-sm"><span>本週進度</span><span>{done}/{ts.length}</span></div><div className="h-2 rounded bg-blue-100"><div className="h-2 rounded bg-blue-600" style={{width:ts.length?done/ts.length*100+'%':0}}/></div></div>
{e&&<p className="text-sm text-red-600">{e}</p>}
{admin&&<form className="card grid gap-2 md:grid-cols-4" onSubmit={async x=>{x.preventDefault();await act('tasks','POST',f);setF({...f,title:'',desc:''})}}>
<input className="inp md:col-span-2" placeholder="任務名稱" value={f.title} onChange={x=>setF({...f,title:x.target.value})}/>
<select className="inp" value={f.type} onChange={x=>setF({...f,type:x.target.value})}><option value="weekly">當周指派</option><option value="fixed">固定任務</option></select>
<input className="inp" type="number" min={0} value={f.points} onChange={x=>setF({...f,points:+x.target.value})}/>
<textarea className="inp md:col-span-3" placeholder="任務內容" value={f.desc} onChange={x=>setF({...f,desc:x.target.value})}/><button className="btn">新增任務</button></form>}
{sec('固定任務（每週自動刷新）','fixed')}{sec('當周指派任務','weekly')}</div>}
