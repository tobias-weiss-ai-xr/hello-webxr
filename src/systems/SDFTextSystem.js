import * as THREE from 'three';
import {System} from 'ecsy';
import {TextMesh} from 'troika-3d-text/dist/textmesh-standalone.esm.js';
import {Object3D, Text} from '../components/index.js';

const anchorMapping = {
  'left': 0,
  'center': 0.5,
  'right': 1
}
const baselineMapping = {
  'top': 0,
  'center': 0.5,
  'bottom': 1
}

export class SDFTextSystem extends System {

  updateText(textMesh, textComponent) {
    textMesh.text = textComponent.text;
    textMesh.textAlign = textComponent.textAlign;
    textMesh.anchor[0] = anchorMapping[textComponent.anchor];
    textMesh.anchor[1] = baselineMapping[textComponent.baseline];
    textMesh.color = textComponent.color;
    // Use troika default font if not specified
    textMesh.font = textComponent.font;
    textMesh.fontSize = textComponent.fontSize;
    textMesh.letterSpacing = textComponent.letterSpacing || 0;
    textMesh.lineHeight = textComponent.lineHeight || null;
    textMesh.overflowWrap = textComponent.overflowWrap;
    textMesh.whiteSpace = textComponent.whiteSpace;
    textMesh.maxWidth = textComponent.maxWidth;

    // Troika TextMesh creates material asynchronously after sync()
    // Set opacity via sync callback to ensure material exists
    if (textComponent.opacity !== undefined) {
      textMesh.sync(() => {
        if (textMesh.material) {
          textMesh.material.opacity = textComponent.opacity;
        }
      });
    } else {
      textMesh.sync();
    }
  }

  execute(delta, time) {
    var entities = this.queries.entities;

    entities.added.forEach(e => {
      var textComponent = e.getComponent(Text);

      const textMesh = new TextMesh();
      textMesh.name = 'textMesh';
      textMesh.anchor = [0, 0];
      textMesh.renderOrder = 1; //brute-force fix for ugly antialiasing, see issue #67

      // Add error handling for font loading failures
      textMesh.addEventListener('error', (err) => {
        console.error('[SDFTextSystem] TextMesh error:', err);
      });

      this.updateText(textMesh, textComponent);

      // Only add to entity after initial sync completes to ensure material exists
      textMesh.sync(() => {
        if (textMesh.material) {
          e.addComponent(Object3D, {value: textMesh});
        } else {
          console.warn('[SDFTextSystem] TextMesh created without material, skipping:', textComponent.text?.substring(0, 20));
        }
      });
    });

    entities.removed.forEach(e => {
      var object3D = e.getComponent(Object3D).value;
      var textMesh = object3D.getObjectByName('textMesh');
      textMesh.dispose();
      object3D.remove(textMesh);
    });

    entities.changed.forEach(e => {
      var object3D = e.getComponent(Object3D).value;
      if (object3D instanceof TextMesh) {
        var textComponent = e.getComponent(Text);
        this.updateText(object3D, textComponent);
      }
    });
  }
}

SDFTextSystem.queries = {
  entities: {
    components: [Text],
    listen: {
      added: true,
      removed: true,
      changed: [Text]
    }
  }
}
