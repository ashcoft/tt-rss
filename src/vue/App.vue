<script setup lang="ts">
import { ref, onMounted } from 'vue';
import ArticleView from './components/ArticleView.vue';

const articles = ref<Array<{
  id: number;
  title: string;
  content: string;
  link: string;
  feed: string;
  unread: boolean;
}>>([]);
const selectedArticle = ref<number | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

// Async wrapper for loadArticles to satisfy linting
async function loadArticles(): Promise<void> {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await fetch('/api/articles', {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    articles.value = data.articles || [];
  } catch (err) {
    console.error('Failed to load articles:', err);
    error.value = 'Failed to load articles. Please try again.';
  } finally {
    loading.value = false;
  }
}

// Async wrapper for markAsRead to satisfy linting
async function markAsRead(articleId: number): Promise<void> {
  try {
    const response = await fetch(`/api/articles/${articleId}/read`, {
      method: 'POST',
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const article = articles.value.find(a => a.id === articleId);
    if (article) {
      article.unread = false;
    }
  } catch (err) {
    console.error('Failed to mark article as read:', err);
  }
}

// Async wrapper for markAllAsRead to satisfy linting
async function markAllAsRead(): Promise<void> {
  try {
    const response = await fetch('/api/articles/mark-all-read', {
      method: 'POST',
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    articles.value.forEach(article => {
      article.unread = false;
    });
  } catch (err) {
    console.error('Failed to mark all as read:', err);
  }
}

// Async wrapper for toggleStar to satisfy linting
async function toggleStar(articleId: number): Promise<void> {
  try {
    const response = await fetch(`/api/articles/${articleId}/star`, {
      method: 'POST',
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (err) {
    console.error('Failed to toggle star:', err);
  }
}

// Async wrapper for togglePublish to satisfy linting
async function togglePublish(articleId: number): Promise<void> {
  try {
    const response = await fetch(`/api/articles/${articleId}/publish`, {
      method: 'POST',
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (err) {
    console.error('Failed to toggle publish:', err);
  }
}

// Async wrapper for loadHeadlines to satisfy linting
async function loadHeadlines(): Promise<void> {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await fetch('/api/headlines', {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    articles.value = data.articles || [];
  } catch (err) {
    console.error('Failed to load headlines:', err);
    error.value = 'Failed to load headlines. Please try again.';
  } finally {
    loading.value = false;
  }
}

// Async wrapper for fetchFeeds to satisfy linting
async function fetchFeeds(): Promise<void> {
  try {
    const response = await fetch('/api/feeds', {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    // Handle feeds data
    console.log('Feeds loaded:', data);
  } catch (err) {
    console.error('Failed to load feeds:', err);
  }
}

// Async wrapper for fetchLabels to satisfy linting
async function fetchLabels(): Promise<void> {
  try {
    const response = await fetch('/api/labels', {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    // Handle labels data
    console.log('Labels loaded:', data);
  } catch (err) {
    console.error('Failed to load labels:', err);
  }
}

// Sync wrapper for toolbar actions (void operator for fire-and-forget)
function handleToolbarAction(action: string): void {
  switch (action) {
    case 'refresh':
      void loadHeadlines(); // Fire-and-forget with void
      break;
    case 'mark-all-read':
      void markAllAsRead(); // Fire-and-forget with void
      break;
  }
}

// Sync wrapper for headline actions (void operator for fire-and-forget)
function handleHeadlineAction(action: string, articleId: number): void {
  switch (action) {
    case 'read':
      void markAsRead(articleId); // Fire-and-forget with void
      break;
    case 'star':
      void toggleStar(articleId); // Fire-and-forget with void
      break;
    case 'publish':
      void togglePublish(articleId); // Fire-and-forget with void
      break;
  }
}

function selectArticle(articleId: number): void {
  selectedArticle.value = articleId;
  void markAsRead(articleId); // Fire-and-forget with void
}

// Fix: Use proper .toString() for URLSearchParams template literal
function searchArticles(query: string): void {
  const params = new URLSearchParams({ q: query });
  
  void (async () => {
    try {
      const response = await fetch(`/api/search?${params.toString()}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      articles.value = data.articles || [];
    } catch (err) {
      console.error('Failed to search articles:', err);
      error.value = 'Search failed. Please try again.';
    }
  })();
}

// Fix: Use async/await in onMounted
onMounted(async () => {
  await Promise.all([
    loadArticles(),
    fetchFeeds(),
    fetchLabels()
  ]);
});

defineExpose({
  articles,
  selectedArticle,
  loading,
  error,
  selectArticle,
  markAsRead,
  markAllAsRead,
  toggleStar,
  togglePublish,
  loadHeadlines,
  handleToolbarAction,
  handleHeadlineAction,
  searchArticles
});
</script>

<template>
  <div class="vue-app">
    <header class="app-header">
      <h1>Tiny Tiny RSS</h1>
      <nav class="app-nav">
        <button @click="loadArticles">Refresh</button>
        <button @click="markAllAsRead">Mark All Read</button>
      </nav>
    </header>
    
    <main class="app-main">
      <div v-if="loading" class="loading">Loading...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <template v-else>
        <div class="article-list">
          <article
            v-for="article in articles"
            :key="article.id"
            :class="{ unread: article.unread }"
            @click="selectArticle(article.id)"
          >
            <h3>{{ article.title }}</h3>
            <p class="feed-name">{{ article.feed }}</p>
          </article>
        </div>
        <ArticleView
          v-if="selectedArticle"
          :article-id="selectedArticle"
        />
      </template>
    </main>
  </div>
</template>

<style scoped>
.vue-app {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--header-bg, #f5f5f5);
  border-bottom: 1px solid #ddd;
}

.app-header h1 {
  margin: 0;
  font-size: 1.5rem;
}

.app-nav {
  display: flex;
  gap: 0.5rem;
}

.app-nav button {
  padding: 0.5rem 1rem;
  border: 1px solid #ccc;
  background: white;
  cursor: pointer;
}

.app-nav button:hover {
  background: #eee;
}

.app-main {
  flex: 1;
  overflow: auto;
  padding: 1rem;
}

.loading,
.error {
  text-align: center;
  padding: 2rem;
}

.error {
  color: #d32f2f;
}

.article-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.article-list article {
  padding: 1rem;
  border: 1px solid #ddd;
  cursor: pointer;
  transition: background 0.2s;
}

.article-list article:hover {
  background: #f9f9f9;
}

.article-list article.unread {
  font-weight: bold;
  background: #fffde7;
}

.article-list h3 {
  margin: 0 0 0.5rem 0;
}

.feed-name {
  color: #666;
  font-size: 0.875rem;
  margin: 0;
}
</style>
