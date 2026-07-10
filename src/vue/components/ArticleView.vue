<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import DOMPurify from 'dompurify';

const props = defineProps<{
  articleId: number;
}>();

const article = ref<{
  id: number;
  title: string;
  content: string;
  link: string;
  feed: string;
  author: string;
  date: string;
} | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

// Sanitize HTML content client-side using DOMPurify to prevent XSS
// Note: Content is also sanitized server-side via Sanitizer::sanitize()
// in API.php and Feeds.php, but we add client-side sanitization as
// an additional security layer.
const sanitizedContent = computed(() => {
  if (!article.value?.content) return '';
  return DOMPurify.sanitize(article.value.content, {
    ALLOWED_TAGS: ['p', 'br', 'b', 'i', 'em', 'strong', 'a', 'img', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class']
  });
});

async function loadArticle(): Promise<void> {
  loading.value = true;
  error.value = null;

  try {
    const response = await fetch(`/api/articles/${props.articleId}`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    article.value = data.article || null;
  } catch (err) {
    console.error('Failed to load article:', err);
    error.value = 'Failed to load article.';
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await loadArticle();
});

defineExpose({
  article,
  loading,
  error,
  loadArticle
});
</script>

<template>
  <div class="article-view">
    <div v-if="loading" class="loading">Loading article...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <article v-else-if="article" class="article-content">
      <header class="article-header">
        <h1>{{ article.title }}</h1>
        <div class="article-meta">
          <span class="feed">{{ article.feed }}</span>
          <span v-if="article.author" class="author">by {{ article.author }}</span>
          <time :datetime="article.date">{{ article.date }}</time>
        </div>
      </header>
      
      <!-- Content is sanitized client-side using DOMPurify for XSS prevention -->
      <div class="article-body" v-html="sanitizedContent"></div>
      
      <footer class="article-footer">
        <a :href="article.link" target="_blank" rel="noopener noreferrer">
          View Original
        </a>
      </footer>
    </article>
  </div>
</template>

<style scoped>
.article-view {
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
}

.loading,
.error {
  padding: 2rem;
  text-align: center;
}

.error {
  color: #d32f2f;
}

.article-header {
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.article-header h1 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
}

.article-meta {
  display: flex;
  gap: 1rem;
  color: #666;
  font-size: 0.875rem;
}

.article-meta span::before {
  content: '';
}

.article-body {
  padding: 1rem;
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.article-footer {
  padding: 1rem;
  border-top: 1px solid #eee;
}

.article-footer a {
  color: #1976d2;
  text-decoration: none;
}

.article-footer a:hover {
  text-decoration: underline;
}
</style>
