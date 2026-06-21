# Vue.js Migration Quick Start Guide

## Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

## Installation Steps

### 1. Install Dependencies

```bash
cd /workspace
npm install vue@3 pinia vue-router@4
npm install -D vite @vitejs/plugin-vue
```

Or use the provided package.json in vue-migration:

```bash
cd /workspace/vue-migration
npm install
```

### 2. Development Mode

Start the Vite development server with hot reload:

```bash
npm run dev
```

This will start a server at `http://localhost:3000`

### 3. Production Build

Build for production:

```bash
npm run build
```

Output will be in `/workspace/build/assets/`

### 4. Integration with Existing PHP

To integrate Vue components with your existing tt-rss installation:

#### Option A: Embed Vue in existing pages

Add to your PHP template (e.g., `prefs.php`):

```php
<div id="vue-prefs-app"></div>

<script type="module">
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PreferencesPanel from '/vue/components/prefs/PreferencesPanel.vue'

const app = createApp(PreferencesPanel)
app.use(createPinia())
app.mount('#vue-prefs-app')
</script>
```

#### Option B: Use built assets

After running `npm run build`, include the generated JS in your PHP:

```php
<link rel="stylesheet" href="/build/assets/main-[hash].css">
<script type="module" src="/build/assets/main-[hash].js"></script>
```

## Migrated Components

### 1. Dialog Component (`vue/components/common/Dialog.vue`)

A reusable dialog component replacing `dijit.Dialog`:

```vue
<template>
  <VueDialog 
    v-model="showDialog" 
    title="My Dialog"
    width="500px"
  >
    <p>Dialog content here</p>
    <template #actions>
      <button @click="handleOk">OK</button>
    </template>
  </VueDialog>
</template>

<script>
import VueDialog from '@components/common/Dialog.vue'

export default {
  components: { VueDialog },
  data() {
    return {
      showDialog: true
    }
  }
}
</script>
```

### 2. Preferences Panel (`vue/components/prefs/PreferencesPanel.vue`)

Complete preferences UI replacing Dojo widgets:

```vue
<template>
  <PreferencesPanel />
</template>

<script>
import PreferencesPanel from '@components/prefs/PreferencesPanel.vue'

export default {
  components: { PreferencesPanel }
}
</script>
```

### 3. App Store (`vue/stores/app.js`)

Centralized state management with Pinia:

```javascript
import { useAppStore } from '@stores/app'

const store = useAppStore()

// Access state
console.log(store.unreadCount)

// Call actions
await store.setNightMode(true)
await store.fetchFeeds()
```

## Migration Checklist

### Phase 1: Setup ✓
- [x] Vue 3 installed
- [x] Pinia store configured
- [x] Vite build system ready
- [x] Base components created

### Phase 2: Component Migration
- [ ] Migrate `SingleUseDialog.js` → `SingleUseDialog.vue`
- [ ] Migrate `CommonDialogs.js` → Enhanced Dialog component
- [ ] Migrate preference panels (`Pref*.js`)

### Phase 3: Core Features
- [ ] Migrate `Article.js` → ArticleView component
- [ ] Migrate `Headlines.js` → HeadlinesList component  
- [ ] Migrate `FeedTree.js` → FeedTree component

### Phase 4: Cleanup
- [ ] Remove Dojo dependencies
- [ ] Update build pipeline
- [ ] Add tests
- [ ] Performance optimization

## Common Patterns

### Replacing Dojo Widgets

**Dojo:**
```javascript
const dialog = new dijit.Dialog({
  title: "Info",
  content: "Message"
});
dialog.show();
```

**Vue:**
```vue
<VueDialog v-model="show" title="Info">
  Message
</VueDialog>
```

### Replacing Dojo AJAX

**Dojo:**
```javascript
xhr.post("backend.php", {op: "RPC", method: "getFeeds"}, function(reply) {
  // handle response
});
```

**Vue:**
```javascript
const response = await fetch('backend.php?op=RPC&method=getFeeds')
const data = await response.json()
// handle response
```

### Replacing Dojo State

**Dojo:**
```javascript
dojo.publish("feeds/loaded", [feeds]);
dojo.subscribe("feeds/loaded", this, this.onFeedsLoaded);
```

**Vue/Pinia:**
```javascript
// In store
state.feeds = feeds

// In component
watch(() => store.feeds, (newFeeds) => {
  // handle update
})
```

## Troubleshooting

### CSS Not Loading
Ensure you're importing styles in your main.js or component:
```javascript
import '../themes/light.css'
```

### Build Errors
Check that all Vue files have proper structure:
```vue
<template>...</template>
<script>...</script>
<style>...</style>
```

### State Not Updating
Make sure you're using Pinia stores correctly:
```javascript
// Wrong
store.someValue = newValue

// Right
store.updateSomeValue(newValue) // use action
```

## Next Steps

1. **Test the migration**: Start with migrating one small component
2. **Set up testing**: Add Vitest for unit tests
3. **Configure i18n**: Integrate translation system
4. **Optimize bundle**: Code splitting and lazy loading
5. **Add TypeScript**: Optional but recommended for large codebase

## Resources

- [Vue 3 Documentation](https://vuejs.org/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Vite Documentation](https://vitejs.dev/)
- [Vue Style Guide](https://vuejs.org/style-guide/)
