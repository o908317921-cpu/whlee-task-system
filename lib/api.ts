export const api=async(p:string,method='GET',b?:unknown)=>{
 let r:Response;
 try{r=await fetch('/api/'+p,{method,headers:{'Content-Type':'application/json'},body:b?JSON.stringify(b):undefined})}
 catch{return Promise.reject(new Error('無法連線到伺服器，請確認網路或部署狀態。'))}
 const raw=await r.text();let j:any={};try{j=raw?JSON.parse(raw):{}}catch{}
 if(!r.ok){if(r.status>=500)throw new Error(`伺服器發生錯誤（${r.status}），請查看部署平台的 Function Logs。`);throw new Error(j.error||`請求失敗（${r.status}）。`)}
 if(!j||typeof j!=='object')throw new Error('伺服器回應格式錯誤，請查看部署平台的 Function Logs。');return j
};
export const onlyAlnum=(s:string)=>s.replace(/[^A-Za-z0-9]/g,'');
