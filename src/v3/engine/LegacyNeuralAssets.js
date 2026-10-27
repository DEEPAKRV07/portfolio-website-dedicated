import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Assets remain byte-for-byte unchanged. One uniform fit transform is separate
// from the author's hierarchy, materials and animation tracks.
export class LegacyNeuralAssets {
  constructor(){this.cache=new Map();this.pending=new Map();this.disposed=false;this.loader=new GLTFLoader();}
  async node(world,key){
    if(!['home','projects','skills','experience','education','contact'].includes(world))return null;
    if(!this.cache.has(world)){
      if(!this.pending.has(world))this.pending.set(world,this.loader.loadAsync(`${import.meta.env.BASE_URL}models/${world}.glb`).then(gltf=>{if(this.disposed){dispose(gltf.scene);return null;}this.cache.set(world,gltf);return gltf;}).catch(()=>null));
      if(!await this.pending.get(world))return null;
    }
    if(this.disposed)return null;
    const asset=this.cache.get(world),source=asset.scene.getObjectByName(`Node_${key}`);if(!source)return null;
    const model=source.clone(true),names=new Set(),ownedMaterials=[];
    model.traverse(o=>{
      names.add(o.name);if(o.name.endsWith('_label'))o.visible=false;
      // The exported solid shell occludes its luminous nucleus. Retain its
      // authored geometry/PBR values but expose it as the original wire cage.
      if(o.isMesh && /_(shell|core)$/.test(o.name)){
        o.material=o.material.clone();ownedMaterials.push(o.material);
        // Calibrate the exported ~3x emission for the site's HDR environment.
        // The source asset remains unchanged and the adjustment is reversible.
        o.material.emissiveIntensity*=.10;
        if(o.name.endsWith('_shell')){o.material.wireframe=true;o.material.transparent=true;o.material.opacity=.28;o.material.depthWrite=false;}
        else {o.material.color.set('#082d24');o.material.emissive.set('#138c61');o.material.emissiveIntensity=.06;o.material.metalness=.88;o.material.roughness=.14;o.material.envMapIntensity=1.8;}
      }
    });
    const clips=asset.animations.map(clip=>new THREE.AnimationClip(clip.name,clip.duration,clip.tracks.filter(t=>names.has(THREE.PropertyBinding.parseTrackName(t.name).nodeName)&&!t.name.includes('_label')))).filter(c=>c.tracks.length);
    // Exported core/shell children also have zero scale, but no scale track.
    // Repair only those degenerate, unanimated mesh scales (documented GLB audit).
    const animatedScale=new Set(clips.flatMap(c=>c.tracks.filter(t=>t.name.endsWith('.scale')).map(t=>THREE.PropertyBinding.parseTrackName(t.name).nodeName)));
    model.traverse(object=>{if(object.isMesh && object.scale.lengthSq()===0 && !animatedScale.has(object.name) && /_(core|shell)$/.test(object.name))object.scale.setScalar(1);});
    const mixer=new THREE.AnimationMixer(model);const duration=Math.max(.01,...clips.map(c=>c.duration));
    const actions=clips.map(clip=>{const a=mixer.clipAction(clip);a.setLoop(THREE.LoopOnce,1);a.clampWhenFinished=true;a.play();return a;});
    mixer.setTime(duration);model.updateMatrixWorld(true);
    const bounds=new THREE.Box3().setFromObject(model),extent=Math.max(...bounds.getSize(new THREE.Vector3()).toArray());
    if(!extent||!Number.isFinite(extent)){mixer.stopAllAction();ownedMaterials.forEach(m=>m.dispose());return null;}
    const center=new THREE.Group(),wrapper=new THREE.Group();center.position.copy(bounds.getCenter(new THREE.Vector3())).negate();center.add(model);wrapper.add(center);wrapper.scale.setScalar(1.12/extent);
    for(const action of actions)action.reset().play();mixer.setTime(0);
    return {wrapper,mixer,duration,world,key,dispose(){mixer.stopAllAction();mixer.uncacheRoot(model);ownedMaterials.forEach(m=>m.dispose());wrapper.removeFromParent();}};
  }
  dispose(){this.disposed=true;for(const asset of this.cache.values())dispose(asset.scene);this.cache.clear();this.pending.clear();}
}
function dispose(scene){const set=new Set();scene.traverse(o=>{if(o.geometry)set.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:o.material?[o.material]:[]){set.add(m);for(const v of Object.values(m))if(v?.isTexture)set.add(v);}});for(const object of set)object.dispose();}
