/**
 * Type definitions for Tiny Tiny RSS Vue components
 */

export interface Feed {
  id: number;
  title: string;
  unread?: number;
  cat_id?: number;
  feed_url?: string;
  icon?: string;
}

export interface Category {
  id: number;
  title: string;
  unread?: number;
  parent_id?: number;
}

export interface Label {
  id: number;
  caption: string;
  unread?: number;
}

export interface Headline {
  id: number;
  title: string;
  link?: string;
  feed_id?: number;
  is_read: boolean;
  is_marked: boolean;
  is_published: boolean;
  updated?: number;
  author?: string;
  excerpt?: string;
}

export interface Article {
  id: number;
  title: string;
  link?: string;
  content?: string;
  author?: string;
  updated?: number;
  feed_id?: number;
  is_read: boolean;
  is_marked: boolean;
  is_published: boolean;
}

export interface FeedTreeNode {
  id: string;
  name: string;
  type: 'feed' | 'category' | 'label';
  unread: number;
  children?: FeedTreeNode[];
  icon?: string;
}

export interface ApiResponse<T = unknown> {
  status: number;
  content: T;
  message?: string;
}
