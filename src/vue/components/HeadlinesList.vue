<template>
  <div class="headlines-list">
    <el-table
      :data="headlines"
      v-loading="loading"
      @row-click="handleRowClick"
      @selection-change="handleSelectionChange"
      :row-class-name="getRowClass"
      highlight-current-row
      stripe
      style="width: 100%"
    >
      <el-table-column type="selection" width="40" />

      <el-table-column label="Feed" width="120">
        <template #default="{ row }">
          <span class="feed-name">{{ row.feed_title || 'Unknown' }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Title" min-width="300">
        <template #default="{ row }">
          <div class="headline-content">
            <span class="headline-title" :class="{ unread: !row.is_read }">
              {{ row.title }}
            </span>
            <div class="headline-meta">
              <span class="author" v-if="row.author">{{ row.author }}</span>
              <span class="date">{{ formatDate(row.updated) }}</span>
              <span class="comments" v-if="row.comments_count > 0">
                <el-icon><ChatLineSquare /></el-icon>
                {{ row.comments_count }}
              </span>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="Labels" width="150">
        <template #default="{ row }">
          <el-tag
            v-for="label in row.labels"
            :key="label.id"
            size="small"
            class="label-tag"
          >
            {{ label.caption }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="Actions" width="120" align="right">
        <template #default="{ row }">
          <el-button-group size="small">
            <el-button
              :icon="Star"
              :type="row.is_marked ? 'warning' : ''"
              @click.stop="$emit('action', row, 'toggle_star')"
              :title="row.is_marked ? 'Unstar' : 'Star'"
            />
            <el-button
              :icon="Document"
              @click.stop="$emit('action', row, 'mark_read')"
              title="Mark as read"
            />
            <el-button
              :icon="More"
              @click.stop="showActions(row)"
              title="More actions"
            />
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>

    <el-empty
      v-if="!loading && headlines.length === 0"
      description="No articles found"
    />

    <!-- Actions Dropdown -->
    <el-dropdown ref="actionsDropdown" trigger="click" @command="handleCommand">
      <span ref="actionsTarget" style="display: none;"></span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="mark_read">Mark as read</el-dropdown-item>
          <el-dropdown-item command="mark_unread">Mark as unread</el-dropdown-item>
          <el-dropdown-item command="toggle_star" divided>
            {{ currentHeadline?.is_marked ? 'Remove star' : 'Add star' }}
          </el-dropdown-item>
          <el-dropdown-item command="toggle_publish">
            {{ currentHeadline?.is_published ? 'Unpublish' : 'Publish' }}
          </el-dropdown-item>
          <el-dropdown-item command="open_article" divided>
            Open article
          </el-dropdown-item>
          <el-dropdown-item command="open_feed">Open feed</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Star, Document, More, ChatLineSquare } from '@element-plus/icons-vue';
import type { Headline } from '@/types';

interface Props {
  headlines: Headline[];
  loading?: boolean;
}

withDefaults(defineProps<Props>(), {
  loading: false
});

const emit = defineEmits<{
  (e: 'select', headline: Headline): void;
  (e: 'action', headline: Headline, action: string): void;
}>();

// State
const currentHeadline = ref<Headline | null>(null);
const actionsDropdown = ref();
const actionsTarget = ref<HTMLElement>();

// Methods
const handleRowClick = (row: Headline) => {
  emit('select', row);
};

const handleSelectionChange = (selection: Headline[]) => {
  console.log('Selected:', selection);
};

const getRowClass = ({ row }: { row: Headline }) => {
  const classes = [];
  if (!row.is_read) classes.push('unread-row');
  if (row.is_marked) classes.push('starred-row');
  return classes.join(' ');
};

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  // Less than 24 hours
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes}m ago`;
    }
    return `${hours}h ago`;
  }

  // Less than 7 days
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `${days}d ago`;
  }

  // Format as date
  return date.toLocaleDateString();
};

const showActions = (row: Headline) => {
  currentHeadline.value = row;
  // Actions dropdown logic would go here
};

const handleCommand = (command: string) => {
  if (currentHeadline.value) {
    emit('action', currentHeadline.value, command);
  }
};
</script>

<style scoped>
.headlines-list {
  flex: 1;
  overflow: auto;
}

.headline-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.headline-title {
  font-size: 0.9375rem;
  color: #333;
}

.headline-title.unread {
  font-weight: 600;
  color: #000;
}

.headline-meta {
  display: flex;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: #666;
}

.feed-name {
  font-size: 0.8125rem;
  color: #1976d2;
}

.label-tag {
  margin-right: 0.25rem;
  margin-bottom: 0.125rem;
}

.comments {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

:deep(.unread-row) {
  background-color: var(--ttrss-unread-bg, #e3f2fd) !important;
}

:deep(.starred-row) {
  background-color: var(--ttrss-starred-bg, #fff8e1) !important;
}
</style>
