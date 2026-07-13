/**
 * Type definitions for Tiny Tiny RSS
 * 
 * These types define the data structures used throughout the application,
 * matching the PHP backend's API responses.
 */

// Feed types
export interface Feed {
  id: number;
  title: string;
  cat_id: number | null;
  unread: number;
  error?: string;
  updated?: number;
  last_error?: string;
}

// Category (folder) types
export interface Category {
  id: number;
  name: string;
  unread: number;
  parent_id?: number | null;
}

// Headline (article summary) types
export interface Headline {
  id: number;
  title: string;
  link: string;
  feed_id: number;
  is_updated: boolean;
  is_read: boolean;
  is_marked: boolean;
  is_published: boolean;
  labels: Label[];
  updated: number;
  comments_count: number;
  comments_link: string;
  author: string;
  unread: boolean;
  rating?: number;
  tags?: string[];
  content?: string;
  excerpt?: string;
}

// Article (full content) types
export interface Article {
  id: number;
  title: string;
  link: string;
  content: string;
  feed_id: number;
  author: string;
  updated: number;
  is_read: boolean;
  is_marked: boolean;
  is_published: boolean;
  labels: Label[];
  comments_count: number;
  comments_link: string;
  tags: string[];
  attachments: Attachment[];
}

// Label types
export interface Label {
  id: number;
  caption: string;
  fg_color?: string;
  bg_color?: string;
}

// Attachment types
export interface Attachment {
  id: number;
  content_url: string;
  content_type: string;
  title: string;
  duration?: string;
}

// Filter types
export interface Filter {
  id: number;
  name: string;
  enabled: boolean;
  match_any_rule: boolean;
  actions: FilterAction[];
  rules: FilterRule[];
}

export interface FilterAction {
  id: number;
  type: string;
  param?: string;
}

export interface FilterRule {
  id: number;
  filter_type: string;
  field: string;
  action: string;
  value: string;
}

// API Response types
export interface ApiResponse {
  status: string;
  content: {
    seq?: number;
    headlines?: Headline[];
    categories?: Category[];
    feeds?: Feed[];
    articles?: Article[];
    filters?: Filter[];
    count?: number;
    label?: Label[];
    error?: string;
  };
  error?: {
    code: number;
    message: string;
  };
}

// Runtime info from backend
export interface RuntimeInfo {
  theme: string;
  theme_base: string;
  sso_url?: string;
  search_spec?: string;
  icon_oval?: string;
  default_view_mode?: string;
  default_view_order?: string;
  cdm_expanded?: boolean;
  is_default_view?: boolean;
  cdm_enable_grid?: boolean;
  vfeed_group_by_feed?: boolean;
  combine_displays?: boolean;
  default_article_display?: string;
  viewport_width?: number;
  viewport_height?: number;
}

// User info
export interface UserInfo {
  access_level: number;
  is_admin: boolean;
  login: string;
  auth_check_code: string;
  ui_date_format: string;
  ui_time_format: string;
}

// Tree node for feed tree component
export interface TreeNode {
  id: string;
  label: string;
  type: 'feed' | 'category' | 'label' | 'special';
  unread?: number;
  icon?: string;
  children?: TreeNode[];
  expanded?: boolean;
  parent?: string;
  data?: Feed | Category | Label;
}

// Event handler types
export type HeadlineSelectHandler = (headline: Headline) => void;
export type FeedSelectHandler = (feedId: number, isCat: boolean) => void;
export type ArticleActionHandler = (articleId: number, action: string) => void;

// Preference types
export interface UserPreferences {
  [key: string]: string | number | boolean;
}

// Notification types
export interface Notification {
  id: string;
  message: string;
  kind: 'info' | 'error' | 'progress' | 'generic';
  timeout?: number;
}
