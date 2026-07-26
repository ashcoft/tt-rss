/**
 * Headlines Store - Pinia store for headlines and articles management
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '../api/client';
import { useFeedsStore } from './feeds';

export interface Headline {
  id: number;
  guid: string;
  title: string;
  link: string;
  content: string;
  excerpt: string;
  updated: number;
  is_starred: boolean;
  is_read: boolean;
  is_published: boolean;
  tags: string[];
  feed_id: number;
  feed_title: string;
  comments_count: number;
  comments_link: string;
  author: string;
  score: number;
  note: string;
}

export interface Article {
  id: number;
  guid: string;
  title: string;
  link: string;
  content: string;
  excerpt: string;
  updated: number;
  is_starred: boolean;
  is_read: boolean;
  is_published: boolean;
  tags: string[];
  feed_id: number;
  feed_title: string;
  comments_count: number;
  author: string;
  note: string;
}

export const useHeadlinesStore = defineStore('headlines', () => {
  // State
  const headlines = ref<Headline[]>([]);
  const selectedArticle = ref<Article | null>(null);
  const loading = ref(false);
  const loadingMore = ref(false);
  const error = ref<string | null>(null);
  const viewMode = ref<'adaptive' | 'all_articles' | 'unread'>('adaptive');
  const searchQuery = ref('');
  const hasMore = ref(false);
  const skip = ref(0);
  const limit = 30;

  // Getters
  const unreadCount = computed(() => {
    return headlines.value.filter(h => !h.is_read).length;
  });

  const selectedHeadline = computed(() => {
    return headlines.value.find(h => h.id === selectedArticle.value?.id);
  });

  // Actions
  async function loadHeadlines(feedId: number | string, isCat: boolean = false) {
    loading.value = true;
    error.value = null;
    skip.value = 0;

    try {
      const response = await api.getHeadlines(feedId, {
        isCat,
        viewMode: viewMode.value,
        limit,
        skip: 0,
        search: searchQuery.value,
      });

      if (response.status === 0) {
        headlines.value = response.content.headlines || [];
        hasMore.value = headlines.value.length >= limit;
      } else {
        error.value = 'Failed to load headlines';
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error';
      console.error('Failed to load headlines:', err);
    } finally {
      loading.value = false;
    }
  }

  async function loadMore(feedId: number | string, isCat: boolean = false) {
    if (loadingMore.value || !hasMore.value) return;

    loadingMore.value = true;
    skip.value += limit;

    try {
      const response = await api.getHeadlines(feedId, {
        isCat,
        viewMode: viewMode.value,
        limit,
        skip: skip.value,
        search: searchQuery.value,
      });

      if (response.status === 0) {
        const newHeadlines = response.content.headlines || [];
        headlines.value.push(...newHeadlines);
        hasMore.value = newHeadlines.length >= limit;
      }
    } catch (err) {
      console.error('Failed to load more headlines:', err);
      skip.value -= limit; // Revert skip on error
    } finally {
      loadingMore.value = false;
    }
  }

  async function loadArticle(articleId: number) {
    error.value = null;

    try {
      const response = await api.getArticle(articleId);

      if (response.status === 0 && response.content) {
        selectedArticle.value = response.content;
        
        // Mark as read in headlines list
        const headline = headlines.value.find(h => h.id === articleId);
        if (headline && !headline.is_read) {
          headline.is_read = true;
          
          // Update feed unread count
          const feedsStore = useFeedsStore();
          feedsStore.updateFeedUnread(headline.feed_id, -1);
        }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error';
      console.error('Failed to load article:', err);
    }
  }

  async function markAsRead(articleIds: number[]) {
    try {
      await api.catchupArticles(articleIds, 0);
      
      // Update local state
      articleIds.forEach(id => {
        const headline = headlines.value.find(h => h.id === id);
        if (headline) {
          headline.is_read = true;
        }
      });
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  }

  async function markAsUnread(articleIds: number[]) {
    try {
      await api.catchupArticles(articleIds, 1);
      
      articleIds.forEach(id => {
        const headline = headlines.value.find(h => h.id === id);
        if (headline) {
          headline.is_read = false;
        }
      });
    } catch (err) {
      console.error('Failed to mark as unread:', err);
    }
  }

  async function toggleStar(articleId: number) {
    const headline = headlines.value.find(h => h.id === articleId);
    if (!headline) return;

    const newValue = !headline.is_starred;

    try {
      await api.markArticles([articleId], newValue ? 2 : 0);
      headline.is_starred = newValue;
      
      if (selectedArticle.value?.id === articleId) {
        selectedArticle.value.is_starred = newValue;
      }
    } catch (err) {
      console.error('Failed to toggle star:', err);
    }
  }

  async function togglePublish(articleId: number) {
    const headline = headlines.value.find(h => h.id === articleId);
    if (!headline) return;

    const newValue = !headline.is_published;

    try {
      await api.publishArticles([articleId], newValue ? 2 : 0);
      headline.is_published = newValue;
      
      if (selectedArticle.value?.id === articleId) {
        selectedArticle.value.is_published = newValue;
      }
    } catch (err) {
      console.error('Failed to toggle publish:', err);
    }
  }

  async function deleteArticle(articleId: number) {
    try {
      await api.deleteArticles([articleId]);
      
      // Remove from headlines
      const index = headlines.value.findIndex(h => h.id === articleId);
      if (index > -1) {
        headlines.value.splice(index, 1);
      }
      
      // Clear selected if same article
      if (selectedArticle.value?.id === articleId) {
        selectedArticle.value = null;
      }
    } catch (err) {
      console.error('Failed to delete article:', err);
      throw err;
    }
  }

  async function updateNote(articleId: number, note: string) {
    try {
      await api.updateArticleNote(articleId, note);
      
      const headline = headlines.value.find(h => h.id === articleId);
      if (headline) {
        headline.note = note;
      }
      
      if (selectedArticle.value?.id === articleId) {
        selectedArticle.value.note = note;
      }
    } catch (err) {
      console.error('Failed to update note:', err);
      throw err;
    }
  }

  function setViewMode(mode: 'adaptive' | 'all_articles' | 'unread') {
    viewMode.value = mode;
  }

  function setSearchQuery(query: string) {
    searchQuery.value = query;
  }

  function clearSelection() {
    selectedArticle.value = null;
  }

  function reset() {
    headlines.value = [];
    selectedArticle.value = null;
    error.value = null;
    searchQuery.value = '';
    hasMore.value = false;
    skip.value = 0;
  }

  return {
    // State
    headlines,
    selectedArticle,
    loading,
    loadingMore,
    error,
    viewMode,
    searchQuery,
    hasMore,
    
    // Getters
    unreadCount,
    selectedHeadline,
    
    // Actions
    loadHeadlines,
    loadMore,
    loadArticle,
    markAsRead,
    markAsUnread,
    toggleStar,
    togglePublish,
    deleteArticle,
    updateNote,
    setViewMode,
    setSearchQuery,
    clearSelection,
    reset,
  };
});
