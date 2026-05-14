# Draft: Fix H Room and Implement Remaining Rooms

## User's Request
"plan how to fix the H room and how to implement the other remaining rooms"

## Investigation Findings

### Architecture Understanding
- **Lobby (index 0)**: `src/rooms/Lobby.js` - Main periodic table overview with navigation
- **Element rooms (indices 1-118)**: Single generic `ElementRoom.js` reused for ALL 118 elements (H, He, Li, Be, B, C, N, O, F, Ne, Na, Mg, Al, Si, P, S, Cl, Ar, Ca, Fe, Cu, Au, U, and 95 more)
- **Experimental rooms (indices 119-128)**: Single generic `ExperimentalRoom.js` reused for all 10 rooms

### Critical Bug Identified
**File**: `src/index.js`
- Line 28: `import * as roomLobby from './rooms/Lobby.js';`
- Line 280: `rooms[ROOM_LOBBY].setup(context);`
- **BUG**: `rooms[ROOM_LOBBY]` (rooms[0]) is never assigned - will crash at startup

### Room Registration Pattern
```javascript
// Element rooms (lines 283-286) - working correctly
ELEMENTS.forEach((element, index) => {
  const roomIndex = ROOM_ELEMENTS_START + index;
  rooms[roomIndex] = ElementRoom;  // Same module for all
});

// Experimental rooms (lines 288-291) - working correctly
EXPERIMENTAL_ROOMS.forEach((room, index) => {
  const roomIndex = ROOM_EXP_START + index;
  rooms[roomIndex] = ExperimentalRoom;  // Same module for all
});
```

### "H Room" Reality
- There is NO individual H room file
- The generic `ElementRoom.js` handles Hydrogen by accepting `elementSymbol = 'H'` parameter
- It looks up element data: `ELEMENTS.find(e => e.symbol === 'H')`
- Creates themed 3D atom model, info panel, electron shells, experiment stations
- The real issue is the room[0] crash preventing access

### Element Data Structure
Each element has:
- symbol, name, atomicNumber, mass
- group, period, block, groupNumber, color
- description, theme, experiments (array)

### Experimental Rooms (10 total)
1. `reaction_lab` - Has setup
2. `nuclear_chamber` - Has setup
3. `electrochem_lab` - Has setup
4. `organic_chem` - Has setup
5. `extreme_conditions` - **NO specific setup**
6. `industrial_apps` - **NO specific setup**
7. `historical_lab` - **NO specific setup**
8. `space_chem` - **NO specific setup**
9. `nano_world` - **NO specific setup**
10. `challenge_arena` - Has setup

## Requirements

### Must Fix
1. **Critical**: Assign `rooms[ROOM_LOBBY] = roomLobby` before line 280
2. **Verify**: Test that ElementRoom works correctly with Hydrogen and other elements
3. **Complete**: Implement 5 missing experimental room setups (extreme_conditions, industrial_apps, historical_lab, space_chem, nano_world)

### Must NOT Do
- Create individual room files for each element (H.js, He.js, etc.) - not the established pattern
- Modify the generic ElementRoom.js unnecessarily
- Change the room registration pattern

## Test Strategy
- Use existing Playwright tests
- Test room navigation functionality
- Verify element room loads correctly with Hydrogen data
- Test experimental room startup for all 10 rooms