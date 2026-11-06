export const MAX_KNIVES = 10;
export const MAX_BLADE_LEVEL = 50;
const LEGACY_LIMIT = 50;
export const BLADES=[null,{name:'Exploradora',damage:2,color:'#d5e8e7',effect:'Lançamento simples'},{name:'Curva da selva',damage:3,color:'#a7d7cb',effect:'Impacto reforçado'},{name:'Lança de âmbar',damage:5,color:'#ffd172',effect:'Perfuração: atravessa lâminas'},{name:'Gémeas',damage:8,color:'#acb6f5',effect:'Golpe reforçado: uma lâmina'},{name:'Cristal',damage:13,color:'#8ce4ed',effect:'Golpe de cristal: uma lâmina'},{name:'Bumerangue',damage:21,color:'#f6a66d',effect:'Retorno: segundo impacto'},{name:'Estrela antiga',damage:34,color:'#d398ed',effect:'Ricochete: dano extra'},{name:'Relíquia Dino',damage:55,color:'#f4d270',effect:'Poder ancestral completo'}];
const bladeFamilies = ['Sabre','Estilete','Falchion','Punhal','Cimitarra','Kukri','Lâmina'];
const bladeMaterials = ['de jade','de obsidiana','de coral','de safira','de prata','de rubi'];
for (let level = 9; level <= MAX_BLADE_LEVEL; level++) {
 const offset = level - 9;
 const profile = offset % bladeFamilies.length;
 const material = Math.floor(offset / bladeFamilies.length);
 BLADES.push({
  name: bladeFamilies[profile] + ' ' + bladeMaterials[material],
  damage: Math.round(55 * Math.pow(1.12, level - 8)),
  color: ['#7de2a7','#a79ad8','#ff9d83','#7dbfff','#cadfea','#fc7792'][material],
  profile,
  effect: 'Perfuração reforçada'
 });
}
export const angularDistance=(a,b)=>Math.abs(Math.atan2(Math.sin(a-b),Math.cos(a-b)));
export const UPGRADES={power:{name:'Fio reforçado',description:'+10% de dano em todos os lançamentos',icon:'✦'},speed:{name:'Mãos rápidas',description:'Lança mais depressa',icon:'»'},bounty:{name:'Tesouro da floresta',description:'+2 moedas no prémio de cada fase',icon:'◈'}};
export class Arena{
 constructor(saved){
 this.slots=[1,1,2,2,0,0,0,0];this.coins=40;this.wave=1;this.buys=0;this.best=2;this.upgrades={power:0,speed:0,bounty:0};
 const valid=saved&&Array.isArray(saved.slots)&&saved.slots.length>=8&&saved.slots.length<=LEGACY_LIMIT&&saved.slots.every(x=>Number.isInteger(x)&&x>=0&&x<=MAX_BLADE_LEVEL)&&saved.slots.some(x=>x>0);
 if(valid){this.slots=[...saved.slots];this.coins=Math.max(0,Math.min(1e7,Math.floor(Number(saved.coins)||0)));this.wave=Math.max(1,Math.min(999,Math.floor(Number(saved.wave)||1)));this.buys=Math.max(0,Math.min(9999,Math.floor(Number(saved.buys)||0)));this.best=Math.max(...this.slots,Math.min(MAX_BLADE_LEVEL,Math.floor(Number(saved.best)||0)));for(const k of Object.keys(this.upgrades))this.upgrades[k]=Math.max(0,Math.min(10,Math.floor(Number(saved.upgrades?.[k])||0)))}
 const validValue = value => Number.isSafeInteger(value) && value >= 0 && value <= 1e9;
 this.values=this.slots.map((level,index)=>level?(valid&&validValue(saved.values?.[index])?saved.values[index]:this.cost):0);
 this.reserve=[];
 if(valid&&Array.isArray(saved.reserve)){
  this.reserve=saved.reserve.slice(0,LEGACY_LIMIT-MAX_KNIVES).filter(item=>item&&Number.isInteger(item.level)&&item.level>0&&item.level<=MAX_BLADE_LEVEL&&validValue(item.value));
 }
 for(let i=MAX_KNIVES;i<this.slots.length;i++){
  if(this.slots[i])this.reserve.push({level:this.slots[i],value:this.values[i]});
 }
 this.slots.length=MAX_KNIVES;
 this.values.length=MAX_KNIVES;
 for(let i=0;i<MAX_KNIVES;i++){
  this.slots[i]??=0;
  this.values[i]??=0;
  this.refillSlot(i);
 }
 this.challenge=valid&&saved.challenge===true;
 this.collectedLoot=new Set(valid&&Array.isArray(saved.collectedLoot)?saved.collectedLoot.filter(kind=>kind==='coins'||kind==='blade'):[]);
 this.equipped=this.slots.findIndex(x=>x>0);this.events=[];this.begin();if(valid&&saved.pendingVictory===true){this.status='won';this.hp=0;this.rewardClaimed=saved.rewardClaimed===true;this.lastReward=Math.max(0,Math.min(1e6,Number(saved.lastReward)||0))}
 }
 get cost(){return Math.min(120,12+this.buys*2)}
 get level(){return this.slots[this.equipped]||1}
 get reward(){return 12+this.wave*4+this.upgrades.bounty*2}
 get rate(){return Math.max(.15,.33-this.upgrades.speed*.018)}
 snapshot(){return {slots:[...this.slots],values:[...this.values],reserve:this.reserve.map(item=>({...item})),coins:this.coins,wave:this.wave,buys:this.buys,best:this.best,upgrades:{...this.upgrades},pendingVictory:this.status==='won',rewardClaimed:this.rewardClaimed,lastReward:this.lastReward,challenge:this.challenge,collectedLoot:[...this.collectedLoot]}}
 begin(){this.boss=this.wave%5===0;this.maxHP=Math.min(1e7,Math.round((10+this.wave*4)*Math.pow(1.08,this.wave-1)*(this.boss?1.7:1)));this.hp=this.maxHP;this.maxLives=this.challenge?2:3;this.lives=this.maxLives;this.heartCollected=false;this.angle=0;this.time=0;this.cooldown=0;this.stuck=[];this.shots=[];this.status='playing';this.events=[];this.freezeTime=0;this.freezeUsed=false;this.rewardClaimed=false;this.lastReward=0}
 get knifeCount(){return this.slots.filter(Boolean).length}
 get hasKnifeSpace(){return this.slots.includes(0)}
 get rotationSpeed(){return .75+Math.min(this.wave,50)*.09}
 storeKnife(level,value=this.cost){
  const empty=this.slots.indexOf(0);
  if(empty<0)return false;
  this.slots[empty]=level;
  this.values[empty]=value;
  this.best=Math.max(this.best,level);
  return true;
 }
 refillSlot(index){
  if(this.slots[index]||!this.reserve.length)return;
  const item=this.reserve.shift();
  this.slots[index]=item.level;
  this.values[index]=item.value;
 }
 refundFor(index){
  if(!Number.isInteger(index)||!this.slots[index]||this.knifeCount<2)return null;
  return Math.floor((this.values[index]??this.cost)/2);
 }
 discard(index){
  const refund=this.refundFor(index);
  if(refund===null)return null;
  this.slots[index]=0;
  this.values[index]=0;
  this.refillSlot(index);
  if(!this.slots[this.equipped])this.equipped=this.slots.findIndex(Boolean);
  this.coins+=refund;
  return refund;
 }
 buy(){
  if(this.coins<this.cost||!this.storeKnife(this.best>=8?this.best-1:Math.max(1,Math.min(4,this.best-3))))return false;
  this.coins-=this.cost;this.buys++;
  this.events.push({type:'buy'});
  return true;
 }
 merge(a,b){if(!Number.isInteger(a)||!Number.isInteger(b)||a<0||b<0||a>=this.slots.length||b>=this.slots.length||a===b)return false;const lv=this.slots[a];if(!lv||lv!==this.slots[b]||lv>=MAX_BLADE_LEVEL)return false;this.values[b]=Math.min(1e9,(this.values[a]??this.cost)+(this.values[b]??this.cost));this.values[a]=0;this.slots[a]=0;this.slots[b]=lv+1;this.refillSlot(a);this.best=Math.max(this.best,lv+1);this.equipped=b;this.events.push({type:'merge',level:lv+1});return true}
 move(a,b){if(!Number.isInteger(a)||!Number.isInteger(b)||a<0||b<0||a>=this.slots.length||b>=this.slots.length||!this.slots[a]||this.slots[b]||a===b)return false;this.slots[b]=this.slots[a];this.slots[a]=0;this.values[b]=this.values[a];this.values[a]=0;if(this.equipped===a)this.equipped=b;return true}
 equip(i){if(!Number.isInteger(i)||i<0||i>=this.slots.length||!this.slots[i])return false;this.equipped=i;return true}
 chooseUpgrade(key){if(this.status!=='won'||this.rewardClaimed)return false;if(key==='coins')this.coins+=25;else if(Object.hasOwn(this.upgrades,key)&&this.upgrades[key]<10)this.upgrades[key]++;else return false;this.rewardClaimed=true;return true}
 freeze(){if(this.status!=='playing'||this.wave<3||this.freezeUsed)return false;this.freezeTime=3;this.freezeUsed=true;return true}
 fire(){
  if(this.status!=='playing'||this.cooldown>0||this.shots.length)return false;
  this.cooldown=this.rate;
  this.shots.push({x:240,y:490,level:this.level,delay:0,hit:false,phase:'out'});
  this.events.push({type:'throw'});
  return true;
 }
 damage(amount,x,y,secondary=false){if(this.status!=='playing')return;const damage=Math.max(1,Math.round(amount*(1+this.upgrades.power*.1)));this.hp=Math.max(0,this.hp-damage);this.coins++;this.events.push({type:'hit',damage,x,y,secondary});if(this.hp<=0){this.status='won';const reward=this.reward;this.lastReward=reward;this.coins+=reward;this.events.push({type:'won',reward})}}
 pickups(){
  return [
   {kind:'coins',angle:.25+this.wave*.29},
   {kind:'blade',angle:2.7+this.wave*.29},
   {kind:'heart',angle:4.45+this.wave*.29}
  ].filter(item=>item.kind==='heart'?this.lives<this.maxLives&&!this.heartCollected:!this.collectedLoot.has(item.kind));
 }
 collectPickup(angle,x,y){
  const item=this.pickups().find(p=>angularDistance(p.angle,angle)<.22);
  if(!item)return;
  if(item.kind==='heart'){this.lives++;this.heartCollected=true;}
  else {
   if(item.kind==='coins')this.coins+=5;
   else {
    if(!this.storeKnife(Math.max(1,this.best-1)))return;
   }
   this.collectedLoot.add(item.kind);
  }
  this.events.push({type:'pickup',kind:item.kind,x,y});
 }
 thornAngle(){return -.5+this.wave*.29}
 update(dt){
 this.events=[];if(this.status!=='playing')return;dt=Math.max(0,Math.min(.04,Number(dt)||0));this.time+=dt;this.cooldown=Math.max(0,this.cooldown-dt);if(this.freezeTime>0)this.freezeTime=Math.max(0,this.freezeTime-dt);else this.angle+=dt*this.rotationSpeed*(this.boss?Math.cos(this.time*.7)*1.5:this.wave>=6?1+.32*Math.sin(this.time*1.8):1);
 for(const shot of this.shots){
 if(shot.hit)continue;if(shot.delay>0){shot.delay-=dt;continue}
 const r=this.boss?83:72,base=BLADES[shot.level].damage;
 if(shot.phase==='return'){shot.y+=750*dt;shot.rotation=Math.PI;if(shot.y>=450){shot.phase='back';shot.rotation=0}continue}
 if(shot.phase==='orbit'){shot.orbit=(shot.orbit||0)+dt;const t=Math.min(1,shot.orbit/.55),a=Math.PI/2+t*Math.PI*1.5;shot.x=240+Math.cos(a)*(r+30*(1-t));shot.y=238+Math.sin(a)*(r+30*(1-t));shot.rotation=a;if(t>=1){shot.hit=true;this.damage(base*.6,shot.x,shot.y,true)}if(this.status!=='playing')break;continue}
 shot.y-=900*dt;const dx=shot.x-240,bottom=238+Math.sqrt(Math.max(0,r*r-dx*dx));
 if(shot.y<=bottom){
 shot.hit=true;const angle=Math.atan2(bottom-238,dx)-this.angle,secondary=shot.phase==='back',blocked=!secondary&&shot.level<3&&this.stuck.some(s=>angularDistance(s.angle,angle)<.19);
 const thorn=this.challenge&&!secondary&&angularDistance(angle,this.thornAngle())<.18;
 if(blocked||thorn){this.lives--;this.stuck=[];this.events.push({type:thorn?'thorn':'blocked'});if(this.lives<=0){this.status='lost';this.events.push({type:'lost'});break}}
 else{let amount=base*(secondary?.7:1);const armored=this.boss&&!secondary&&[0,Math.PI].some(a=>angularDistance(angle,a)<.35),weak=this.boss&&angularDistance(angle,-Math.PI/2)<.3;if(armored){amount*=.4;this.events.push({type:'shield'})}if(weak){amount*=1.6;this.events.push({type:'weak'})}if(!secondary)this.collectPickup(angle,shot.x,bottom);this.damage(amount,shot.x,bottom,secondary);if(this.status!=='playing')break;
 if(!secondary){this.stuck.push({angle,level:shot.level});if(this.stuck.length>28)this.stuck.shift();if(shot.level===6||shot.level===8){shot.hit=false;shot.phase='return';shot.y=bottom;this.events.push({type:'return'})}else if(shot.level===7){shot.hit=false;shot.phase='orbit';shot.orbit=0;this.events.push({type:'ricochet'})}}
 }
 }
 }
 this.shots=this.status==='playing'?this.shots.filter(s=>!s.hit):[]
 }
 next(){if(this.status!=='won'||!this.rewardClaimed)return false;this.wave=Math.min(999,this.wave+1);this.collectedLoot.clear();this.begin();return true}
}
