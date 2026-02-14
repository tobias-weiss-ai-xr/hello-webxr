# src/systems - ECSY Systems

Entity-component systems running in ECSY world.

---

## KEY FILES
| File | Purpose |
|------|---------|
| `TransformSystem.js` | Syncs Position/Rotation to Object3D |
| `BillboardSystem.js` | Makes objects face camera |
| `HierarchySystem.js` | Parent-child transform propagation |
| `SDFTextSystem.js` | Renders signed distance field text |
| `ControllersSystem.js` | Updates VR controller transforms |
| `DebugHelperSystem.js` | Visual debug helpers |
| `AreaCheckerSystem.js` | Area enter/exit detection |

---

## SYSTEM PATTERN

All systems extend `System`, define `queries`, implement `execute(delta, time)`:

```javascript
import { System } from 'ecsy';

export default class MySystem extends System {
  execute(delta, time) {
    this.queries.myQuery.results.forEach(entity => { });
  }
}

MySystem.queries = {
  myQuery: {
    components: [Position, Object3D],
    listen: { added: true, changed: true }
  }
};
```

---

## QUERY TYPES

- `added`: New entities with required components
- `changed`: Entities with modified components
- `results`: All matching entities

```javascript
this.queries.position.added.forEach(updatePosition);
this.queries.position.changed.forEach(updatePosition);
```

---

## REGISTRATION

```javascript
ecsyWorld
  .registerSystem(SDFTextSystem)
  .registerSystem(TransformSystem);
```