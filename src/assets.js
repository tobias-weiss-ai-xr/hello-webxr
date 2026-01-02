import * as THREE from 'three';

export default {
  // core/shared
  generic_controller_model: { url: 'generic_controller.glb' },
  controller_tex: { url: 'controller.basis' },
  doorfx_tex: { url: 'doorfx.basis', options: { wrapT: THREE.RepeatWrapping, wrapS: THREE.RepeatWrapping }},
  teleport_model: { url: 'teleport.glb' },
  beam_tex: { url: 'beamfx.png' },
  glow_tex: { url: 'glow.basis', options: { encoding: THREE.sRGBEncoding} },

  // spider
  spider_model: { url: 'spider.glb' }
};

