/**
 * Feeds Store - Pinia store for feed and category management
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '../api/client';

export interface Feed {
  id: number;
  title: string;
  unread: number;
  cat_id: number | null;
  feed_url: string;
  site_url: string;
}

export interface Category {
  id: number;
  title: string;
  unread: number;
  parent_id: number | null;
}

export const useFeedsStore = defineStore('feeds', () => {
  // State
  const feeds = ref<Feed[]>([]);
  const categories = ref<Category[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const currentFeedId = ref<number | string>(0);
  const currentIsCat = ref(false);

  // Getters
  const feedsByCategory = computed(() => {
    const grouped: Record<string, Feed[]> = {
      uncategorized: [],
    };
    
    for (const feed of feeds.value) {
      const catId = feed.cat_id ?? 'uncategorized';
      const catKey = String(catId);
      if (!grouped[catKey]) {
        grouped[catKey] = [];
      }
      grouped[catKey].push(feed);
    }
    
    return grouped;
  });

  const totalUnread = computed(() => {
    let total = categories.value.reduce((sum, cat) => sum + cat.unread, 0);
    total += feeds.value.reduce((sum, feed) => sum + feed.unread, 0);
    return total;
  });

  const currentFeed = computed(() => {
    if (typeof currentFeedId.value === 'number' && currentFeedId.value > 0) {
      if (currentIsCat.value) {
        return categories.value.find(c => c.id === currentFeedId.value);
      }
      return feeds.value.find(f => f.id === currentFeedId.value);
    }
    return null;
  });

  // Actions
  async function loadFeeds() {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await api.getFeedTree();
      
      if (response.status === 0 && response.content) {
        const content = response.content as { feeds?: Feed[]; categories?: Category[] };
        feeds.value = content.feeds ?? [];
        categories.value = content.categories ?? [];
      } else {
        error.value = 'Failed to load feeds';
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error';
      console.error('Failed to load feeds:', err);
    } finally {
      loading.value = false;
    }
  }

  function selectFeed(feedId: number | string, isCat: boolean = false) {
    currentFeedId.value = feedId;
    currentIsCat.value = isCat;
  }

  function updateFeedUnread(feedId: number, delta: number) {
    const feed = feeds.value.find(f => f.id === feedId);
    if (feed) {
      feed.unread = Math.max(0, feed.unread + delta);
    }
    
    // Update category unread (cat_id can be 0 for uncategorized)
    const catId = feed?.cat_id;
    if (catId != null) {
      const cat = categories.value.find(c => c.id === catId);
      if (cat) {
        cat.unread = Math.max(0, cat.unread + delta);
      }
    }
  }

  function updateCategoryUnread(catId: number, delta: number) {
    const cat = categories.value.find(c => c.id === catId);
    if (cat) {
      cat.unread = Math.max(0, cat.unread + delta);
    }
  }

  function reset() {
    feeds.value = [];
    categories.value = [];
    currentFeedId.value = 0;
    currentIsCat.value = false;
    error.value = null;
  }

  return {
    // State
    feeds,
    categories,
    loading,
    error,
    currentFeedId,
    currentIsCat,
    
    // Getters
    feedsByCategory,
    totalUnread,
    currentFeed,
    
    // Actions
    loadFeeds,
    selectFeed,
    updateFeedUnread,
    updateCategoryUnread,
    reset,
  };
});
