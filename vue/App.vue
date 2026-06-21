<template>
  <div id="tt-rss-app" :class="{ 'night-mode': appStore.nightMode, 'combined-mode': appStore.combinedMode }">
    <!-- Loading Overlay -->
    <div v-if="appStore.isLoading" id="overlay" class="loading-overlay">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    </div>

    <!-- Main Layout -->
    <div id="main" class="border-container">
      <!-- Header Toolbar -->
      <header class="toolbar">
        <slot name="toolbar">
          <div class="toolbar-left">
            <button @click="toggleNightMode" class="toolbar-btn" title="Toggle night mode">
              <i class="material-icons">{{ appStore.nightMode ? 'brightness_7' : 'brightness_4' }}</i>
            </button>
          </div>
          <div class="toolbar-center">
            <span class="app-title">Tiny Tiny RSS</span>
          </div>
          <div class="toolbar-right">
            <span class="unread-count" v-if="appStore.unreadCount > 0">
              {{ appStore.unreadCount }} unread
            </span>
          </div>
        </slot>
      </header>

      <!-- Content Area -->
      <div class="content-wrapper">
        <slot name="content">
          <router-view v-if="$router" />
          <div v-else class="default-content">
            <p>Welcome to tt-rss Vue Migration</p>
          </div>
        </slot>
      </div>
    </div>

    <!-- Global Dialog Container -->
    <div id="dialog-container"></div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { useAppStore } from './stores/app'

export default defineComponent({
  name: 'App',
  setup() {
    const appStore = useAppStore()

    return {
      appStore
    }
  },
  methods: {
    toggleNightMode() {
      this.appStore.setNightMode(!this.appStore.nightMode)
    }
  }
})
</script>

<style>
#tt-rss-app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-content {
  text-align: center;
  color: white;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Main Layout */
.border-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

/* Toolbar */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background: var(--toolbar-bg, #f5f5f5);
  border-bottom: 1px solid var(--border-color, #ddd);
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.toolbar-center {
  flex: 1;
  text-align: center;
}

.toolbar-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  color: var(--text-color, #333);
}

.toolbar-btn:hover {
  background: var(--hover-bg, rgba(0, 0, 0, 0.1));
}

.app-title {
  font-weight: bold;
  font-size: 1.1rem;
}

.unread-count {
  background: var(--primary-color, #257aa7);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.875rem;
}

/* Content Wrapper */
.content-wrapper {
  flex: 1;
  overflow: auto;
  position: relative;
}

.default-content {
  padding: 2rem;
  text-align: center;
  color: var(--text-color, #666);
}

/* Night Mode */
.night-mode {
  --bg-color: #303030;
  --text-color: #e0e0e0;
  --border-color: #444;
  --toolbar-bg: #2a2a2a;
  --hover-bg: rgba(255, 255, 255, 0.1);
}

/* Combined Mode */
.combined-mode .content-wrapper {
  /* Combined display mode styles */
}
</style>
