/**
 * Infinite Scroll Composable
 * Handles loading more content when scrolling to bottom
 */

import { ref, onMounted, onUnmounted, type Ref } from 'vue';

export interface UseInfiniteScrollOptions {
  threshold?: number;
  onLoadMore: () => Promise<void> | void;
  enabled?: Ref<boolean>;
}

export function useInfiniteScroll(options: UseInfiniteScrollOptions) {
  const { threshold = 100, onLoadMore, enabled = ref(true) } = options;
  
  const loading = ref(false);
  const container = ref<HTMLElement | null>(null);

  const handleScroll = async () => {
    if (!container.value || !enabled.value || loading.value) return;

    const { scrollTop, scrollHeight, clientHeight } = container.value;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    if (distanceFromBottom < threshold) {
      loading.value = true;
      try {
        await onLoadMore();
      } finally {
        loading.value = false;
      }
    }
  };

  const setupScrollListener = (el: HTMLElement) => {
    container.value = el;
    el.addEventListener('scroll', handleScroll);
  };

  onMounted(() => {
    if (container.value) {
      container.value.addEventListener('scroll', handleScroll);
    }
  });

  onUnmounted(() => {
    if (container.value) {
      container.value.removeEventListener('scroll', handleScroll);
    }
  });

  return {
    loading,
    setupScrollListener,
  };
}

export default useInfiniteScroll;
