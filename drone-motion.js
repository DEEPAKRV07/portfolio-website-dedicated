/* RVD flight presentation: deterministic, browser-local, no real camera access. */
(function(root){'use strict';
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)), smooth=x=>{x=clamp(x,0,1);return x*x*(3-2*x)}, mix=(a,b,t)=>a+(b-a)*t;
const damp=(a,b,dt,k=7)=>mix(a,b,1-Math.exp(-Math.max(0,dt)*k));
function flightSample(f,u){u=clamp(u,0,1);if(u===0)return {x:f.sx,z:f.sz,y:f.sy,travel:0};if(u===1)return {x:f.x,z:f.z,y:1.6,travel:1};const rise=.19,fall=.81,travel=smooth((u-rise)/(fall-rise)), cruise=Math.max(12,f.sy);let y=u<rise?mix(f.sy,cruise,smooth(u/rise)):u>fall?mix(cruise,1.6,smooth((u-fall)/(1-fall))):cruise;return {x:mix(f.sx,f.x,travel),z:mix(f.sz,f.z,travel),y,travel};}
// Conservative building envelopes; pad centres remain outside the front edge.
function clearance(x,z,stations){let y=1.6;for(const q of stations){const dx=Math.max(0,Math.abs(x-q.x)-10.2),dz=Math.max(0,q.z-8.3-z,z-q.z-7.6),distance=Math.hypot(dx,dz);y=Math.max(y,mix(11.5,1.6,smooth(distance/2.6)));}return y;}
function attitude(vx,vz,yaw,old,dt,reduced=false){const C=Math.cos(yaw),S=Math.sin(yaw);const localX=vx*C-vz*S,localZ=vx*S+vz*C;const p=reduced?0:clamp(localZ*.022,-.22,.22),r=reduced?0:clamp(-localX*.024,-.24,.24);return {pitch:damp(old.pitch,p,dt,8),roll:damp(old.roll,r,dt,8)};}
// R_y(yaw) R_x(pitch) R_z(roll), reused for the shell, rotor positions and gimbal anchor.
function matrix(yaw,pitch,roll){const C=Math.cos(yaw),S=Math.sin(yaw),P=Math.cos(pitch),Q=Math.sin(pitch),R=Math.cos(roll),T=Math.sin(roll);return [C*R+S*Q*T,-C*T+S*Q*R,S*P,P*T,P*R,-Q,-S*R+C*Q*T,S*T+C*Q*R,C*P];}
function transform(m,x,y,z){return [m[0]*x+m[1]*y+m[2]*z,m[3]*x+m[4]*y+m[5]*z,m[6]*x+m[7]*y+m[8]*z];}
const api={flightSample,clearance,attitude,matrix,transform,damp};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.RVDDroneMotion=api;
})(typeof globalThis!=='undefined'?globalThis:this);
