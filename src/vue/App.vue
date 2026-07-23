<template>
  <el-config-provider :locale="locale">
    <div class="ttrss-app">
      <header class="app-header">
        <h1>Tiny Tiny RSS</h1>
        <p class="subtitle">Vue 3 + Element Plus Migration</p>
      </header>

      <main class="app-main">
        <aside class="sidebar">
          <FeedTree
            :feeds="feeds"
            :categories="categories"
            @select="handleFeedSelect"
          />
        </aside>

        <section class="content">
          <Toolbar
            :feed-info="currentFeedInfo"
            @action="handleToolbarAction"
          />

          <HeadlinesList
            :headlines="headlines"
            :loading="loadingHeadlines"
            @select="handleHeadlineSelect"
            @action="handleHeadlineAction"
          />
        </section>

        <aside class="article-panel" v-if="selectedArticle">
          <ArticleView
            :article="selectedArticle"
            @close="selectedArticle = null"
          />
        </aside>
      </main>

      <footer class="app-footer">
        <span class="status">{{ statusMessage }}</span>
      </footer>
    </div>
  </el-config-provider>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import type { Feed, Category, Headline, Article } from '@/types';
import { FeedTree } from '@/components/FeedTree.vue';
import { Toolbar } from '@/components/Toolbar.vue';
import { HeadlinesList } from '@/components/HeadlinesList.vue';
import { ArticleView } from '@/components/ArticleView.vue';

// Locale for Element Plus
import en from 'element-plus/es/locale/lang/en';

// State
const feeds = ref<Feed[]>([]);
const categories = ref<Category[]>([]);
const headlines = ref<Headline[]>([]);
const selectedArticle = ref<Article | null>(null);
const currentFeedId = ref<number | string>(0);
const currentIsCat = ref(false);
const loadingHeadlines = ref(false);

// Locale
const locale = en;

// Computed
const currentFeedInfo = computed(() => {
  if (typeof currentFeedId.value === 'number' && currentFeedId.value > 0) {
    const feed = feeds.value.find(f => f.id === currentFeedId.value);
    if (feed) return feed;
  }
  return null;
});
const statusMessage = computed(() => {
  const unread = headlines.value.filter(h => !h.is_read).length;
  return `${headlines.value.length} articles, ${unread} unread`;
});

// API Functions
const loadFeeds = async () => {
  try {
    const response = await fetch('/backend.php?op=feeds&method=getTree&csrf_token=auto');
    const data = await response.json();
    const statusHandlers: { [key: number]: (content: unknown) => void } = {
      0: content => {
        feeds.value = (content as { feeds?: Feed[] }).feeds || [];
        categories.value = (content as { categories?: Category[] }).categories || [];
      }
    };
    statusHandlers[data.status]?.(data.content);
  } catch (error) {
    console.error('Failed to load feeds:', error);
    ElMessage.error('Failed to load feeds');
  }
};

/**
 * Loads the headlines for the current feed.
 * Fetches headlines from the backend and updates the headlines state.
 *
 * @returns {Promise<void>}
 */
const loadHeadlines = async () => {
  loadingHeadlines.value = true;
  try {
    const params = new URLSearchParams({
      op: 'feeds',
      method: 'getHeadlines',
      feed_id: String(currentFeedId.value),
      is_cat: currentIsCat.value ? '1' : '0',
      view_mode: 'adaptive',
      csrf_token: 'auto'
    });

    const response = await fetch(`/backend.php?${params.toString()}`);
    const data = await response.json();
    const statusHandlers: { [key: number]: (content: unknown) => void } = {
      0: content => {
        headlines.value = (content as { headlines?: Headline[] }).headlines || [];
      }
    };
    statusHandlers[data.status]?.(data.content);
  } catch (error) {
    console.error('Failed to load headlines:', error);
    ElMessage.error('Failed to load headlines');
  } finally {
    loadingHeadlines.value = false;
  }
};

/**
 * Loads the article with the given ID.
 *
 * @param {number} articleId - ID of the article to load.
 * @returns {Promise<void>}
 */
const loadArticle = async (articleId: number) => {
  try {
    const params = new URLSearchParams({
      op: 'article',
      method: 'view',
      article_id: String(articleId),
      csrf_token: 'auto'
    });

    const response = await fetch(`/backend.php?${params.toString()}`);
    const data = await response.json();
    if (data.status === 0 && data.content) {
      selectedArticle.value = data.content;
    }
  } catch (error) {
    console.error('Failed to load article:', error);
    ElMessage.error('Failed to load article');
  }
};

/**
 * Marks an article as read or unread.
 *
 * @param {number} articleId - ID of the article.
 * @param {boolean} isRead - True to mark as read, false to mark as unread.
 * @returns {Promise<void>}
 */
const markAsRead = async (articleId: number, isRead: boolean) => {
  const headline = headlines.value.find(h => h.id === articleId);
  if (headline) {
    headline.is_read = isRead;
  }
};

/**
 * Toggles the starred state of an article.
 *
 * @param {number} articleId - ID of the article.
 * @param {boolean} starred - True to star the article, false to unstar.
 * @returns {Promise<void>}
 */
const toggleStar = (articleId: number, starred: boolean) => {
  const headline = headlines.value.find(h => h.id === articleId);
  if (headline) {
    headline.is_marked = starred;
  }
};

/**
 * Toggles the published state of an article.
 *
 * @param {number} articleId - ID of the article.
 * @param {boolean} published - True to publish the article, false to unpublish.
 * @returns {Promise<void>}
 */
const togglePublish = (articleId: number, published: boolean) => {
  const headline = headlines.value.find(h => h.id === articleId);
  if (headline) {
    headline.is_published = published;
  }
  return Promise.resolve();
};

/**
 * Displays an informational message about catchup functionality.
 *
 * @returns {void}
 */
const catchupCurrent = () => {
  ElMessage.info('Catchup functionality coming soon');
};

// Handlers
const handleFeedSelect = async (feedId: number | string, isCat: boolean) => {
  currentFeedId.value = feedId;
  currentIsCat.value = isCat;
  await loadHeadlines();
};

/**
 * Handles toolbar actions based on the specified action string.
 *
 * @param {string} action - The action to perform.
 * @returns {void}
 */
const handleToolbarAction = (action: string) => {
  switch (action) {
    case 'refresh':
      void loadHeadlines();
      break;
    case 'catchup':
      catchupCurrent();
      break;
    case 'search':
      ElMessage.info('Search functionality coming soon');
      break;
    default:
      ElMessage.warning(`Unknown action: ${action}`);
  }
};

/**
 * Handles selection of a headline by loading the associated article.
 *
 * @param {Headline} headline - The selected headline object.
 * @returns {Promise<void>}
 */
const handleHeadlineSelect = async (headline: Headline) => {
  await loadArticle(headline.id);
};

/**
 * Handles various actions on a headline such as marking read/unread, starring, or publishing.
 *
 * @param {Headline} headline - The headline object to act on.
 * @param {string} action - The action to perform on the headline.
 * @returns {void}
 */
const handleHeadlineAction = (headline: Headline, action: string) => {
  switch (action) {
    case 'mark_read':
      void markAsRead(headline.id, true);
      break;
    case 'mark_unread':
      void markAsRead(headline.id, false);
      break;
    case 'toggle_star':
      void toggleStar(headline.id, !headline.is_marked);
      break;
    case 'toggle_publish':
      void togglePublish(headline.id, !headline.is_published);
      break;
    default:
      ElMessage.warning(`Unknown action: ${action}`);
  }
};

// Lifecycle
onMounted(() => {
  void loadFeeds();
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
