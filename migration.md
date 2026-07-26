# Vue/Vuetify Migration Status

## Overview
This document tracks the migration from Dojo/Dijit to Vue 3 + Vuetify.

## Migration Status

### ✅ Completed Components

| Component | Vue File | Status | Notes |
|-----------|----------|--------|-------|
| Main App | `src/vue/App.vue` | ✅ Complete | Shell with feed tree, toolbar, headlines list, article view |
| Feed Tree | `src/vue/components/FeedTree.vue` | ✅ Complete | Displays feeds and categories |
| Toolbar | `src/vue/components/Toolbar.vue` | ✅ Complete | Refresh, catchup, search buttons |
| Headlines List | `src/vue/components/HeadlinesList.vue` | ✅ Complete | Displays headlines with actions |
| Article View | `src/vue/components/ArticleView.vue` | ✅ Complete | Article content display |
| API Client | `src/vue/api/client.ts` | ✅ Complete | Full TT-RSS API integration |
| Pinia Stores | `src/vue/stores/` | ✅ Complete | Feeds and headlines stores |
| Keyboard Shortcuts | `src/vue/composables/useKeyboard.ts` | ✅ Complete | j/k, o, r, s, f, u, /, ? |
| Infinite Scroll | `src/vue/composables/useInfiniteScroll.ts` | ✅ Complete | Load more on scroll |

### 🚧 In Progress

| Component | Dojo File | Priority | Notes |
|-----------|-----------|----------|-------|
| Authentication Flow | `js/App.js` | High | Login/logout with proper session |
| Real-time Updates | - | Medium | Polling for new articles |

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

### Phase 1: Core Functionality ✅ COMPLETE
- [x] Basic app structure with Vue
- [x] Feed tree display
- [x] Headlines list display
- [x] Article view display
- [x] **API integration layer** - Full TT-RSS API client
- [x] **State management** - Pinia stores for feeds and headlines
- [x] Keyboard shortcuts
- [x] Infinite scroll composable

### Phase 2: Full Feature Parity
- [ ] All article actions (mark read/unread, star, publish, delete)
- [ ] Feed management (add, edit, delete feeds)
- [ ] Category management
- [ ] Labels management
- [ ] Search functionality
- [ ] Filter functionality
- [ ] User authentication/login
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
- [ ] Real-time updates (polling)
- [ ] Offline support (service worker)

## Current Features (Vue)

### ✅ Implemented
- Feed tree navigation
- Headlines list with actions
- Article view with content
- Mark read/unread
- Toggle star
- Toggle publish
- Delete articles
- Update article notes
- Feed loading
- Headlines loading
- Infinite scroll (composable ready)
- Keyboard shortcuts (composable ready)

### ❌ Not Implemented
- User authentication
- Real-time article polling
- Drag & drop feeds
- Full preferences panel
- Plugin system
- Search UI
- Filter UI

## File Structure

```
src/vue/
├── api/
│   └── client.ts          # TT-RSS API client
├── components/
│   ├── ArticleView.vue    # Article content display
│   ├── FeedTree.vue       # Feed/category navigation
│   ├── HeadlinesList.vue  # Headlines with actions
│   └── Toolbar.vue        # Action toolbar
├── composables/
│   ├── useInfiniteScroll.ts  # Infinite scroll
│   └── useKeyboard.ts        # Keyboard shortcuts
├── stores/
│   ├── feeds.ts           # Feed/category state
│   ├── headlines.ts       # Headlines/articles state
│   └── index.ts          # Store exports
├── types/
│   └── index.ts           # TypeScript types
├── App.vue                # Main application
└── main.ts               # Entry point with Pinia/Vuetify
```

## Technical Debt

1. **Duplicate Code** - Both Dojo and Vue apps exist
2. **No Router** - Single page, no Vue Router
3. **No Auth Flow** - Login/logout not implemented
4. **CSS Conflicts** - Both Dojo and Vuetify CSS

## Getting Started

```bash
# Install dependencies
pnpm install

# Development
pnpm run dev

# Build for production
pnpm run build

# Lint
pnpm run lint:js

# Type check
pnpm run type-check 2>/dev/null || echo "Add to package.json"
```
