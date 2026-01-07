import * as THREE from 'three';

export default {
  // Shared door texture (used by all learning rooms)
  doorfx_tex: { url: 'doorfx.basis', options: { wrapT: THREE.RepeatWrapping, wrapS: THREE.RepeatWrapping } },

  // Controller assets
  generic_controller_model: { url: 'generic_controller.glb' },
  controller_tex: { url: 'controller.basis' },

  // Teleport assets
  teleport_model: { url: 'teleport.glb' },
  glow_tex: { url: 'glow.basis', options: { encoding: THREE.sRGBEncoding } },
  beam_tex: { url: 'beamfx.png' },

  // Teleport sounds - disabled due to browser compatibility issues
  // teleport_a_snd: { url: 'ogg/teleport_a.ogg' },
  // teleport_b_snd: { url: 'ogg/teleport_b.ogg' },
};
