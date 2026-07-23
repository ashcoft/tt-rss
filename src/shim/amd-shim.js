/**
 * AMD (Asynchronous Module Definition) Shim for Vite
 *
 * This module provides compatibility between Dojo 1.x's AMD format and
 * Vite's ES Module system. It allows existing Dojo AMD modules to be
 * imported and used within Vite's development and build process.
 *
 * The shim works by:
 * 1. Intercepting require() calls from Dojo
 * 2. Converting AMD-style define() exports
 * 3. Making the dojo global available for legacy code
 *
 * Usage:
 *   import 'src/shim/amd-shim.js';
 *   // Now AMD modules can be imported via Vite
 */

/**
 * AMD Shim Configuration
 * Tracks loaded modules and their exports
 */
const AMDShim = {
  // Module cache - stores resolved module exports
  modules: new Map(),

  // Definition cache - stores module definitions awaiting resolution
  definitions: new Map(),

  // Currently executing module ID
  currentModuleId: null,

  /**
   * Initialize the AMD shim
   * Sets up global dojo/dojo/dojo require/define functions
   */
  init() {
    // Make dojo global available if not already set
    if (!window.dojo) {
      window.dojo = {};
    }

    // Set up the global require function that Dojo expects
    if (!window.require) {
      window.require = this.require.bind(this);
    }

    // Set up the global define function that Dojo expects
    if (!window.define) {
      window.define = this.define.bind(this);
    }

    console.log('[AMD Shim] Initialized for Dojo 1.x compatibility');
  },

  /**
   * Parse a module ID and resolve it to an absolute path
   * Handles Dojo module naming convention (e.g., 'dojo/parser' -> 'lib/dojo/parser.js')
   */
  resolveModuleId(moduleId) {
    if (!moduleId || typeof moduleId !== 'string') {
      return null;
    }

    // Skip URLs and empty strings
    if (moduleId.startsWith('http') || moduleId.startsWith('//') || moduleId === '') {
      return moduleId;
    }

    // Handle .js extension
    if (moduleId.endsWith('.js')) {
      return moduleId;
    }

    // Handle dojo/text! plugin syntax
    if (moduleId.startsWith('dojo/text!')) {
      const templatePath = moduleId.replace('dojo/text!', '');
      return templatePath.startsWith('/') ? templatePath : `/${templatePath}`;
    }

    // Handle relative paths
    if (moduleId.startsWith('./') || moduleId.startsWith('../')) {
      const basePath = AMDShim.currentModuleId?.replace(/\/[^/]+\.js$/, '') || '';
      return resolveRelativePath(basePath, moduleId);
    }

    // Map prefixes to path patterns
    const prefixMap = [
      { prefix: 'dojo/', path: '/lib/dojo/' },
      { prefix: 'dijit/', path: '/lib/dijit/' },
      { prefix: 'fox/', path: '/js/' },
      { prefix: 'dojo/data/', path: '/lib/dojo/data/' },
      { prefix: 'dojo/store/', path: '/lib/dojo/store/' },
      { prefix: 'dojo/dnd/', path: '/lib/dojo/dnd/' },
      { prefix: 'dojo/request/', path: '/lib/dojo/request/' },
      { prefix: 'dojo/fx/', path: '/lib/dojo/fx/' },
      { prefix: 'dojo/date/', path: '/lib/dojo/date/' },
      { prefix: 'dijit/form/', path: '/lib/dijit/form/' },
      { prefix: 'dijit/layout/', path: '/lib/dijit/layout/' },
      { prefix: 'dijit/tree/', path: '/lib/dijit/tree/' },
      { prefix: 'dijit/_', path: '/lib/dijit/' },
      { prefix: 'dojo/_base/', path: '/lib/dojo/_base/' },
    ];

    for (const { prefix, path } of prefixMap) {
      if (moduleId.startsWith(prefix)) {
        const sliceLen = prefix.endsWith('/') ? prefix.slice(0, -1).length + 1 : prefix.length;
        return `${path}${moduleId.slice(sliceLen)}.js`;
      }
    }

    // Unknown module - return as-is
    console.warn(`[AMD Shim] Unknown module type: ${moduleId}`);
    return moduleId;
  },

  /**
   * The AMD define() function
   * Implements the AMD module definition interface
   */
  define(moduleId, dependencies, factory) {
    // Handle define(modules) shorthand
    if (Array.isArray(moduleId)) {
      factory = dependencies;
      dependencies = moduleId;
      moduleId = AMDShim.currentModuleId;
    } else if (typeof moduleId === 'function') {
      // Handle define(factory) shorthand
      factory = moduleId;
      dependencies = ['require', 'exports', 'module'];
      moduleId = AMDShim.currentModuleId;
    }

    // Normalize arguments
    if (typeof dependencies === 'function') {
      factory = dependencies;
      dependencies = ['require', 'exports', 'module'];
    }

    // Store the definition
    AMDShim.definitions.set(moduleId, {
      id: moduleId,
      dependencies: dependencies,
      factory: factory,
      resolved: false
    });

    // If this is being called during module loading, execute it immediately
    if (moduleId && factory) {
      this.executeModule(moduleId);
    }
  },

  /**
   * Execute a module's factory function with its dependencies
   */
  executeModule(moduleId) {
    const def = AMDShim.definitions.get(moduleId);
    if (!def || def.resolved) {
      return;
    }

    // Create module entry
    const moduleEntry = {
      id: moduleId,
      exports: {}
    };
    AMDShim.modules.set(moduleId, moduleEntry);

    // Set current module context
    const previousModuleId = AMDShim.currentModuleId;
    AMDShim.currentModuleId = moduleId;

    try {
      // Resolve dependencies
      const resolvedDeps = (def.dependencies || []).map(dep => {
        if (dep === 'require') {
          return {
            resolve: (id) => AMDShim.resolveModuleId(id),
            toUrl: (id) => AMDShim.resolveModuleId(id)
          };
        }
        if (dep === 'exports') {
          return moduleEntry.exports;
        }
        if (dep === 'module') {
          return {
            id: moduleId,
            exports: moduleEntry.exports
          };
        }

        // Return cached module or stub
        const cached = AMDShim.modules.get(dep);
        return cached ? cached.exports : createLazyModuleStub(dep);
      });

      // Execute factory
      if (typeof def.factory === 'function') {
        const result = def.factory(...resolvedDeps);
        // If factory returns a value, use it as the export
        if (result !== undefined) {
          moduleEntry.exports = result;
          AMDShim.modules.set(moduleId, moduleEntry);
        }
      } else {
        // Factory is an object - use it directly
        moduleEntry.exports = def.factory;
        AMDShim.modules.set(moduleId, moduleEntry);
      }

      def.resolved = true;
    } catch (error) {
      console.error(`[AMD Shim] Error executing module ${moduleId}:`, error);
    } finally {
      // Restore previous module context
      AMDShim.currentModuleId = previousModuleId;
    }
  },

  /**
   * The AMD require() function
   * Implements the AMD module loading interface
   */
  require(dependencies, callback, errback) {
    // Handle require(modules) shorthand
    if (typeof dependencies === 'function') {
      callback = dependencies;
      dependencies = [];
    }

    // Resolve all dependencies
    const resolvedDeps = dependencies.map(dep => {
      // Handle special AMD dependencies
      if (dep === 'require') {
        return {
          resolve: (id) => AMDShim.resolveModuleId(id),
          toUrl: (id) => AMDShim.resolveModuleId(id)
        };
      }
      if (dep === 'exports') {
        return AMDShim.modules.get(AMDShim.currentModuleId)?.exports || {};
      }
      if (dep === 'module') {
        return {
          id: AMDShim.currentModuleId,
          exports: AMDShim.modules.get(AMDShim.currentModuleId)?.exports || {}
        };
      }

      // Return the cached module or create a require stub
      const cached = AMDShim.modules.get(dep);
      if (cached) {
        return cached.exports;
      }

      // Return a lazy loader stub
      return createLazyModuleStub(dep);
    });

    // Execute the callback with resolved dependencies
    try {
      if (callback) {
        callback(...resolvedDeps);
      }
    } catch (error) {
      if (errback) {
        errback(error);
      } else {
        console.error('[AMD Shim] Error in module:', error);
      }
    }
  },

  /**
   * Get a cached module's exports
   */
  getCached(moduleId) {
    return AMDShim.modules.get(moduleId)?.exports;
  },

  /**
   * Check if a module is cached
   */
  isCached(moduleId) {
    return AMDShim.modules.has(moduleId);
  }
};

/**
 * Resolve a relative path from a base path
 */
function resolveRelativePath(basePath, relativePath) {
  const baseParts = basePath.split('/').filter(Boolean);
  const relParts = relativePath.split('/').filter(Boolean);

  for (const part of relParts) {
    if (part === '..') {
      baseParts.pop();
    } else if (part !== '.') {
      baseParts.push(part);
    }
  }

  return '/' + baseParts.join('/');
}

/**
 * Create a lazy module stub that loads the module on first access
 * Returns a synchronous stub that will be populated once the module loads
 */
function createLazyModuleStub(moduleId) {
  // Create a stub object that will be populated with actual exports
  const stub = {};

  // Trigger async loading in the background
  loadModule(moduleId).then(exports => {
    // Copy all exports to the stub
    if (exports && typeof exports === 'object') {
      Object.assign(stub, exports);
    }
  }).catch(error => {
    console.warn(`[AMD Shim] Failed to load module ${moduleId}:`, error);
  });

  return stub;
}

/**
 * Dynamically load a module and return its exports
 */
async function loadModule(moduleId) {
  // Check if already loaded
  const cached = AMDShim.modules.get(moduleId);
  if (cached) {
    return cached.exports;
  }

  const resolvedPath = AMDShim.resolveModuleId(moduleId);

  if (!resolvedPath) {
    console.warn(`[AMD Shim] Cannot resolve module: ${moduleId}`);
    return {};
  }

  // Skip external URLs
  if (resolvedPath.startsWith('http') || resolvedPath.startsWith('//')) {
    return {};
  }

  // Set current module context before loading
  const previousModuleId = AMDShim.currentModuleId;
  AMDShim.currentModuleId = moduleId;

  try {
    const module = await import(/* @vite-ignore */ resolvedPath);

    // Check if the module registered itself via define()
    const registered = AMDShim.modules.get(moduleId);
    if (registered) {
      return registered.exports;
    }

    // Otherwise return the ES module exports
    return module.default || module;
  } catch (error) {
    console.warn(`[AMD Shim] Failed to load module ${moduleId}:`, error);
    return {};
  } finally {
    // Restore previous module context
    AMDShim.currentModuleId = previousModuleId;
  }
}

// Initialize the AMD shim
AMDShim.init();

// Export for external use
window.AMDShim = AMDShim;

// Also expose key methods on window for debugging
window.__amdShim = {
  modules: AMDShim.modules,
  definitions: AMDShim.definitions,
  getCached: AMDShim.getCached.bind(AMDShim),
  isCached: AMDShim.isCached.bind(AMDShim)
};

export default AMDShim;
