import assert from 'node:assert/strict';import {Arena,angularDistance,MAX_KNIVES,MAX_BLADE_LEVEL,BLADES} from './dist/engine-v1.4.0.js';
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
assert.equal(storage.merge(8,9),true);
assert.equal(storage.buy(),true);
assert.equal(storage.slots.length,MAX_KNIVES);
const race=new Arena(),speed=race.rotationSpeed;
race.wave=8;race.begin();
assert.ok(race.rotationSpeed>speed);
assert.ok(race.maxHP>14);
const d=new Arena();d.slots=[3,0,0,0,0,0,0,0];d.equipped=0;for(let wave=1;wave<=10;wave++){assert.equal(d.wave,wave);assert.equal(d.boss,wave%5===0);const initial=d.coins;for(let i=0;i<20000&&d.status==='playing';i++){d.fire();d.update(1/120)}assert.equal(d.status,'won');assert.equal(d.lives,3);assert.ok(d.coins>=initial+12+wave*4);assert.equal(d.next(),false);assert.equal(d.chooseUpgrade('power'),true);assert.equal(d.next(),true)}
const lost=new Arena();for(let i=0;i<3;i++){lost.stuck=[{angle:Math.PI/2-lost.angle,level:1}];lost.shots=[{x:240,y:310,level:1,delay:0,hit:false}];lost.update(.01)}assert.equal(lost.status,'lost');assert.equal(lost.fire(),false);lost.begin();assert.equal(lost.lives,3);assert.equal(lost.status,'playing');console.log('Passed: merge rules, buy costs, inventory moves, save validation, rotating collisions, piercing, one blade in flight, 10-slot inventory, ten complete waves and retry.');

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

const catalogue=new Arena();
assert.equal(BLADES.length-1,50);
assert.equal(new Set(BLADES.slice(1).map(blade=>blade.name)).size,50);
for(let level=8;level<MAX_BLADE_LEVEL;level++){
 catalogue.slots=[level,level,0,0,0,0,0,0];
 assert.equal(catalogue.merge(0,1),true);
 assert.equal(catalogue.level,level+1);
}
const legendary=new Arena(catalogue.snapshot());
assert.equal(legendary.level,50);
legendary.slots[0]=50;
assert.equal(legendary.merge(0,1),false);
legendary.coins=1000;
assert.equal(legendary.buy(),true);
assert.ok(legendary.slots.includes(49));
console.log('Passed: 50 blade types, fusion past level 8 and level 50 saves.');

const recycling=new Arena();const paid=recycling.cost;
assert.equal(recycling.buy(),true);
assert.equal(recycling.discard(4),Math.floor(paid/2));
assert.equal(recycling.coins,40-paid+Math.floor(paid/2));
const legacy=new Arena({slots:Array(18).fill(3),coins:0});
assert.equal(legacy.knifeCount,10);assert.equal(legacy.reserve.length,8);
assert.equal(legacy.discard(0),6);assert.equal(legacy.knifeCount,10);
assert.equal(new Arena(legacy.snapshot()).reserve.length,7);
const lastBlade=new Arena({slots:[1,0,0,0,0,0,0,0]});
assert.equal(lastBlade.discard(0),null);
