/**
 * Tiny Tiny RSS - Vue 3 Application Entry Point
 * 
 * This is the main entry point for the Vue 3 + Vuetify migration.
 * It bootstraps the Vue application and mounts it to the DOM.
 */

import { createApp } from 'vue';
import { createVuetify } from 'vuetify';
import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';
import { App } from './App.vue';

// Create Vuetify instance with default theme
const vuetify = createVuetify({
  theme: {
    defaultTheme: 'light',
  },
});

// Create Vue app instance
const app = createApp(App);

// Use Vuetify UI framework
app.use(vuetify);

// Mount the app
// The app will be mounted to the element with id="vue-app"
// This allows for gradual migration - the Dojo app can coexist with Vue components
// eslint-disable-next-line no-undef
const mountPoint = document.getElementById('vue-app');

if (mountPoint) {
  app.mount('#vue-app');
} else {
  // eslint-disable-next-line no-console
  console.warn('[Vue 3] Mount point #vue-app not found. Vue components will be available for lazy loading.');
}

// Export app instance for debugging
export default app;
