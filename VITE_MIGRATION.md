# Vite Migration Guide for Tiny Tiny RSS

This document describes the migration from the legacy Dojo build system to Vite while maintaining backward compatibility.

## Overview

The frontend build system has been enhanced with Vite to provide:
- Faster development with Hot Module Replacement (HMR)
- Modern JavaScript module handling
- Improved debugging experience
- Better build performance

## Quick Start

### Development Mode

```bash
# Install dependencies
npm install

# Start Vite dev server
npm run dev

# In another terminal, start your PHP backend
php -S localhost:8080
```

The Vite dev server will be available at `http://localhost:5173` and will proxy API requests to `localhost:8080`.

### Production Build

For production, continue using the existing PHP-served pages. The Vite build is primarily for development:

```bash
# Build for production (optional)
npm run build
```

### LESS Compilation

```bash
# Compile LESS themes to CSS
npm run less

# Watch and auto-compile LESS files
npm run less:watch
```

## Architecture

### Dual Build System

This implementation maintains two build systems:

1. **Legacy Dojo Build** (production)
   - Handled by PHP backend
   - Uses `lib/dojo/tt-rss-layer.js` (pre-built)
   - Serves original `index.php`

2. **Vite Build** (development)
   - Uses `index.html` as entry point
   - Provides HMR and fast refresh
   - Proxies to PHP backend for API calls

### Module Aliases

The following aliases are configured in `vite.config.js`:

| Alias | Path | Description |
|-------|------|-------------|
| `dojo` | `lib/dojo` | Core Dojo 1.x modules |
| `dijit` | `lib/dijit` | Dojo Dijit UI widgets |
| `fox` | `js` | Tiny Tiny RSS custom modules |
| `lib` | `lib` | General lib directory |

### AMD Compatibility

The existing Dojo AMD modules are pre-bundled using Vite's `optimizeDeps` feature. This converts AMD-style modules to ESM for Vite's dependency pre-bundling while maintaining the original module structure.

### Proxy Configuration

The dev server proxies the following paths to the PHP backend:

- `/backend.php` - Main API endpoint
- `/public.php` - Public API endpoint
- `/api` - API v1 endpoints
- `/cache` - Cached assets
- `/images` - Static images
- `/themes` - Theme CSS files

## File Changes

### New Files

| File | Purpose |
|------|---------|
| `vite.config.js` | Vite configuration with AMD support |
| `index.html` | Vite dev server entry point |
| `src/main.js` | Main development entry module |
| `src/shim/amd-shim.js` | AMD compatibility shim |
| `VITE_MIGRATION.md` | This documentation |

### Modified Files

| File | Change |
|------|--------|
| `package.json` | Added Vite dependency and npm scripts |

### Unchanged Files

All other files remain unchanged:
- PHP backend files
- Dojo library files (`lib/dojo/`, `lib/dijit/`)
- Application JavaScript files (`js/`)
- Theme files (`themes/`)
- Gulp build scripts

## Troubleshooting

### Module Resolution Issues

If you encounter module resolution errors:

1. Ensure the path aliases are correctly configured in `vite.config.js`
2. Check that the module file exists at the expected path
3. Verify the module ID matches the file path (e.g., `dojo/parser` -> `lib/dojo/parser.js`)

### AMD Shim Not Loading

If the AMD shim is not being applied:

1. Ensure `index.html` is being served by Vite (not PHP)
2. Check the browser console for shim initialization messages
3. Verify `src/shim/amd-shim.js` is being imported

### Proxy Not Working

If API calls are failing:

1. Ensure the PHP backend is running on the correct port (default: 8080)
2. Check the proxy configuration in `vite.config.js`
3. Verify the target URLs in the proxy settings match your backend setup

### Build Errors

For production build issues:

1. Run `npm run dev` to check if the dev server works
2. Check for syntax errors in imported modules
3. Verify all dependencies are installed with `npm install`

## Migration Progress

- [x] Phase 1: Analysis of existing build system
- [x] Phase 2: Vite configuration with AMD support
- [x] Phase 3: Entry point and AMD shim
- [x] Phase 4: npm scripts integration
- [ ] Phase 5: Testing and validation
- [ ] Phase 6: Documentation

## Future Enhancements

Potential improvements for future phases:

1. **Full ESM Migration**: Gradually convert Dojo modules to ESM
2. **HMR for Dojo**: Implement HMR for Dojo widgets
3. **TypeScript Support**: Add TypeScript with gradual adoption
4. **Modern Widgets**: Gradually replace dijit components with modern UI libraries
5. **Bundle Optimization**: Analyze and optimize the production bundle

## Contributing

When making changes to the build system:

1. Test both dev mode (`npm run dev`) and the legacy PHP backend
2. Ensure backward compatibility is maintained
3. Update this documentation with any configuration changes
4. Test on multiple browsers (Chrome, Firefox, Safari)

## License

This migration is part of Tiny Tiny RSS and follows the same license as the main project.
