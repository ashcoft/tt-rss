<template>
  <div class="feed-tree">
    <el-input
      v-model="searchQuery"
      placeholder="Search feeds..."
      prefix-icon="Search"
      clearable
      class="search-input"
    />

    <el-menu
      :default-active="activeFeedId"
      class="feed-menu"
      @select="handleSelect"
    >
      <!-- Special Feeds -->
      <el-sub-menu index="special">
        <template #title>
          <span class="menu-title">Special</span>
        </template>
        <el-menu-item
          v-for="special in specialFeeds"
          :key="special.id"
          :index="String(special.id)"
        >
          <el-icon><component :is="special.icon" /></el-icon>
          <span class="feed-name">{{ special.name }}</span>
          <span class="unread-count" v-if="special.unread > 0">{{ special.unread }}</span>
        </el-menu-item>
      </el-sub-menu>

      <!-- Labels -->
      <el-sub-menu index="labels" v-if="labels.length > 0">
        <template #title>
          <span class="menu-title">Labels</span>
        </template>
        <el-menu-item
          v-for="label in filteredLabels"
          :key="'label-' + label.id"
          :index="'label-' + label.id"
        >
          <span class="label-indicator" :style="{ backgroundColor: label.bg_color || '#1976d2' }"></span>
          <span class="feed-name">{{ label.caption }}</span>
          <span class="unread-count" v-if="label.unread > 0">{{ label.unread }}</span>
        </el-menu-item>
      </el-sub-menu>

      <!-- Categories -->
      <el-sub-menu
        v-for="category in categories"
        :key="'cat-' + category.id"
        :index="'cat-' + category.id"
      >
        <template #title>
          <span class="menu-title">
            <el-icon><Folder /></el-icon>
            {{ category.name }}
          </span>
          <span class="unread-count" v-if="category.unread > 0">{{ category.unread }}</span>
        </template>
        <el-menu-item
          v-for="feed in getFeedsByCategory(category.id)"
          :key="feed.id"
          :index="String(feed.id)"
        >
          <span class="feed-name">{{ feed.title }}</span>
          <span class="unread-count" v-if="feed.unread > 0">{{ feed.unread }}</span>
        </el-menu-item>
      </el-sub-menu>

      <!-- Uncategorized Feeds -->
      <el-sub-menu index="uncategorized" v-if="uncategorizedFeeds.length > 0">
        <template #title>
          <span class="menu-title">Feeds</span>
        </template>
        <el-menu-item
          v-for="feed in filteredUncategorizedFeeds"
          :key="feed.id"
          :index="String(feed.id)"
        >
          <span class="feed-name">{{ feed.title }}</span>
          <span class="unread-count" v-if="feed.unread > 0">{{ feed.unread }}</span>
        </el-menu-item>
      </el-sub-menu>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Folder, Star, Bookmark, Clock, Check } from '@element-plus/icons-vue';
import type { Feed, Category, Label } from '@/types';

interface Props {
  feeds: Feed[];
  categories: Category[];
  labels?: Label[];
}

const props = withDefaults(defineProps<Props>(), {
  labels: () => []
});

const emit = defineEmits<{
  (e: 'select', feedId: number | string, isCat: boolean): void;
}>();

// State
const searchQuery = ref('');
const activeFeedId = ref('0');

// Special feeds (built-in)
const specialFeeds = [
  { id: -1, name: 'All Articles', icon: 'Document', unread: 0 },
  { id: -2, name: 'Fresh Articles', icon: 'Sunny', unread: 0 },
  { id: -3, name: 'Starred', icon: Star, unread: 0 },
  { id: -4, name: 'Published', icon: Bookmark, unread: 0 },
  { id: -5, name: 'Recently Read', icon: Clock, unread: 0 },
  { id: -6, name: 'Archived', icon: Check, unread: 0 },
];

// Computed
const filteredLabels = computed(() => {
  if (!searchQuery.value) return props.labels;
  const query = searchQuery.value.toLowerCase();
  return props.labels.filter(label =>
    label.caption.toLowerCase().includes(query)
  );
});

const filteredUncategorizedFeeds = computed(() => {
  const feeds = props.feeds.filter(f => !f.cat_id);
  if (!searchQuery.value) return feeds;
  const query = searchQuery.value.toLowerCase();
  return feeds.filter(feed => feed.title.toLowerCase().includes(query));
});

const getFeedsByCategory = (categoryId: number) => {
  const feeds = props.feeds.filter(f => f.cat_id === categoryId);
  if (!searchQuery.value) return feeds;
  const query = searchQuery.value.toLowerCase();
  return feeds.filter(feed => feed.title.toLowerCase().includes(query));
};

// Handlers
const handleSelect = (index: string) => {
  const isLabel = index.startsWith('label-');
  const isCategory = index.startsWith('cat-');

  if (isLabel) {
    const labelId = parseInt(index.replace('label-', ''));
    emit('select', labelId, false);
  } else if (isCategory) {
    const catId = parseInt(index.replace('cat-', ''));
    emit('select', catId, true);
  } else {
    const feedId = parseInt(index);
    emit('select', feedId, false);
  }
};
</script>

<style scoped>
.feed-tree {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.search-input {
  padding: 0.5rem;
}

.feed-menu {
  flex: 1;
  overflow-y: auto;
  border-right: none;
}

.menu-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.feed-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.unread-count {
  padding: 0 0.5rem;
  background: var(--ttrss-unread-bg, #e3f2fd);
  border-radius: 10px;
  font-size: 0.75rem;
  color: var(--ttrss-unread-color, #1976d2);
}

.label-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 0.5rem;
}
</style>
