export const api=(p:string,method='GET',b?:unknown)=>fetch('/api/'+p,{method,headers:{'Content-Type':'application/json'},body:b?JSON.stringify(b):undefined}).then(async r=>{const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||'發生錯誤');return j});
export const onlyAlnum=(s:string)=>s.replace(/[^A-Za-z0-9]/g,'');
