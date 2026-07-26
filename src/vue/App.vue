<template>
  <v-app>
    <div class="ttrss-app">
      <header class="app-header">
        <h1>Tiny Tiny RSS</h1>
        <p class="subtitle">Vue 3 + Vuetify Migration</p>
      </header>

      <main class="app-main">
        <aside class="sidebar">
          <FeedTree
            :feeds="feedsStore.feeds"
            :categories="feedsStore.categories"
            @select="handleFeedSelect"
          />
        </aside>

        <section class="content">
          <Toolbar
            :feed-info="feedsStore.currentFeed"
            @action="handleToolbarAction"
          />

          <HeadlinesList
            :headlines="headlinesStore.headlines"
            :loading="headlinesStore.loading"
            @select="handleHeadlineSelect"
            @action="handleHeadlineAction"
          />
        </section>

        <aside class="article-panel" v-if="headlinesStore.selectedArticle">
          <ArticleView
            :article="headlinesStore.selectedArticle"
            @close="handleArticleClose"
          />
        </aside>
      </main>

      <footer class="app-footer">
        <span class="status">{{ statusMessage }}</span>
      </footer>
    </div>

    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      :timeout="3000"
    >
      {{ snackbarText }}
      <template #actions>
        <v-btn
          variant="text"
          @click="snackbar = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useFeedsStore } from './stores';
import { useHeadlinesStore } from './stores';
import FeedTree from './components/FeedTree.vue';
import Toolbar from './components/Toolbar.vue';
import HeadlinesList from './components/HeadlinesList.vue';
import ArticleView from './components/ArticleView.vue';

// Stores
const feedsStore = useFeedsStore();
const headlinesStore = useHeadlinesStore();

// UI State
const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref<'success' | 'error' | 'info' | 'warning'>('info');
const helpDialog = ref(false);

// Computed
const statusMessage = computed(() => {
  return `${headlinesStore.headlines.length} articles, ${headlinesStore.unreadCount} unread`;
});

// Helper function to show messages
const showMessage = (text: string, color: 'success' | 'error' | 'info' | 'warning' = 'info') => {
  snackbarText.value = text;
  snackbarColor.value = color;
  snackbar.value = true;
};

// Handlers
const handleFeedSelect = async (feedId: number | string, isCat: boolean) => {
  feedsStore.selectFeed(feedId, isCat);
  await headlinesStore.loadHeadlines(feedId, isCat);
};

const handleToolbarAction = (action: string) => {
  switch (action) {
    case 'refresh':
      void headlinesStore.loadHeadlines(
        feedsStore.currentFeedId,
        feedsStore.currentIsCat
      );
      break;
    case 'catchup':
      showMessage('Marking all as read...', 'info');
      break;
    case 'search':
      showMessage('Search functionality coming soon', 'info');
      break;
    default:
      showMessage(`Unknown action: ${action}`, 'warning');
  }
};

const handleHeadlineSelect = async (headline: typeof headlinesStore.headlines.value[0]) => {
  await headlinesStore.loadArticle(headline.id);
};

const handleHeadlineAction = (headline: typeof headlinesStore.headlines.value[0], action: string) => {
  switch (action) {
    case 'mark_read':
      void headlinesStore.markAsRead([headline.id]);
      break;
    case 'mark_unread':
      void headlinesStore.markAsUnread([headline.id]);
      break;
    case 'toggle_star':
      void headlinesStore.toggleStar(headline.id);
      break;
    case 'toggle_publish':
      void headlinesStore.togglePublish(headline.id);
      break;
    case 'delete':
      void headlinesStore.deleteArticle(headline.id).then(() => {
        showMessage('Article deleted', 'success');
      });
      break;
    default:
      showMessage(`Unknown action: ${action}`, 'warning');
  }
};

const handleArticleClose = () => {
  headlinesStore.clearSelection();
};

// Lifecycle
onMounted(async () => {
  await feedsStore.loadFeeds();
});
</script>

<style scoped>
.ttrss-app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--ttrss-bg, #f5f5f5);
}

.app-header {
  padding: 1rem;
  background: var(--ttrss-header-bg, #fff);
  border-bottom: 1px solid var(--ttrss-border, #ddd);
}

.app-header h1 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--ttrss-primary, #1976d2);
}

.app-header .subtitle {
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
  color: #666;
}

.app-main {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 250px;
  overflow-y: auto;
  background: var(--ttrss-sidebar-bg, #fff);
  border-right: 1px solid var(--ttrss-border, #ddd);
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.article-panel {
  width: 400px;
  overflow-y: auto;
  background: var(--ttrss-article-bg, #fff);
  border-left: 1px solid var(--ttrss-border, #ddd);
}

.app-footer {
  padding: 0.5rem 1rem;
  background: var(--ttrss-footer-bg, #f0f0f0);
  border-top: 1px solid var(--ttrss-border, #ddd);
  font-size: 0.875rem;
}

.status {
  color: #666;
}
</style>
