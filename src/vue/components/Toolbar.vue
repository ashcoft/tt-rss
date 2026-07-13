<template>
  <div class="toolbar">
    <div class="toolbar-left">
      <el-button-group>
        <el-button
          :icon="Refresh"
          @click="$emit('action', 'refresh')"
          title="Refresh"
        />
        <el-button
          :icon="Check"
          @click="$emit('action', 'catchup')"
          title="Mark all as read"
        />
      </el-button-group>

      <el-input
        v-model="searchQuery"
        placeholder="Search articles..."
        prefix-icon="Search"
        clearable
        class="search-input"
        @keyup.enter="$emit('action', 'search', searchQuery)"
      />
    </div>

    <div class="toolbar-center">
      <span class="feed-title" v-if="feedInfo">{{ feedInfo.title }}</span>
    </div>

    <div class="toolbar-right">
      <el-button-group>
        <el-button
          :icon="ViewList"
          :type="viewMode === 'list' ? 'primary' : ''"
          @click="setViewMode('list')"
          title="List view"
        />
        <el-button
          :icon="Grid"
          :type="viewMode === 'grid' ? 'primary' : ''"
          @click="setViewMode('grid')"
          title="Grid view"
        />
        <el-button
          :icon="Expand"
          :type="viewMode === 'expanded' ? 'primary' : ''"
          @click="setViewMode('expanded')"
          title="Expanded view"
        />
      </el-button-group>

      <el-dropdown @command="handleSort">
        <el-button>
          Sort: {{ sortLabel }}
          <el-icon class="el-icon--right"><ArrowDown /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="date">Date</el-dropdown-item>
            <el-dropdown-item command="feed">Feed</el-dropdown-item>
            <el-dropdown-item command="title">Title</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <el-dropdown @command="handleAction">
        <el-button :icon="More" />
        <template #dropdown>
          <el-dropdown-menu>
<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  Refresh, Check, ViewList, Grid, Expand, ArrowDown, More
} from '@element-plus/icons-vue';
import type { Feed } from '@/types';

interface Props {
  feedInfo: Feed | null;
}

defineProps<Props>();

const emit = defineEmits<(e: 'action', action: string, payload?: string | number) => void>();

// State
const searchQuery = ref('');
const viewMode = ref<'list' | 'grid' | 'expanded'>('list');
const sortBy = ref('date');
const sortOrder = ref<'asc' | 'desc'>('desc');

// Computed
const sortLabel = computed(() => {
  const labels: Record<string, string> = {
    date: 'Date',
    feed: 'Feed',
    title: 'Title'
  };
  return labels[sortBy.value] || 'Date';
});

// Methods
/**
 * Sets the view mode and emits an action event.
 * @param mode - The view mode to set ('list', 'grid', or 'expanded').
 */
const setViewMode = (mode: 'list' | 'grid' | 'expanded') => {
  viewMode.value = mode;
  emit('action', 'viewMode', mode);
};

/**
 * Handles sorting by updating sortBy and emitting a sort action.
 * @param command - The command indicating the sort criterion.
 */
const handleSort = (command: string) => {
  sortBy.value = command;
  emit('action', 'sort', { by: command, order: sortOrder.value });
};

/**
 * Handles a generic action by emitting an action event.
 * @param command - The action command to emit.
 */
const handleAction = (command: string) => {
  emit('action', command);
};
</script>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  background: var(--ttrss-toolbar-bg, #fff);
  border-bottom: 1px solid var(--ttrss-border, #ddd);
  gap: 1rem;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.toolbar-center {
  flex: 1;
  text-align: center;
}

.feed-title {
  font-weight: 600;
  color: var(--ttrss-primary, #1976d2);
}

.search-input {
  width: 200px;
}
</style>
