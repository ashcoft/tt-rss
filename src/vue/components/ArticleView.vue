<template>
  <div class="article-view">
    <header class="article-header">
      <h2 class="article-title">{{ article.title }}</h2>
      <el-button
        :icon="Close"
        circle
        size="small"
        @click="$emit('close')"
        class="close-button"
      />
    </header>

    <div class="article-meta">
      <div class="meta-row">
        <span class="feed">
          <el-icon><Link /></el-icon>
          <a :href="article.link" target="_blank">{{ article.feed_title || 'Unknown feed' }}</a>
        </span>
        <span class="date">
          <el-icon><Calendar /></el-icon>
          {{ formatDate(article.updated) }}
        </span>
      </div>

      <div class="meta-row" v-if="article.author">
        <span class="author">
          <el-icon><User /></el-icon>
          {{ article.author }}
        </span>
      </div>

      <div class="labels" v-if="article.labels && article.labels.length > 0">
        <el-tag
          v-for="label in article.labels"
          :key="label.id"
          size="small"
          :style="{ backgroundColor: label.bg_color, color: label.fg_color }"
        >
          {{ label.caption }}
        </el-tag>
      </div>
    </div>

    <div class="article-actions">
      <el-button-group>
        <el-button
          :type="article.is_marked ? 'warning' : ''"
          @click="toggleStar"
          :title="article.is_marked ? 'Remove star' : 'Star'"
        >
          <el-icon><Star /></el-icon>
        </el-button>
        <el-button
          :type="article.is_published ? 'success' : ''"
          @click="togglePublish"
          :title="article.is_published ? 'Unpublish' : 'Publish'"
        >
          <el-icon><Share /></el-icon>
        </el-button>
        <el-button
          :type="article.is_read ? '' : 'primary'"
          @click="toggleRead"
        >
          <el-icon><Document /></el-icon>
        </el-button>
      </el-button-group>

      <el-button-group>
        <el-button @click="openArticle" title="Open original article">
          <el-icon><TopRight /></el-icon>
        </el-button>
        <el-button @click="openFeed" title="Open feed">
          <el-icon><Link /></el-icon>
        </el-button>
      </el-button-group>
    </div>

    <!-- Content is sanitized by DOMPurify before rendering -->
    <div class="article-content" v-html="sanitizedContent"></div>

    <div class="article-tags" v-if="article.tags && article.tags.length > 0">
      <h4>Tags</h4>
      <div class="tags-list">
        <el-tag
          v-for="tag in article.tags"
          :key="tag"
          size="small"
          class="tag-item"
        >
          {{ tag }}
        </el-tag>
      </div>
    </div>

    <div class="article-attachments" v-if="article.attachments && article.attachments.length > 0">
      <h4>Attachments</h4>
      <ul class="attachments-list">
        <li v-for="attachment in article.attachments" :key="attachment.id">
          <a :href="attachment.content_url" target="_blank">
            <el-icon><Paperclip /></el-icon>
            {{ attachment.title || 'Attachment' }}
          </a>
        </li>
      </ul>
    </div>

    <div class="article-comments" v-if="article.comments_link || article.comments_count > 0">
      <h4>Comments</h4>
      <a :href="article.comments_link" target="_blank" class="comments-link">
        <el-icon><ChatLineSquare /></el-icon>
        {{ article.comments_count }} comments
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable vue/no-v-html */
import { computed } from 'vue';
import {
  Close, Link, Calendar, User, Star, Share, Document,
  TopRight, Paperclip, ChatLineSquare
} from '@element-plus/icons-vue';
import type { Article } from '@/types';
import DOMPurify from 'dompurify';

interface Props {
  article: Article;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'update', field: string, value: boolean): void;
}>();

// Sanitize HTML content to prevent XSS
const sanitizedContent = computed(() => {
  return DOMPurify.sanitize(props.article.content ?? '', {
    ALLOWED_TAGS: ['p', 'br', 'b', 'i', 'em', 'strong', 'a', 'img', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class']
  });
});

// Methods
const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString();
};

const toggleStar = () => {
  emit('update', 'is_marked', !props.article.is_marked);
};

const togglePublish = () => {
  emit('update', 'is_published', !props.article.is_published);
};

const toggleRead = () => {
  emit('update', 'is_read', !props.article.is_read);
};

const openArticle = () => {
  window.open(props.article.link, '_blank');
};

const openFeed = () => {
  // Navigate to feed - would need router or emit to parent
  console.log('Open feed:', props.article.feed_id);
};
</script>

<style scoped>
.article-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1rem;
  overflow-y: auto;
}

.article-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.article-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  flex: 1;
  padding-right: 1rem;
}

.article-meta {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--ttrss-border, #ddd);
}

.meta-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: #666;
}

.meta-row span {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.meta-row a {
  color: #1976d2;
  text-decoration: none;
}

.meta-row a:hover {
  text-decoration: underline;
}

.labels {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.article-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.article-content {
  font-size: 0.9375rem;
  line-height: 1.6;
  color: #333;
  margin-bottom: 1.5rem;
}

.article-content :deep(img) {
  max-width: 100%;
  height: auto;
}

.article-content :deep(a) {
  color: #1976d2;
}

.article-content :deep(blockquote) {
  border-left: 3px solid #ddd;
  margin-left: 0;
  padding-left: 1rem;
  color: #666;
}

.article-tags,
.article-attachments,
.article-comments {
  margin-bottom: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--ttrss-border, #ddd);
}

.article-tags h4,
.article-attachments h4,
.article-comments h4 {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #666;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-item {
  cursor: pointer;
}

.attachments-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.attachments-list li {
  margin-bottom: 0.5rem;
}

.attachments-list a {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #1976d2;
  text-decoration: none;
}

.attachments-list a:hover {
  text-decoration: underline;
}

.comments-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #1976d2;
  text-decoration: none;
}

.comments-link:hover {
  text-decoration: underline;
}
</style>
