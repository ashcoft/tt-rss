# Vue.js Migration Guide for Tiny Tiny RSS

## Overview

This document outlines the incremental migration strategy from Dojo Toolkit to Vue.js 3 for the tt-rss frontend.

## Why Vue.js?

1. **Incremental Adoption**: Vue can coexist with Dojo code during migration
2. **Similar Component Model**: Easier transition from Dojo widgets to Vue components
3. **Lightweight**: Smaller bundle size than React/Angular
4. **Excellent Documentation**: Easy learning curve for the team
5. **Strong Ecosystem**: Vue Router, Pinia (state management), Vite (build tool)

## Migration Phases

### Phase 1: Setup & Infrastructure (Week 1-2)
- [x] Add Vue 3 via build system (Vite)
- [ ] Create Vue wrapper components for Dojo interoperability
- [ ] Set up Pinia for shared app state
- [ ] Configure build pipeline

### Phase 2: Migrate Independent Components (Week 3-6)
Start with isolated, self-contained components:
1. **Common Dialogs** (`CommonDialogs.js`) - Reusable across app
2. **Preferences UI** (`prefs.js`, `Pref*.js`) - Self-contained, easy to test
3. **Single Use Dialog** (`SingleUseDialog.js`) - Simple component

### Phase 3: Core Features (Week 7-12)
4. **Article View** (`Article.js`) - Mostly display logic
5. **Headlines** (`Headlines.js`) - Complex but isolated
6. **Feed Tree** (`FeedTree.js`) - Most complex, migrate last

### Phase 4: Cleanup (Week 13+)
- Remove Dojo dependencies
- Optimize bundle size
- Add comprehensive tests

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install Vue 3 and related dependencies
npm install vue@3 pinia vue-router@4

# Install Vite for building
npm install -D vite @vitejs/plugin-vue
```

### Build Commands

```bash
# Development mode with hot reload
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## File Structure

```
/workspace
├── js/                    # Existing Dojo code
│   ├── App.js
│   ├── CommonDialogs.js
│   └── ...
├── vue/                   # New Vue.js components (to be created)
│   ├── components/
│   │   ├── common/
│   │   │   └── Dialog.vue
│   │   ├── prefs/
│   │   │   └── PreferencesPanel.vue
│   │   └── article/
│   │       └── ArticleView.vue
│   ├── stores/
│   │   └── app.js
│   ├── App.vue
│   └── main.js
├── index.php              # Main entry point (will be updated)
└── vite.config.js         # Vite configuration
```

## Component Migration Example

### Before (Dojo Widget)
```javascript
// js/CommonDialogs.js
define(["dojo/_base/declare", "dijit/Dialog"], function(declare, Dialog) {
    return declare("fox.CommonDialogs", null, {
        showError: function(message) {
            const dialog = new Dialog({
                title: "Error",
                content: message,
                style: "width: 400px"
            });
            dialog.show();
        }
    });
});
```

### After (Vue Component)
```vue
<!-- vue/components/common/Dialog.vue -->
<template>
  <Teleport to="body">
    <div v-if="modelValue" class="vue-dialog-overlay" @click="close">
      <div class="vue-dialog" @click.stop>
        <div class="vue-dialog-header">
          <h3>{{ title }}</h3>
          <button @click="close" class="close-btn">&times;</button>
        </div>
        <div class="vue-dialog-content">
          <slot>{{ content }}</slot>
        </div>
        <div class="vue-dialog-footer">
          <slot name="actions">
            <button @click="close" class="btn-primary">OK</button>
          </slot>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
export default {
  name: 'VueDialog',
  props: {
    modelValue: Boolean,
    title: String,
    content: String
  },
  emits: ['update:modelValue'],
  methods: {
    close() {
      this.$emit('update:modelValue', false)
    }
  }
}
</script>

<style scoped>
.vue-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.vue-dialog {
  background: white;
  border-radius: 8px;
  min-width: 400px;
  max-width: 90vw;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.vue-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.vue-dialog-content {
  padding: 1rem;
}

.vue-dialog-footer {
  padding: 1rem;
  border-top: 1px solid #eee;
  text-align: right;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.btn-primary {
  background: #257aa7;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}
</style>
```

## State Management with Pinia

```javascript
// vue/stores/app.js
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    user: null,
    feeds: [],
    unreadCount: 0,
    nightMode: false,
    combinedMode: false
  }),
  
  getters: {
    isLoggedIn: (state) => !!state.user,
    totalFeeds: (state) => state.feeds.length
  },
  
  actions: {
    async fetchFeeds() {
      const response = await fetch('backend.php?op=RPC&method=getFeeds')
      this.feeds = await response.json()
    },
    
    setNightMode(enabled) {
      this.nightMode = enabled
      // Persist to backend
      fetch('backend.php?op=RPC&method=setpref', {
        method: 'POST',
        body: JSON.stringify({ key: 'NIGHT_MODE', value: enabled })
      })
    }
  }
})
```

## Interoperability Strategy

During migration, Vue and Dojo will coexist:

1. **Vue in Dojo**: Embed Vue components in Dojo containers
2. **Dojo in Vue**: Wrap Dojo widgets as Vue components when needed
3. **Shared State**: Use Pinia store as single source of truth
4. **Event Bridge**: Custom events for cross-framework communication

### Example: Vue Component in Dojo Container

```javascript
// In existing Dojo code
const container = document.getElementById('prefs-container');
const app = createApp(PreferencesPanel, { userId: currentUserId });
app.use(store);
app.mount(container);
```

### Example: Dojo Widget in Vue

```vue
<template>
  <div ref="dojoContainer"></div>
</template>

<script>
import { onMounted, onBeforeUnmount, ref } from 'vue';
import dojoParser from 'dojo/parser';

export default {
  setup() {
    const dojoContainer = ref(null);
    
    onMounted(async () => {
      await dojoParser.parse(dojoContainer.value);
    });
    
    onBeforeUnmount(() => {
      // Cleanup Dojo widgets
    });
    
    return { dojoContainer };
  }
}
</script>
```

## Testing Strategy

- **Unit Tests**: Vitest for Vue components
- **Integration Tests**: Playwright for end-to-end testing
- **Visual Regression**: Percy or Chromatic for UI consistency

## Performance Considerations

1. **Code Splitting**: Lazy load Vue components by route
2. **Tree Shaking**: Remove unused Dojo modules gradually
3. **Bundle Analysis**: Use `rollup-plugin-visualizer` to track bundle size
4. **Caching**: Leverage Vue's built-in caching for computed properties

## Rollback Plan

If issues arise during migration:
1. Keep Dojo code intact until Vue replacement is fully tested
2. Use feature flags to toggle between implementations
3. Maintain parallel routes during transition period

## Next Steps

1. Review this guide with the team
2. Set up development environment
3. Start with migrating `SingleUseDialog.js` as proof of concept
4. Establish coding standards for Vue components
5. Create component library documentation

## Resources

- [Vue 3 Documentation](https://vuejs.org/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Vite Documentation](https://vitejs.dev/)
- [Vue Migration Guide from jQuery-like codebases](https://v3-migration.vuejs.org/)
