import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    // User state
    user: null,
    uid: null,
    accessLevel: 0,
    
    // Feed state
    feeds: [],
    labels: [],
    
    // UI state
    unreadCount: 0,
    globalUnread: -1,
    nightMode: false,
    combinedMode: false,
    expandedMode: false,
    widescreenMode: false,
    
    // Loading state
    isLoading: false,
    loadingProgress: 0,
    
    // Settings
    hotkeys: {},
    preferences: {},
    
    // Runtime info
    seq: 0
  }),
  
  getters: {
    isLoggedIn: (state) => !!state.user,
    totalFeeds: (state) => state.feeds.length,
    hasUnread: (state) => state.unreadCount > 0,
    
    // Get feed by ID
    getFeedById: (state) => (id) => {
      return state.feeds.find(feed => feed.id === id)
    },
    
    // Get label by ID
    getLabelById: (state) => (id) => {
      return state.labels.find(label => label.id === id)
    }
  },
  
  actions: {
    // Initialize app with user data
    initialize(userData) {
      this.user = userData.username
      this.uid = userData.uid
      this.accessLevel = userData.access_level
      this.hotkeys = userData.hotkeys || {}
      this.preferences = userData.preferences || {}
    },
    
    // Fetch feeds from backend
    async fetchFeeds() {
      try {
        const response = await fetch('backend.php?op=RPC&method=getFeeds')
        const data = await response.json()
        if (data && !data.error) {
          this.feeds = data
        }
      } catch (error) {
        console.error('Failed to fetch feeds:', error)
        throw error
      }
    },
    
    // Fetch labels from backend
    async fetchLabels() {
      try {
        const response = await fetch('backend.php?op=RPC&method=getLabels')
        const data = await response.json()
        if (data && !data.error) {
          this.labels = data
        }
      } catch (error) {
        console.error('Failed to fetch labels:', error)
        throw error
      }
    },
    
    // Update unread count
    updateUnreadCount(count) {
      this.unreadCount = count
    },
    
    // Set night mode
    async setNightMode(enabled) {
      this.nightMode = enabled
      try {
        await fetch('backend.php?op=RPC&method=setpref', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            key: 'NIGHT_MODE', 
            value: enabled ? 'true' : 'false' 
          })
        })
      } catch (error) {
        console.error('Failed to set night mode preference:', error)
      }
    },
    
    // Set combined display mode
    async setCombinedMode(enabled) {
      this.combinedMode = enabled
      try {
        await fetch('backend.php?op=RPC&method=setpref', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            key: 'COMBINED_DISPLAY_MODE', 
            value: enabled ? 'true' : 'false' 
          })
        })
      } catch (error) {
        console.error('Failed to set combined mode preference:', error)
      }
    },
    
    // Set expanded mode
    async setExpandedMode(enabled) {
      this.expandedMode = enabled
      try {
        await fetch('backend.php?op=RPC&method=setpref', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            key: 'CDM_EXPANDED', 
            value: enabled ? 'true' : 'false' 
          })
        })
      } catch (error) {
        console.error('Failed to set expanded mode preference:', error)
      }
    },
    
    // Update loading progress
    setLoadingProgress(progress) {
      this.loadingProgress += progress
      if (this.loadingProgress >= 90) {
        this.isLoading = false
      }
    },
    
    // Start loading
    startLoading() {
      this.isLoading = true
      this.loadingProgress = 0
    },
    
    // Stop loading
    stopLoading() {
      this.isLoading = false
      this.loadingProgress = 100
    },
    
    // Increment RPC sequence
    nextSeq() {
      this.seq += 1
      return this.seq
    },
    
    // Handle RPC response
    handleRpcResponse(reply) {
      if (!reply) return false
      
      const { error, seq, message, counters, 'runtime-info': runtimeInfo } = reply
      
      // Check for errors
      if (error && error.code) {
        console.error('RPC error:', error)
        return false
      }
      
      // Check sequence mismatch
      if (seq && this.seq !== seq) {
        console.warn('Sequence mismatch:', seq, '!=', this.seq)
        return false
      }
      
      // Update counters if present
      if (counters) {
        this.updateUnreadCount(counters.unread || 0)
        this.globalUnread = counters.global_unread ?? this.globalUnread
      }
      
      // Update runtime info if present
      if (runtimeInfo) {
        // Process runtime info updates
      }
      
      return true
    }
  }
})
