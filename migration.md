# Vue/Vuetify Migration Status

## Overview
This document tracks the migration from Dojo/Dijit to Vue 3 + Vuetify.

## Migration Status

### ✅ Completed Components

| Component | Vue File | Status | Notes |
|-----------|----------|--------|-------|
| Main App | `src/vue/App.vue` | Basic | Shell with feed tree, toolbar, headlines list, article view |
| Feed Tree | `src/vue/components/FeedTree.vue` | Basic | Displays feeds and categories |
| Toolbar | `src/vue/components/Toolbar.vue` | Basic | Refresh, catchup, search buttons |
| Headlines List | `src/vue/components/HeadlinesList.vue` | Basic | Displays headlines with actions |
| Article View | `src/vue/components/ArticleView.vue` | Basic | Article content display |

### 🚧 In Progress

| Component | Dojo File | Priority | Notes |
|-----------|-----------|----------|-------|
| App State Management | `js/App.js` | High | Need Vuex/Pinia store |
| API Integration | `js/Feeds.js` | High | Consolidate API calls |

### ❌ Not Started - Dojo/Dijit Files

#### Core Application
- [ ] `js/App.js` - Main application controller (complex)
- [ ] `js/tt-rss.js` - Core TT-RSS functionality
- [ ] `js/common.js` - Common utilities

#### Article & Headlines
- [ ] `js/Article.js` - Article operations (mark read/unread, star, publish)
- [ ] `js/Headlines.js` - Headlines view with actions
- [ ] `js/Feeds.js` - Feed operations

#### Common Components
- [ ] `js/CommonDialogs.js` - Dialog components (confirm, prompt, etc.)
- [ ] `js/CommonFilters.js` - Filter components
- [ ] `js/Toolbar.js` - Toolbar (more features than current Vue)

#### Feed Tree
- [ ] `js/FeedTree.js` - Feed tree with categories, drag-drop, quick actions

#### Preferences
- [ ] `js/prefs.js` - Main preferences page
- [ ] `js/PrefFeedTree.js` - Feed preferences
- [ ] `js/PrefFilterTree.js` - Filter preferences
- [ ] `js/PrefLabelTree.js` - Label management
- [ ] `js/PrefUsers.js` - User preferences
- [ ] `js/PrefHelpers.js` - Preferences helpers

#### Form Components
- [ ] `js/form/` - Form widgets (TextBox, NumberSpinner, CheckBox, etc.)

#### Other
- [ ] `js/SingleUseDialog.js` - Single-use dialogs
- [ ] `js/PluginHost.js` - Plugin system
- [ ] `js/FeedStoreModel.js` - Feed data model
- [ ] `js/PrefFeedStore.js` - Preferences feed store
- [ ] `js/PrefFilterStore.js` - Preferences filter store
- [ ] `js/utility.js` - Utility functions

## Migration Priorities

### Phase 1: Core Functionality (Current)
- [x] Basic app structure with Vue
- [x] Feed tree display
- [x] Headlines list display
- [x] Article view display
- [ ] **API integration layer** (critical missing piece)
- [ ] **State management** (Vuex or Pinia)
- [ ] User authentication/login

### Phase 2: Full Feature Parity
- [ ] All article actions (mark read/unread, star, publish, delete)
- [ ] Feed management (add, edit, delete feeds)
- [ ] Category management
- [ ] Labels management
- [ ] Search functionality
- [ ] Filter functionality
- [ ] Keyboard shortcuts
- [ ] Drag and drop support

### Phase 3: Preferences
- [ ] User preferences
- [ ] Feed preferences
- [ ] Filter rules
- [ ] Label management
- [ ] Plugin settings

### Phase 4: Polish
- [ ] Error handling
- [ ] Loading states
- [ ] Responsive design
- [ ] Theme support (light/dark)
- [ ] Accessibility improvements

## Missing Features (Current Vue Implementation)

### Critical
1. **API Integration** - No proper API client layer
2. **CSRF Token Handling** - Using hardcoded "auto"
3. **Authentication** - No login/logout flow
4. **Error Handling** - Basic error display only

### Important
1. **Keyboard Shortcuts** - j/k navigation, c/Shift+c, etc.
2. **Infinite Scroll** - Load more headlines
3. **Real-time Updates** - Polling for new articles
4. **Offline Support** - Service worker

### Nice to Have
1. **Article Actions** - Edit, delete, share
2. **Drag & Drop** - Reorder feeds, move to categories
3. **Article Preview** - Quick preview without full view
4. **Custom Themes** - User-defined themes

## File Comparison

### Dojo vs Vue Structure

| Dojo/Dijit | Vue Equivalent | Status |
|------------|---------------|--------|
| `dijit/form/*` | Vuetify form components | Available |
| `dijit/layout/*` | Vuetify layout | Available |
| `dijit/Tree` | Vuetify tree or custom | Need custom |
| `dijit/Dialog` | `v-dialog` | Available |
| `dijit/Menu` | `v-menu`, `v-list` | Available |
| `dijit/Toolbar` | `v-toolbar` | Available |

## Technical Debt

1. **Duplicate Code** - Both Dojo and Vue apps exist
2. **No Router** - Single page, no Vue Router
3. **Hardcoded API** - No proper API client
4. **CSS Conflicts** - Both Dojo and Vuetify CSS

## Recommendations

1. **Create API Client** - Centralize all backend API calls
2. **Add Pinia Store** - State management for feeds, headlines, articles
3. **Add Vue Router** - Enable multiple views/pages
4. **Complete Migration** - Eventually remove Dojo entirely
5. **Add Tests** - Unit and E2E tests for Vue components

## Getting Started

```bash
# Development
pnpm run dev

# Build for production
pnpm run build

# Lint
pnpm run lint:js
```
