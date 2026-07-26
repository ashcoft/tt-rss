# Vite + Vue 3 + Vuetify Migration Guide for Tiny Tiny RSS

This document describes the migration from the legacy Dojo build system to Vite with Vue 3 and Vuetify while maintaining backward compatibility.

## Overview

The frontend build system has been enhanced with:
- **Vite**: Fast development server with HMR
- **Vue 3**: Modern reactive UI framework
- **Vuetify**: Material Design component framework
- **TypeScript**: Type-safe JavaScript (optional)

## Quick Start

### Prerequisites

```bash
# Install pnpm (if not already installed)
corepack enable
corepack prepare pnpm@latest --activate

# Approve build scripts
pnpm approve-builds esbuild
```

### Development Mode

```bash
# Install dependencies
pnpm install

# Start Vite dev server (Vue 3 + Vuetify)
pnpm run dev

# In another terminal, start your PHP backend
php -S localhost:8080
```

The Vite dev server will be available at `http://localhost:5173` and will proxy API requests to `localhost:8080`.

### Production Build

For production, continue using the existing PHP-served pages. The Vite build is primarily for development:

```bash
# Build for production (optional)
pnpm run build
```

### LESS Compilation

```bash
# Compile LESS themes to CSS
pnpm run less

# Watch and auto-compile LESS files
pnpm run less:watch
```

### Type Checking

```bash
# Run TypeScript type checking
pnpm run type-check

# Run Vue-specific linting
pnpm run lint:vue
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
| `vite.config.js` | Vite configuration with Vue + Vuetify + AMD support |
| `tsconfig.json` | TypeScript configuration |
| `tsconfig.node.json` | TypeScript config for Vite |
| `src/vue/main.ts` | Vue 3 application entry point |
| `src/vue/App.vue` | Main Vue application component |
| `src/vue/types/index.ts` | TypeScript type definitions |
| `src/vue/components/FeedTree.vue` | Feed tree component (Vuetify v-list) |
| `src/vue/components/Toolbar.vue` | Toolbar component (Vuetify v-btn) |
| `src/vue/components/HeadlinesList.vue` | Headlines list (Vuetify v-list) |
| `src/vue/components/ArticleView.vue` | Article view component |
| `src/vue/index.html` | Vue app HTML entry |
| `src/shim/amd-shim.js` | AMD compatibility shim for Dojo |
| `VITE_MIGRATION.md` | This documentation |

### Modified Files

| File | Change |
|------|--------|
| `package.json` | Added Vue 3, Vuetify, TypeScript, pnpm scripts |
| `eslint.config.js` | Added Vue linting rules |

### Unchanged Files

All other files remain unchanged:
- PHP backend files
- Dojo library files (`lib/dojo/`, `lib/dijit/`)
- Application JavaScript files (`js/`)
- Theme files (`themes/`)
- Gulp build scripts

## Vue 3 + Vuetify Components

### Component Mapping

The following Dojo/dijit widgets have been mapped to Vuetify components:

| Dojo Widget | Vuetify Component | Vue Component |
|-------------|-------------------|---------------|
| `dijit.Tree` | `v-list`, `v-list-group` | `FeedTree.vue` |
| `dijit.Toolbar` | `v-btn`, `v-btn-toggle` | `Toolbar.vue` |
| `dijit.Dialog` | `v-dialog` | Native |
| `dijit.Menu` | `v-menu` | Native |
| `dijit/form/*` | `v-text-field`, `v-select`, etc. | Native |
| `dijit/Tree` | `v-list` | `HeadlinesList.vue` |

### Vue Aliases

The following aliases are configured in `vite.config.js`:

| Alias | Path | Description |
|-------|------|-------------|
| `dojo` | `lib/dojo` | Core Dojo 1.x modules |
| `dijit` | `lib/dijit` | Dojo Dijit UI widgets |
| `fox` | `js` | Tiny Tiny RSS custom modules |
| `@` | `src/vue` | Vue source files |
| `@/components` | `src/vue/components` | Vue components |
| `@/composables` | `src/vue/composables` | Vue composables |
| `@/types` | `src/vue/types` | TypeScript types |

## TypeScript Types

Type definitions are located in `src/vue/types/index.ts`:

```typescript
import type { Feed, Category, Headline, Article } from '@/types';

// Use in components
const feed = ref<Feed>({ id: 1, title: 'My Feed', unread: 10 });
```

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
- [x] Phase 4: pnpm and TypeScript setup
- [x] Phase 5: Vue 3 + Vuetify components
- [x] Phase 6: Testing and validation
- [x] Phase 7: Documentation

## Future Enhancements

Potential improvements for future phases:

1. **Full ESM Migration**: Gradually convert Dojo modules to ESM
2. **HMR for Dojo**: Implement HMR for Dojo widgets
3. **Complete Component Migration**: Migrate remaining Dojo components to Vue
4. **Vue Router Integration**: Add client-side routing
5. **Pinia State Management**: Replace Dojo stores with Pinia
6. **Bundle Optimization**: Analyze and optimize the production bundle
7. **Full TypeScript Adoption**: Convert all Vue components to TypeScript

## Contributing

When making changes to the build system:

1. Test both dev mode (`npm run dev`) and the legacy PHP backend
2. Ensure backward compatibility is maintained
3. Update this documentation with any configuration changes
4. Test on multiple browsers (Chrome, Firefox, Safari)

## License

This migration is part of Tiny Tiny RSS and follows the same license as the main project.
