import assert from 'node:assert/strict';import {Arena,angularDistance,MAX_KNIVES} from './dist/engine.js';
const a=new Arena();assert.equal(a.merge(0,0),false);assert.equal(a.merge(-1,0),false);assert.equal(a.merge(0,2),false);assert.equal(a.merge(0,1),true);assert.equal(a.slots[0],0);assert.equal(a.slots[1],2);assert.equal(a.level,2);assert.equal(a.merge(1,2),true);assert.equal(a.level,3);assert.equal(a.best,3);const before=a.coins,cost=a.cost;assert.equal(a.buy(),true);assert.equal(a.coins,before-cost);assert.equal(a.slots[0],1);a.coins=0;assert.equal(a.buy(),false);assert.equal(a.coins,0);assert.equal(a.move(0,7),true);assert.equal(a.slots[7],1);assert.equal(a.slots[0],0);assert.equal(a.move(7,2),false);
const snap=a.snapshot(),restored=new Arena(snap);assert.deepEqual(restored.slots,a.slots);assert.equal(restored.wave,a.wave);assert.equal(new Arena({slots:[99]}).slots[0],1);assert.equal(new Arena({slots:Array(8).fill(0)}).slots[0],1);assert.ok(angularDistance(.01,Math.PI*2-.01)<.03);
const b=new Arena();b.stuck=[{angle:Math.PI/2,level:1}];b.shots=[{x:240,y:310,level:1,delay:0,hit:false}];b.update(.01);assert.equal(b.lives,2);assert.equal(b.hp,b.maxHP);assert.equal(b.stuck.length,0);b.shots=[{x:240,y:310,level:3,delay:0,hit:false}];b.stuck=[{angle:Math.PI/2-b.angle,level:1}];b.update(.01);assert.ok(b.hp<b.maxHP);assert.equal(b.lives,2);
for(const level of [1,4,5,6,7,8]){
 const a=new Arena();a.slots[0]=level;
 assert.equal(a.fire(),true);
 for(let i=0;i<500;i++){
  a.fire();a.update(.01);
  assert.ok(a.shots.length<=1);
  if(a.status!=='playing')break;
 }
}
const single=new Arena();single.wave=5;single.begin();single.slots[0]=6;single.fire();
while(single.shots[0]?.phase==='out')single.update(.02);
assert.equal(single.shots[0]?.phase,'return');
single.cooldown=0;
assert.equal(single.fire(),false,'a returning blade still occupies the launch');
const storage=new Arena();storage.coins=1e5;
while(storage.buy()){}
assert.equal(storage.knifeCount,MAX_KNIVES);
assert.equal(new Arena(storage.snapshot()).knifeCount,MAX_KNIVES);
assert.equal(storage.buy(),false);
assert.equal(storage.merge(48,49),true);
assert.equal(storage.buy(),true);
assert.equal(storage.slots.length,MAX_KNIVES);
const race=new Arena(),speed=race.rotationSpeed;
race.wave=8;race.begin();
assert.ok(race.rotationSpeed>speed);
assert.ok(race.maxHP>14);
const d=new Arena();d.slots=[3,0,0,0,0,0,0,0];d.equipped=0;for(let wave=1;wave<=10;wave++){assert.equal(d.wave,wave);assert.equal(d.boss,wave%5===0);const initial=d.coins;for(let i=0;i<20000&&d.status==='playing';i++){d.fire();d.update(1/120)}assert.equal(d.status,'won');assert.equal(d.lives,3);assert.ok(d.coins>=initial+12+wave*4);assert.equal(d.next(),false);assert.equal(d.chooseUpgrade('power'),true);assert.equal(d.next(),true)}
const lost=new Arena();for(let i=0;i<3;i++){lost.stuck=[{angle:Math.PI/2-lost.angle,level:1}];lost.shots=[{x:240,y:310,level:1,delay:0,hit:false}];lost.update(.01)}assert.equal(lost.status,'lost');assert.equal(lost.fire(),false);lost.begin();assert.equal(lost.lives,3);assert.equal(lost.status,'playing');console.log('Passed: merge rules, buy costs, inventory moves, save validation, rotating collisions, piercing, one blade in flight, 50-slot inventory, ten complete waves and retry.');

const loot=new Arena();
const hitPickup=kind=>{
 const item=loot.pickups().find(p=>p.kind===kind);
 loot.angle=Math.PI/2-item.angle;
 loot.shots=[{x:240,y:310,level:3,delay:0,hit:false}];
 loot.update(.01);
};
hitPickup('coins');assert.equal(loot.coins,46);
hitPickup('blade');assert.equal(loot.slots.filter(Boolean).length,5);
loot.begin();assert.equal(loot.pickups().some(p=>p.kind==='coins'||p.kind==='blade'),false);
const recovered=new Arena(loot.snapshot());
assert.equal(recovered.pickups().some(p=>p.kind==='coins'||p.kind==='blade'),false);
loot.challenge=true;loot.begin();assert.equal(loot.lives,2);
loot.angle=Math.PI/2-loot.thornAngle();loot.shots=[{x:240,y:310,level:3,delay:0,hit:false}];loot.update(.01);
assert.equal(loot.lives,1);assert.equal(loot.hp,loot.maxHP);
hitPickup('heart');assert.equal(loot.lives,2);assert.equal(loot.pickups().some(p=>p.kind==='heart'),false);
console.log('Passed: collectible rewards, retry persistence, challenge thorns and heart recovery.');
