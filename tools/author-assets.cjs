// Original low-poly precision hardware assets. Rebuild with node tools/author-assets.cjs.
const fs=require('fs'),path=require('path'),vm=require('vm');const root=path.resolve(__dirname,'..'),ctx=vm.createContext({Math,Float32Array});vm.runInContext(fs.readFileSync(path.join(root,'geometry.js'),'utf8'),ctx);
const models={
 // v17 architectural kit: shallow rear facades and open sides preserve the physical exhibits.
 arrivalAtrium:`
 bevelBox(0,0,-4.4,14.1,.28,2.25,'#9aa8a5',.08);
 for(let a of [-1,1]){box(a*6.5,.28,-4.4,.48,7.3,.57,'#dbd9cb');box(a*6.5,.28,-3.99,.17,7.3,.10,'#b28f6b');box(a*6.5,.32,-4.0,1.3,.16,.90,'#a7aca6');}
 for(let i=0;i<6;i++){let a=Math.PI*i/6,b=Math.PI*(i+1)/6;beam([6.5*Math.cos(a),7.4+2.0*Math.sin(a),-4.4],[6.5*Math.cos(b),7.4+2.0*Math.sin(b),-4.4],.40,'#dcdccd');}
 box(0,6.95,-4.4,13.35,.25,.55,'#c7c9bf');box(0,7.03,-4.08,7.5,.07,.06,'#6e9c9e');
 for(let a of [-1,1]){box(a*4.3,.28,-4.6,3.8,4.85,.16,'#8da5aa');for(let k=0;k<3;k++)box(a*4.3+(k-1)*1.1,.32,-4.49,.085,4.8,.07,'#b9cbca');box(a*4.3,2.15,-4.48,3.8,.09,.07,'#c4d4d1');}
 `,
 visionArcade:`
 // A three-bay optical laboratory with steel frames and elevated clerestory.
 for(let x of [-6.7,-2.25,2.25,6.7]){box(x,0,-4.6,.29,6.2,.35,'#607b83');box(x,6.10,-4.25,.28,.40,.68,'#bac8c7');}
 box(0,6.45,-4.6,13.9,.35,.67,'#cfd8d3');box(0,6.80,-3.8,13.9,.24,2.3,'#e0ded2');box(0,6.72,-2.64,13.55,.09,.09,'#77b6b4');
 for(let i=0;i<3;i++){let x=(i-1)*4.48;box(x,.18,-4.63,4.13,2.42,.17,'#a6bdbe');box(x,2.65,-4.64,4.1,2.74,.14,'#829ca7');box(x,5.38,-4.64,4.1,.52,.15,'#b6d1cf');box(x,2.58,-4.51,4.11,.1,.07,'#d2dad4');}
 for(let a of [-1,1]){box(a*6.7,0,-.9,.29,5.85,.32,'#91a7a9');beam([a*6.7,6.12,-.9],[a*6.7,6.7,-4.6],.25,'#a4b5b6');box(a*6.7,.1,-2.4,.13,2.45,2.7,'#94aeb0');}
 `,
 dataFacade:`
 // Server-hall rear elevation: staggered fins and an open visitor forecourt.
 for(let a of [-1,1]){box(a*6.8,0,-3.7,.44,8.25,.5,'#516c78');box(a*6.75,0,-.25,.26,6.4,.31,'#91a8ac');beam([a*6.8,8.1,-3.7],[a*6.75,6.4,-.25],.29,'#718b92');}
 box(0,.1,-4.85,13.65,5.9,.18,'#627b85');box(0,5.98,-4.85,13.65,.24,.27,'#d3dcd7');
 for(let k=0;k<9;k++){let x=-6.1+k*1.52,h=6.7+(k%3)*.48;box(x,.2,-4.51,.26,h,.64,k%3===0?'#b4c0bd':'#8da3a8');}
 box(0,8.22,-4.16,14,.42,1.7,'#c5cfc8');box(0,8.20,-3.29,13.6,.10,.10,'#75b6b3');
 `,
 learningCanopy:`
 // Timber reading pavilion, layered pitched roof with open front and slender columns.
 for(let a of [-1,1]){for(let z of [-4.4,1.1])box(a*6.55,0,z,.38,6.0,.39,'#b3a18a');beam([a*6.55,6.0,1.1],[a*6.55,6.8,-4.4],.32,'#c5af90');}
 box(0,6.55,-4.45,13.55,.35,.55,'#b8a38a');for(let j=0;j<9;j++){let x=-6.15+j*1.53;beam([x,6.8,-4.55],[x,6.3,-2.15],.22,'#b89f7d');}
 quad([-6.8,6.91,-4.8],[-6.8,6.43,-2.2],[6.8,6.43,-2.2],[6.8,6.91,-4.8],'#d0c1a5');quad([6.8,6.91,-4.8],[6.8,6.43,-2.2],[-6.8,6.43,-2.2],[-6.8,6.91,-4.8],'#c0ae91');
 for(let a of [-1,1])for(let j=0;j<4;j++)box(a*6.62,.15,-3.9+j*.66,.15,3.85,.26,'#bfa98a');
 `,
 campusTree:`
 // Architectural landscape scale model, with faceted foliage and a compact planter.
 box(0,0,0,2.25,.31,2.25,'#c4c5b9');box(0,.31,0,2.02,.07,2.02,'#747f6c');cyl(0,.37,0,.15,2.7,'#998775',6,.115);
 for(let a of [-1,1])beam([0,1.65,0],[a*.65,2.72,a*.26],.10,'#9b8b73');
 for(let [x,y,z,r,h,c] of [[0,2.18,0,1.18,1.55,'#72917d'],[-.58,2.40,.18,.79,1.3,'#8fa58c'],[.62,2.45,-.13,.82,1.35,'#688a79']]){cyl(x,y,z,r,h*.39,c,7,r*.83);cyl(x,y+h*.39,z,r*.83,h*.61,c,7,.09);}
 `,
 pathLantern:`
 box(0,0,0,.50,.13,.5,'#9ca9a5');box(0,.13,0,.15,2.55,.15,'#5c737b');box(.23,2.64,0,.64,.13,.29,'#738b91');box(.38,2.60,0,.33,.035,.21,'#f4e7bd');
 `,
 // Open-backed architectural shells, not solid roofs: preserve the display sightlines.
 visionStudio:`
 for(let sign of [-1,1]){let x=sign*6.6;box(x,0,-2.6,.46,6.8,.52,'#d7d9d1');box(x,.15,1.75,.25,5.8,.30,'#64808a');beam([x,5.95,1.75],[x,6.8,-2.6],.21,'#aec1c1');}
 box(0,6.65,-2.6,13.65,.29,.58,'#e0ded5');box(0,6.75,-2.23,12.9,.09,.12,'#4e9da5');
 for(let k=0;k<7;k++){let x=-6+k*2;beam([x,6.72,-2.6],[x,6.21,.05],.12,'#bac8c8');} 
 for(let side of [-1,1]){box(side*6.75,.2,-.15,.18,2.05,3.7,'#94aeb0');box(side*6.75,2.29,-.15,.24,.12,3.7,'#c4d2cd');}
 `,
 exchangeHall:`
 for(let side of [-1,1]){let x=side*6.7;box(x,0,-3.2,.45,7.6,.5,'#5e757e');box(x,0,2.1,.24,6.8,.28,'#91a4a5');beam([x,7.6,-3.2],[x,6.85,2.1],.22,'#526b75');}
 box(0,7.45,-3.2,13.7,.36,.72,'#c8d3ce');box(0,7.32,-2.78,12.75,.10,.07,'#7db5b1');
 for(let i=0;i<3;i++){let x=(i-1)*4.25;box(x,7.26,-1.65,3.9,.17,.32,'#9caeb1');box(x,7.06,-1.65,3.45,.06,.24,'#b6e1d6');}
 for(let side of [-1,1])for(let k=0;k<3;k++)box(side*6.8,.25+k*1.2,-.6,.11,.83,3.4,'#718b91');
 `,
 neuralForum:`
 // Open amphitheatre around the numerical exhibit, arc deliberately leaves the front open.
 for(let i=0;i<8;i++){let a=Math.PI*.15+i*Math.PI*.7/8,b=Math.PI*.15+(i+1)*Math.PI*.7/8;for(let r of [5.75,6.55]){let X=Math.cos(a)*r,Z=-Math.sin(a)*r,U=Math.cos(b)*r,V=-Math.sin(b)*r;beam([X,.4,Z],[U,.4,V],.55,r>6?'#d2bfa7':'#96aba9');}if(i%2===0){let x=Math.cos(a)*6.55,z=-Math.sin(a)*6.55;box(x,0,z,.22,2.7,.22,'#aebfbf');}}
 `,
 studioLouver:`
 for(let side of [-1,1]){box(side*6.65,0,-3.05,.42,6.5,.5,'#a69b88');box(side*6.65,0,2.45,.32,6.1,.32,'#b7b4a8');beam([side*6.65,6.5,-3.05],[side*6.65,6.1,2.45],.28,'#b4a28b');}
 box(0,6.45,-3.05,13.55,.29,.56,'#d5c4a9');for(let i=0;i<10;i++){let x=-6.15+i*1.36;beam([x,6.59,-3.08],[x,6.42,-.45],.19,'#c7b392');}
 for(let i=0;i<5;i++)box(-6.54,.23,-2.6+i*.94,.22,4.15,.38,'#b29b7c');
 `,
 careerGallery:`
 // Three ascending portals echo a professional timeline.
 for(let i=0;i<3;i++){let x=(i-1)*4.1,h=4.9+i*.8;for(let a of [-1,1])box(x+a*1.9,0,-3.05,.23,h,.32,'#b1bfc0');box(x,h,-3.05,4.02,.22,.42,'#637f87');box(x,h-.31,-2.79,3.45,.085,.055,'#bcdad6');}
 box(0,.08,-3.05,12.6,.16,.67,'#a3aaa4');
 `,
 campusBench:`
 for(let side of [-1,1]){box(side*1.1,0,0,.23,.57,.75,'#627b80');box(side*1.1,.12,0,.36,.08,.93,'#bbc5bf');}
 for(let k=0;k<3;k++)box(0,.58,(k-1)*.24,3.0,.12,.205,'#b9a183');box(0,.67,-.37,3.0,.13,.15,'#9a8368');
 `,

 droneEco:`
 bevelBox(0,.38,0,1.28,.45,1.58,'#e5e8e5',.10);box(0,.25,0,.96,.18,1.18,'#203b4c');
 for(const a of [-1,1])for(const b of [-1,1]){beam([a*.39,.52,b*.47],[a*1.30,.56,b*1.24],.19,'#37576c');cyl(a*1.30,.45,b*1.24,.24,.24,'#4b6371',6);ring(a*1.30,.72,b*1.24,.49,.07,'#a2b9bc');box(a*1.30,.72,b*1.24,.83,.035,.085,'#405b6c',a*b*.7);box(a*1.30,.72,b*1.24,.085,.035,.83,'#405b6c',a*b*.7);}
 box(0,.22,-.28,.14,.19,.16,'#718794');for(let a of [-1,1]){beam([a*.37,.35,0],[a*.57,.02,0],.10,'#506776');box(a*.57,0,0,.13,.09,1.01,'#3d596a');}box(0,.58,-.81,.36,.10,.06,'#3281ad');
 `,
 drone:`
 bevelBox(0,.38,0,1.32,.49,1.67,'#e6eae7',.14);bevelBox(0,.23,0,1.09,.25,1.41,'#233c4c',.08);bevelBox(0,.82,.13,.76,.13,.77,'#b8c8cf',.045);
 for(const a of [-1,1])for(const b of [-1,1]){beam([a*.37,.55,b*.44],[a*1.37,.57,b*1.30],.23,'#405c6c');beam([a*.48,.65,b*.54],[a*1.23,.65,b*1.18],.075,'#b7c6c5');cyl(a*1.37,.44,b*1.30,.26,.29,'#4c6170',10);cyl(a*1.37,.73,b*1.30,.13,.08,'#adc3cf',8);ring(a*1.37,.78,b*1.30,.55,.067,'#91abb5');}
 for(let a of [-1,1]){beam([a*.38,.37,-.36],[a*.58,.04,-.39],.09,'#637d86');beam([a*.38,.37,.36],[a*.58,.04,.39],.09,'#637d86');box(a*.58,0,0,.12,.09,1.15,'#334a57');box(a*.59,.58,-.80,.15,.09,.07,a<0?'#64b8a6':'#b77d55');}
 // isolated camera swing mount under the nose, not a real camera feed.
 box(0,.12,-.28,.13,.22,.15,'#718794');beam([-.34,.24,-.34],[-.34,.13,-.48],.068,'#a4b5b9');beam([.34,.24,-.34],[.34,.13,-.48],.068,'#a4b5b9');box(0,.59,-.856,.37,.11,.055,'#347eb1');
 `,
 droneGimbal:`// Separate pivot-centered camera, local forward is -Z.
 bevelBox(0,-.18,0,.58,.36,.49,'#192f40',.065);box(0,-.11,-.27,.32,.21,.045,'#426e90');box(0,-.07,-.298,.19,.13,.025,'#72aec3');box(-.05,0,-.313,.05,.035,.015,'#e6f7f3');
 `,
 planter:`
 bevelBox(0,0,0,3.0,.52,1.65,'#c6c2b5',.09);box(0,.52,0,2.72,.07,1.37,'#666d60');for(let k=-1;k<=1;k++){let x=k*.85;beam([x,.57,0],[x,.95,0],.065,'#6b8066');for(let j=0;j<4;j++){let a=j*Math.PI/2;tri([x,.66,0],[x+Math.cos(a)*.48,1.13,Math.sin(a)*.48],[x+Math.cos(a+.5)*.24,1.16,Math.sin(a+.5)*.24],['#729183','#9da893','#809782','#9eae98'][j]);tri([x,.66,0],[x+Math.cos(a+.5)*.24,1.16,Math.sin(a+.5)*.24],[x+Math.cos(a)*.48,1.13,Math.sin(a)*.48],'#728f7c');}}
 `,
 codeform:`// A gallery sculpture of the source-code delimiters < / >, not a microprocessor.
 bevelBox(0,0,0,11.0,.38,5.0,'#a6ada9',.10);bevelBox(0,.38,0,10.5,.18,4.5,'#e4e0d5',.06);
 for(let s of [-1,1]){let x=s*3.3;box(x,.56,0,1.35,.26,1.4,'#8f9999');beam([x+s*1.45,1.5,0],[x-s*1.45,3.2,0],.49,'#315d80');beam([x-s*1.45,3.2,0],[x+s*1.45,4.9,0],.49,'#315d80')}
 beam([-1.10,1.2,.05],[1.10,5.2,.05],.46,'#b57d51');box(0,.56,0,2.6,.22,1.15,'#9eaaa9');
 `,

 probe:`bevelBox(0,0,0,2.65,.40,2.25,'#243544',.14);bevelBox(0,.39,0,2.37,.36,2.02,'#c3ced6',.12);bevelBox(0,.75,0,1.55,.24,1.43,'#314b66',.08);bevelBox(0,.99,0,1.20,.12,1.08,'#46bed7',.04);box(0,1.11,0,.75,.04,.67,'#e0f4ed');for(let k=-2;k<=2;k++)for(let s of [-1,1]){box(s*1.35,.2,k*.34,.32,.12,.19,'#b9864e');box(k*.38,.2,s*1.14,.2,.12,.28,'#b9864e')}for(let a of [-.94,.94])for(let b of [-.76,.76]){cyl(a,-.18,b,.29,.18,'#436178',8);cyl(a,-.23,b,.17,.06,'#80e4df',8)}bevelBox(0,.49,1.05,.87,.27,.2,'#102536',.04);cyl(0,.61,1.16,.08,.09,'#dff6fb',8);`,
 vision:`bevelBox(0,0,0,9.9,.40,5.9,'#aab9c0',.16);bevelBox(0,.4,0,9.4,.14,5.4,'#536879',.05);bevelBox(0,.54,-.3,3.2,1.05,3.1,'#344d65',.12);cyl(0,1.58,-.3,.72,2.6,'#b9c7d1',12,.40);bevelBox(0,4.1,-.3,3.8,1.8,2.65,'#e1e8e9',.15);bevelBox(0,4.38,1.04,3.2,1.18,.24,'#284054',.06);for(let x of [-.93,.93]){cyl(x,4.45,1.33,.39,.12,'#4e9abb',12);ball(x,4.67,1.4,.42,'#14283e',10,6);ball(x-.12,4.79,1.69,.095,'#d3f4ff',8,4)}for(let s of [-1,1]){bevelBox(s*3.85,.54,-1.3,.85,3.05,.85,'#c4d0d4',.07);box(s*3.85,3.6,-1.3,1.12,.12,1.12,'#366ee6');box(s*3.85,.54,1.2,.9,1.4,.9,'#466b86')}beam([-3.85,3.77,-1.3],[3.85,3.77,-1.3],.15,'#627988');`,
 data:`bevelBox(0,0,0,12.2,.42,5.5,'#a9b7bf',.16);for(let i=0;i<3;i++){let x=(i-1)*3.8;bevelBox(x,.42,0,3.14,5.6+i*.6,4.25,'#3c5368',.12);bevelBox(x,.59,2.17,2.7,5.12+i*.6,.13,'#152b42',.04);for(let k=0;k<7;k++){let y=.86+k*.62;box(x,y,2.27,2.35,.43,.12,'#788f9d');box(x-.65,y+.13,2.38,1.15,.08,.05,'#273d52');box(x+.88,y+.18,2.4,.16,.1,.06,k%3?'#6bcccf':'#edb461')}box(x,6.03+i*.6,0,2.85,.12,3.99,'#e0e7e8');for(let k=0;k<4;k++)box(x-1.0+k*.68,6.16+i*.6,0,.25,.05,2.8,'#5a778e')}for(let x of [-6,6])box(x,.42,0,.15,.12,4.9,'#c28a54');`,
 core:`bevelBox(0,0,0,8.8,.45,6.8,'#b5c4cc',.2);bevelBox(0,.45,0,6.2,.5,5.8,'#415c70',.12);for(let s of [-1,1])for(let i=-4;i<=4;i++){box(s*3.35,.57,i*.52,.7,.13,.22,'#c48c51');box(i*.52,.57,s*3.13,.22,.13,.7,'#c48c51')}bevelBox(0,.95,0,4.25,.45,4.25,'#283d54',.1);bevelBox(0,1.4,0,3.65,.24,3.65,'#d2e0e1',.07);bevelBox(0,1.64,0,2.9,.22,2.9,'#5389ca',.06);for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++)bevelBox(i*.79,1.86,j*.79,.69,.14,.69,'#b6d7eb',.025);for(let s of [-1,1]){box(s*3.7,.45,0,.15,.05,5.5,'#55b7c8');}`, 
 forge:`bevelBox(0,0,0,11.5,.45,5.8,'#abbac2',.18);for(let s of [-1,1]){bevelBox(s*4.9,.45,0,.82,6.4,1.2,'#a3b4c1',.08);box(s*4.9,.82,.67,.52,5.65,.12,'#2b4761');box(s*4.9,1,.77,.13,5.2,.06,'#e8b88b')}bevelBox(0,6.85,0,10.6,.7,1.4,'#c1cbd1',.12);box(0,6.94,.78,7.8,.24,.06,'#427da6');for(let s of [-1,1]){let x=s*2.55;let c=s<0?'#708ba0':'#c4d8de';cyl(x,.45,0,1.42,.24,'#3d5367',12);bevelBox(x,1.9,0,1.25,1.8,.82,c,.13);ball(x,4.15,0,.63,c,10,6);for(let a of [-1,1]){beam([x+a*.72,3.4,0],[x+a*1.12,2.24,0],.41,c);beam([x+a*.32,1.95,0],[x+a*.46,.85,0],.46,c);box(x+a*.46,.68,.14,.52,.25,.78,'#3b5265')}}`,
 probeEco:`box(0,0,0,2.65,.40,2.25,'#243544');bevelBox(0,.4,0,2.37,.36,2.02,'#c3ced6',.08);box(0,.76,0,1.55,.24,1.43,'#314b66');box(0,1,0,1.20,.12,1.08,'#46bed7');for(let a of [-1,1]){box(a*1.35,.22,0,.30,.12,1.9,'#b9864e');box(0,.22,a*1.15,2.2,.12,.22,'#b9864e');}box(0,.49,1.05,.87,.27,.2,'#102536');`,
 pavilion:`// Open architectural portal, brushed metal uprights and warm wood/ceramic slats.
 for(let a of [-1,1]){box(a*7.05,0,-3.35,1.05,.12,1.1,'#8c9394');box(a*7.05,.12,-3.35,.42,6.9,.44,'#d8d6cc');box(a*7.05,.5,-3.03,.13,5.9,.1,'#a77c56');box(a*7.05,0,2.9,.26,6.5,.26,'#adb7bb');box(a*7.05,6.5,-.15,.32,.24,6.45,'#b7bcc0');}
 box(0,7.02,-3.35,15.0,.37,.66,'#e2ded4');box(0,7.39,-3.35,14.3,.10,.45,'#b69d83');box(0,6.91,-3.01,13.9,.10,.08,'#b7e6e1');
 for(let side of [-1,1]){for(let k=0;k<5;k++){box(side*(4.2+k*.54),.18,-3.6,.24,5.75,.36,'#c0ae96');}box(side*5.28,5.96,-3.6,3.1,.20,.38,'#9f9e95');}
 `,
 console:`// Browser display surface is a separate, replaceable dynamic texture.
 bevelBox(0,0,0,10.9,.28,1.8,'#8f9699',.08);for(let a of [-1,1]){box(a*3.6,.28,0,.34,.68,.49,'#78858b');box(a*3.6,.18,0,1.05,.12,.94,'#626f76');}bevelBox(0,.96,0,10.6,5.84,.38,'#d8d9d2',.10);box(0,1.14,.21,10.19,5.44,.07,'#435669');box(0,1.34,.28,9.98,5.12,.035,'#1c3445');box(0,6.52,-.28,8.9,.12,.20,'#b6b7af');`,
 library:`// Architectural archive: individual real meshes, shelf joinery and book spines.
 box(0,0,0,12.7,.24,5.6,'#a9a399');for(let side of [-1,1]){box(side*6.15,.24,-.7,.24,5.75,3.1,'#d2c6b3');box(side*.13,.24,-.7,.22,5.75,3.1,'#b3a18c');}box(0,.24,-2.17,12.3,5.75,.18,'#b6bab5');for(let l=0;l<3;l++){let y=.25+l*1.85;box(0,y,-.65,12.4,.18,3.3,'#c9b79c');for(let a of [-1,1])for(let k=0;k<5;k++){let h=1.12+(k%3)*.18,c=['#637e91','#ded9c8','#896f5b','#394e65','#b2c6c4'][k];box(a*(.8+k*.98),y+.18,-.48,.64,h,2.45,c);box(a*(.8+k*.98),y+.36,.76,.48,.08,.025,'#d9c6a3');}}box(0,5.98,-.65,12.65,.21,3.4,'#d6c8b3');`,
 devbench:`// Reusable standing engineering desk, three slim monitors and keyboard trays.
 for(let side of [-1,1]){box(side*5.2,0,0,.32,2,3.15,'#77858a');box(side*5.2,0,0,1.2,.12,3.8,'#aab1af');}bevelBox(0,2,0,12.2,.28,4.0,'#bdab91',.07);box(0,1.8,-1.6,11.2,.25,.45,'#465660');for(let k=0;k<3;k++){let x=(k-1)*3.8;box(x,2.28,-.5,1.7,.11,1.2,'#63717a');box(x,2.39,-.5,.27,.82,.30,'#7f8c91');bevelBox(x,3.05,-.5,3.45,2.08,.18,'#283b4a',.055);box(x,3.17,-.38,3.18,1.85,.04,'#325569');for(let j=0;j<4;j++)box(x-.35,3.39+j*.32,-.35,2.1-(j%2)*.6,.08,.025,j%2?'#b6cebf':'#75b8d6');box(x,2.30,1.1,2.3,.09,.72,'#5c6871');box(x+1.5,2.30,1.1,.36,.14,.57,'#42525b');}`,

}
function align4(n){return (n+3)&~3}function exportGLB(name,a){let v=[],idx=[],map=new Map();for(let i=0;i<a.length;i+=9){const vals=a.slice(i,i+9).map(x=>Math.round(x*10000)/10000),key=vals.join(',');let id=map.get(key);if(id===undefined){id=v.length/9;map.set(key,id);v.push(...vals)}idx.push(id)}const n=v.length/9;const vert=Buffer.alloc(n*36);for(let i=0;i<v.length;i++)vert.writeFloatLE(v[i],i*4);const ib=Buffer.alloc(align4(idx.length*2));idx.forEach((x,i)=>ib.writeUInt16LE(x,i*2));const bin=Buffer.concat([vert,ib]);let min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];for(let i=0;i<v.length;i+=9)for(let j=0;j<3;j++){min[j]=Math.min(min[j],v[i+j]);max[j]=Math.max(max[j],v[i+j])}const json={asset:{version:'2.0',generator:'RVD Original Asset Workshop'},scene:0,scenes:[{nodes:[0]}],nodes:[{mesh:0,name}],meshes:[{name,primitives:[{attributes:{POSITION:0,NORMAL:1,COLOR_0:2},indices:3,material:0}]}],materials:[{name:'Satin hardware',pbrMetallicRoughness:{baseColorFactor:[1,1,1,1],metallicFactor:.2,roughnessFactor:.5}}],buffers:[{byteLength:bin.length}],bufferViews:[{buffer:0,byteOffset:0,byteLength:vert.length,byteStride:36,target:34962},{buffer:0,byteOffset:vert.length,byteLength:idx.length*2,target:34963}],accessors:[{bufferView:0,byteOffset:0,componentType:5126,count:n,type:'VEC3',min,max},{bufferView:0,byteOffset:12,componentType:5126,count:n,type:'VEC3'},{bufferView:0,byteOffset:24,componentType:5126,count:n,type:'VEC3'},{bufferView:1,componentType:5123,count:idx.length,type:'SCALAR'}]};let j=Buffer.from(JSON.stringify(json)),pad=Buffer.alloc(align4(j.length)-j.length,32),head=Buffer.alloc(20),bh=Buffer.alloc(8);head.write('glTF');head.writeUInt32LE(2,4);head.writeUInt32LE(20+j.length+pad.length+8+bin.length,8);head.writeUInt32LE(j.length+pad.length,12);head.write('JSON',16);bh.writeUInt32LE(bin.length);bh.write('BIN\0',4);const out=Buffer.concat([head,j,pad,bh,bin]);fs.writeFileSync(path.join(root,'assets/models',name+'.glb'),out);return {data:out.toString('base64'),faces:idx.length/3,bytes:out.length}}
let assets={};for(let [name,code] of Object.entries(models)){let a=vm.runInContext('mesh=[];'+code+';mesh',ctx);assets[name]=exportGLB(name,a)}fs.writeFileSync(path.join(root,'asset-kit.js'),'// Embedded originals for offline launch; generated from assets/models/*.glb.\nconst assetKit='+JSON.stringify(Object.fromEntries(Object.entries(assets).filter(([k])=>!['probe','probeEco','core','pavilion','visionStudio','exchangeHall'].includes(k)).map(([k,v])=>[k,v.data])))+';\n');console.log(Object.fromEntries(Object.entries(assets).map(([k,{faces,bytes}])=>[k,{faces,bytes}])));
