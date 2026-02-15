/**
 * HapticManager - VR Controller Haptic Feedback System
 * 
 * Provides haptic pulse utilities for WebXR controllers.
 * Falls back gracefully on non-supporting devices.
 */

class HapticManager {
  constructor() {
    this.actuators = new Map(); // controller -> actuator
    this.enabled = true;
  }

  /**
   * Register a controller's haptic actuator
   * @param {XRInputSource} inputSource - The WebXR input source
   */
  registerController(inputSource) {
    if (!inputSource || !inputSource.gamepad) return;
    
    const gamepad = inputSource.gamepad;
    
    // WebXR haptic API: gamepad.hapticActuators (array)
    if (gamepad.hapticActuators && gamepad.hapticActuators.length > 0) {
      this.actuators.set(inputSource, gamepad.hapticActuators[0]);
      return;
    }
    
    // Gamepad Extensions API fallback: gamepad.vibrationActuator
    if (gamepad.vibrationActuator) {
      this.actuators.set(inputSource, gamepad.vibrationActuator);
    }
  }

  /**
   * Unregister a controller
   * @param {XRInputSource} inputSource 
   */
  unregisterController(inputSource) {
    this.actuators.delete(inputSource);
  }

  /**
   * Pulse a specific controller
   * @param {XRInputSource} inputSource - The controller to pulse
   * @param {number} intensity - Pulse strength (0-1)
   * @param {number} duration - Pulse duration in ms
   */
  pulse(inputSource, intensity = 0.5, duration = 50) {
    if (!this.enabled) return;
    
    const actuator = this.actuators.get(inputSource);
    if (!actuator) return;

    try {
      // WebXR hapticActuators API
      if (actuator.pulse) {
        actuator.pulse(intensity, duration);
      }
      // Gamepad vibration API fallback
      else if (actuator.playEffect) {
        actuator.playEffect('dual-rumble', {
          duration: duration,
          strongMagnitude: intensity,
          weakMagnitude: intensity * 0.8
        });
      }
    } catch (e) {
      // Silently fail - haptics not supported
    }
  }

  /**
   * Pulse all registered controllers
   * @param {number} intensity - Pulse strength (0-1)
   * @param {number} duration - Pulse duration in ms
   */
  pulseAll(intensity = 0.5, duration = 50) {
    this.actuators.forEach((_, inputSource) => {
      this.pulse(inputSource, intensity, duration);
    });
  }

  /**
   * Quick tap feedback - short, light pulse for UI interactions
   * @param {XRInputSource} inputSource 
   */
  tap(inputSource) {
    this.pulse(inputSource, 0.3, 20);
  }

  /**
   * Click feedback - medium pulse for button presses
   * @param {XRInputSource} inputSource 
   */
  click(inputSource) {
    this.pulse(inputSource, 0.5, 40);
  }

  /**
   * Success feedback - double pulse pattern
   * @param {XRInputSource} inputSource 
   */
  success(inputSource) {
    this.pulse(inputSource, 0.6, 50);
    setTimeout(() => this.pulse(inputSource, 0.4, 30), 80);
  }

  /**
   * Warning feedback - stronger, longer pulse
   * @param {XRInputSource} inputSource 
   */
  warning(inputSource) {
    this.pulse(inputSource, 0.8, 100);
  }

  /**
   * Impact feedback - heavy pulse for collisions/impacts
   * @param {XRInputSource} inputSource 
   */
  impact(inputSource) {
    this.pulse(inputSource, 1.0, 80);
  }

  /**
   * Enable/disable haptics globally
   * @param {boolean} enabled 
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  /**
   * Check if haptics are available for a controller
   * @param {XRInputSource} inputSource 
   * @returns {boolean}
   */
  isAvailable(inputSource) {
    return this.actuators.has(inputSource);
  }
}

// Singleton instance
export const hapticManager = new HapticManager();
export default hapticManager;
