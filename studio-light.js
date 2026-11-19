/* RVD studio lighting: procedural static two-level shadow atlas. No network assets. */
(function(root){'use strict';
const SIZE=512,MINX=-50,MINZ=-50,SPANX=100,SPANZ=112,LEVELS=[.72,1.0];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function receiver(y,ny){if(ny<.95)return -1;return LEVELS.findIndex(v=>Math.abs(y-v)<.008);}
function uv(x,z,level){return [(x-MINX)*SIZE/SPANX,(z-MINZ)*SIZE/SPANZ+level*SIZE];}
function projected(x,y,z,level,dx=.55,dz=-.70){const h=Math.max(0,y-LEVELS[level]);return uv(x+h*dx,z+h*dz,0);}
function material(r,g,b){const max=Math.max(r,g,b),min=Math.min(r,g,b),sat=max-min;return sat<.13&&max>.48&&max<.80?'metal':max<.34?'graphite':r>b+.10&&g>b+.035?'warm':max>.72&&sat<.18?'ceramic':'accent';}
function shade(r,g,b,nx,ny,nz){const m=material(r,g,b),key=Math.max(0,-.415*nx+.755*ny+.529*nz),sky=Math.max(0,ny),fill=Math.max(0,.70*nx+.45*ny-.55*nz);let s=.61+.34*key+.13*sky+.095*fill;if(m==='metal')s+=.035*fill;if(m==='graphite')s+=.065;const bias=[.020*key,.017*key,.024*(1-key)];return [r,g,b].map((v,i)=>Math.round(clamp(v*s+bias[i],0,1)*255));}
function bake(data,makeCanvas=()=>document.createElement('canvas')){const atlas=makeCanvas();atlas.width=SIZE;atlas.height=SIZE*2;const out=atlas.getContext('2d'),mask=makeCanvas();mask.width=mask.height=SIZE;const c=mask.getContext('2d');let triangles=0;
 for(let layer=0;layer<LEVELS.length;layer++){const h=LEVELS[layer];for(const pass of [{dx:.55,dz:-.70,blur:2.1,alpha:.23,min:.055,max:10},{dx:.10,dz:-.13,blur:1.0,alpha:.30,min:.035,max:2.6}]){c.clearRect(0,0,SIZE,SIZE);c.fillStyle='#172c36';c.beginPath();for(let i=0;i<data.length;i+=27){const ay=data[i+1],by=data[i+10],cy=data[i+19];if(Math.max(ay,by,cy)<h+pass.min||Math.min(ay,by,cy)>h+pass.max)continue;let a=projected(data[i],ay,data[i+2],layer,pass.dx,pass.dz),b=projected(data[i+9],by,data[i+11],layer,pass.dx,pass.dz),d=projected(data[i+18],cy,data[i+20],layer,pass.dx,pass.dz);
 const area=(b[0]-a[0])*(d[1]-a[1])-(b[1]-a[1])*(d[0]-a[0]);if(Math.abs(area)<.008)continue;if(area<0)[b,d]=[d,b];c.moveTo(...a);c.lineTo(...b);c.lineTo(...d);c.closePath();triangles++;}c.fill();out.save();out.beginPath();out.rect(0,layer*SIZE,SIZE,SIZE);out.clip();out.globalAlpha=pass.alpha;out.filter=`blur(${pass.blur}px)`;out.drawImage(mask,0,layer*SIZE);out.restore();}}
 return {atlas,triangles};}
const api={SIZE,LEVELS,receiver,uv,projected,material,shade,bake};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.RVDStudio=api;
})(globalThis);
