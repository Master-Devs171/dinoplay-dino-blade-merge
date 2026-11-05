// Use the DinoPlay host when embedded; standalone play needs no account.
const cache=new Map();let host=false;
if(window.parent!==window){try{await window.DinoPlay.ready();host=true}catch{}}
const keys=['vortex-best','vortex-color','nico-unlocked','nico-coins','dino-blade-progress'];
for(const key of keys){try{const value=host?await window.DinoPlay.storage.get(key):window.localStorage.getItem(key);if(value!=null)cache.set(key,String(value))}catch{}}
export const progressStore={getItem:key=>cache.get(key)??null,setItem(key,value){const text=String(value);cache.set(key,text);if(host){window.DinoPlay.storage.set(key,text).catch(()=>{})}else{try{window.localStorage.setItem(key,text)}catch{}}}};
if(host){const button=document.createElement('button');button.id='dinoplay-exit';button.textContent='Voltar à biblioteca';button.addEventListener('click',()=>window.DinoPlay.close().catch(()=>{}));document.body.append(button)}
