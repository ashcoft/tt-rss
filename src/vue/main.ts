/**
 * Tiny Tiny RSS - Vue 3 Application Entry Point
 * 
 * This is the main entry point for the Vue 3 + Element Plus migration.
 * It bootstraps the Vue application and mounts it to the DOM.
 */

import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import App from './App.vue';

// Create Vue app instance
const app = createApp(App);

// Use Element Plus UI framework
app.use(ElementPlus);

// Mount the app
// The app will be mounted to the element with id="vue-app"
// This allows for gradual migration - the Dojo app can coexist with Vue components
const mountPoint = document.getElementById('vue-app');

if (mountPoint) {
  app.mount('#vue-app');
  console.log('[Vue 3] Tiny Tiny RSS Vue app mounted');
} else {
  console.warn('[Vue 3] Mount point #vue-app not found. Vue components will be available for lazy loading.');
}

// Export app instance for debugging
export default app;
