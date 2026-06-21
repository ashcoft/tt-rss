<template>
  <div class="preferences-panel">
    <div class="prefs-header">
      <h2>{{ __('Preferences') }}</h2>
    </div>

    <div class="prefs-content">
      <!-- User Preferences -->
      <section class="prefs-section">
        <h3>{{ __('User Settings') }}</h3>
        
        <div class="form-group">
          <label for="username">{{ __('Username') }}</label>
          <input 
            type="text" 
            id="username" 
            v-model="localPrefs.username"
            disabled
            class="form-control"
          />
        </div>

        <div class="form-group">
          <label for="email">{{ __('Email') }}</label>
          <input 
            type="email" 
            id="email" 
            v-model="localPrefs.email"
            @change="savePreference('EMAIL', localPrefs.email)"
            class="form-control"
          />
        </div>
      </section>

      <!-- Display Preferences -->
      <section class="prefs-section">
        <h3>{{ __('Display') }}</h3>
        
        <div class="form-group">
          <label for="theme">{{ __('Theme') }}</label>
          <select 
            id="theme" 
            v-model="localPrefs.theme"
            @change="savePreference('USER_CSS_THEME', localPrefs.theme)"
            class="form-control"
          >
            <option value="light">Light</option>
            <option value="night">Night</option>
            <option value="compact">Compact</option>
          </select>
        </div>

        <div class="form-group checkbox-group">
          <label>
            <input 
              type="checkbox" 
              v-model="localPrefs.nightMode"
              @change="toggleNightMode"
            />
            {{ __('Enable night mode') }}
          </label>
        </div>

        <div class="form-group checkbox-group">
          <label>
            <input 
              type="checkbox" 
              v-model="localPrefs.combinedMode"
              @change="toggleCombinedMode"
            />
            {{ __('Combined display mode') }}
          </label>
        </div>
      </section>

      <!-- Feed Preferences -->
      <section class="prefs-section">
        <h3>{{ __('Feeds') }}</h3>
        
        <div class="form-group">
          <label for="updateInterval">{{ __('Update interval') }} ({{ __('minutes') }})</label>
          <input 
            type="number" 
            id="updateInterval" 
            v-model.number="localPrefs.updateInterval"
            @change="savePreference('_DEFAULT_UPDATE_INTERVAL', localPrefs.updateInterval)"
            min="1"
            max="1440"
            class="form-control"
          />
        </div>

        <div class="form-group checkbox-group">
          <label>
            <input 
              type="checkbox" 
              v-model="localPrefs.digestEnabled"
              @change="savePreference('DIGEST_ENABLE', localPrefs.digestEnabled ? 'true' : 'false')"
            />
            {{ __('Enable digest mode') }}
          </label>
        </div>
      </section>

      <!-- Article Preferences -->
      <section class="prefs-section">
        <h3>{{ __('Articles') }}</h3>
        
        <div class="form-group">
          <label for="articlesPerPage">{{ __('Articles per page') }}</label>
          <select 
            id="articlesPerPage" 
            v-model="localPrefs.articlesPerPage"
            @change="savePreference('_DEFAULT_ARTICLE_LIMIT', localPrefs.articlesPerPage)"
            class="form-control"
          >
            <option value="30">30</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="200">200</option>
          </select>
        </div>

        <div class="form-group checkbox-group">
          <label>
            <input 
              type="checkbox" 
              v-model="localPrefs.showHelp"
              @change="savePreference('SHOW_HELP_BUTTON', localPrefs.showHelp ? 'true' : 'false')"
            />
            {{ __('Show help button') }}
          </label>
        </div>
      </section>

      <!-- Save Button -->
      <div class="prefs-actions">
        <button @click="saveAll" class="btn btn-primary" :disabled="!hasChanges">
          {{ __('Save All Changes') }}
        </button>
        <button @click="resetToDefaults" class="btn btn-secondary">
          {{ __('Reset to Defaults') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useAppStore } from '../stores/app'

export default defineComponent({
  name: 'PreferencesPanel',
  setup() {
    const appStore = useAppStore()
    
    const localPrefs = ref({
      username: '',
      email: '',
      theme: 'light',
      nightMode: false,
      combinedMode: false,
      updateInterval: 15,
      digestEnabled: false,
      articlesPerPage: 30,
      showHelp: true
    })

    const originalPrefs = ref({})

    const hasChanges = computed(() => {
      return JSON.stringify(localPrefs.value) !== JSON.stringify(originalPrefs.value)
    })

    // Load preferences from backend
    const loadPreferences = async () => {
      try {
        const response = await fetch('backend.php?op=RPC&method=getPreferences')
        const data = await response.json()
        
        if (data && !data.error) {
          localPrefs.value = {
            username: data.username || '',
            email: data.email || '',
            theme: data.theme || 'light',
            nightMode: data.night_mode === 'true',
            combinedMode: data.combined_mode === 'true',
            updateInterval: parseInt(data.update_interval) || 15,
            digestEnabled: data.digest_enabled === 'true',
            articlesPerPage: parseInt(data.articles_per_page) || 30,
            showHelp: data.show_help !== 'false'
          }
          
          originalPrefs.value = { ...localPrefs.value }
        }
      } catch (error) {
        console.error('Failed to load preferences:', error)
      }
    }

    // Save single preference
    const savePreference = async (key, value) => {
      try {
        const response = await fetch('backend.php?op=RPC&method=setpref', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ key, value })
        })
        
        const result = await response.json()
        if (result && !result.error) {
          console.log(`Preference ${key} saved successfully`)
        }
      } catch (error) {
        console.error(`Failed to save preference ${key}:`, error)
      }
    }

    // Toggle night mode
    const toggleNightMode = () => {
      appStore.setNightMode(localPrefs.value.nightMode)
      savePreference('NIGHT_MODE', localPrefs.value.nightMode ? 'true' : 'false')
    }

    // Toggle combined mode
    const toggleCombinedMode = () => {
      appStore.setCombinedMode(localPrefs.value.combinedMode)
      savePreference('COMBINED_DISPLAY_MODE', localPrefs.value.combinedMode ? 'true' : 'false')
    }

    // Save all changes
    const saveAll = async () => {
      // Save all modified preferences
      const changes = []
      
      if (localPrefs.value.email !== originalPrefs.value.email) {
        changes.push(savePreference('EMAIL', localPrefs.value.email))
      }
      
      if (localPrefs.value.theme !== originalPrefs.value.theme) {
        changes.push(savePreference('USER_CSS_THEME', localPrefs.value.theme))
      }
      
      if (localPrefs.value.updateInterval !== originalPrefs.value.updateInterval) {
        changes.push(savePreference('_DEFAULT_UPDATE_INTERVAL', localPrefs.value.updateInterval))
      }
      
      if (localPrefs.value.articlesPerPage !== originalPrefs.value.articlesPerPage) {
        changes.push(savePreference('_DEFAULT_ARTICLE_LIMIT', localPrefs.value.articlesPerPage))
      }

      await Promise.all(changes)
      originalPrefs.value = { ...localPrefs.value }
    }

    // Reset to defaults
    const resetToDefaults = async () => {
      if (confirm('Are you sure you want to reset all preferences to defaults?')) {
        // Reset logic here
        await loadPreferences()
      }
    }

    // Translation helper (placeholder - integrate with actual i18n system)
    const __ = (msg) => msg

    onMounted(() => {
      loadPreferences()
    })

    return {
      localPrefs,
      hasChanges,
      savePreference,
      toggleNightMode,
      toggleCombinedMode,
      saveAll,
      resetToDefaults,
      __
    }
  }
})
</script>

<style scoped>
.preferences-panel {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

.prefs-header {
  margin-bottom: 1.5rem;
  border-bottom: 2px solid var(--border-color, #ddd);
  padding-bottom: 0.5rem;
}

.prefs-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--text-color, #333);
}

.prefs-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.prefs-section {
  background: var(--bg-card, #fff);
  border: 1px solid var(--border-color, #ddd);
  border-radius: 8px;
  padding: 1rem;
}

.prefs-section h3 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  color: var(--primary-color, #257aa7);
  border-bottom: 1px solid var(--border-color, #eee);
  padding-bottom: 0.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-color, #333);
}

.form-control {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color, #ccc);
  border-radius: 4px;
  font-size: 0.875rem;
  background: var(--bg-input, #fff);
  color: var(--text-color, #333);
}

.form-control:focus {
  outline: none;
  border-color: var(--primary-color, #257aa7);
  box-shadow: 0 0 0 2px rgba(37, 122, 167, 0.2);
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: normal;
  cursor: pointer;
}

.checkbox-group input[type="checkbox"] {
  width: auto;
}

.prefs-actions {
  display: flex;
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color, #ddd);
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.2s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--primary-color, #257aa7);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-color-dark, #1e628a);
}

.btn-secondary {
  background: var(--secondary-color, #6c757d);
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: var(--secondary-color-dark, #5a6268);
}
</style>
