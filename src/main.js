/**
 * Tiny Tiny RSS - Vite Development Entry Point
 *
 * This module serves as the main entry point for Vite's development server.
 * It imports the existing Dojo modules to enable:
 * - Hot Module Replacement (HMR) in development
 * - Faster module resolution via Vite's dev server
 * - Better debugging experience with source maps
 *
 * The original Dojo AMD loader remains intact for production builds.
 */

// Initialize AMD shim before loading any Dojo modules
import './shim/amd-shim.js';

import '../js/common.js';
import '../js/tt-rss.js';

// Log Vite dev server status
if (import.meta.env.DEV) {
  console.log('[Vite] Development mode active');
  console.log('[Vite] HMR enabled for faster development');
  
  // Setup HMR acceptance
  if (import.meta.hot) {
    import.meta.hot.on('vite:beforeFullReload', () => {
      console.log('[Vite] Reloading application...');
    });
    
    import.meta.hot.on('vite:beforeSnapshotGeneration', () => {
      console.log('[Vite] Generating snapshot...');
    });
  }
}

// Export for potential module-level debugging
export { };
