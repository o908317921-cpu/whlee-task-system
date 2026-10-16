'use client';
import {useEffect,useState} from 'react';import {api} from '@/lib/api';
export default function Board({refresh=0}:{refresh?:number}){
const [rows,setRows]=useState<{name:string;pts:number}[]>([]);
useEffect(()=>{const f=()=>api('board').then(setRows).catch(()=>{});f();const i=setInterval(f,15000);return()=>clearInterval(i)},[refresh]);
const mon=new Date().toLocaleDateString('zh-TW',{year:'numeric',month:'long',timeZone:'Asia/Taipei'});
return <section className="card"><h2 className="text-lg font-bold text-blue-700">{mon}積分排行榜</h2><p className="mb-3 text-xs text-slate-500">每月 1 日自動歸零</p>
<ol className="divide-y divide-blue-50">{rows.map((r,i)=><li key={r.name+i} className="flex items-center justify-between py-2"><span className="flex items-center gap-3"><b className={`w-6 text-center ${i<3?'text-blue-600':'text-slate-400'}`}>{i+1}</b>{r.name}</span><span className="font-semibold text-blue-700">{r.pts} 分</span></li>)}</ol></section>}
