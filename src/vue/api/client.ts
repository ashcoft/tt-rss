/**
 * Tiny Tiny RSS API Client
 * Centralized API communication layer for TT-RSS backend
 */

export interface ApiResponse<T = unknown> {
  status: number;
  content: T;
  seq?: number;
}

export interface ApiError {
  message: string;
  code?: number;
}

class ApiClient {
  private baseUrl = '/backend.php';
  private csrfToken: string | null = null;

  /**
   * Set CSRF token for authenticated requests
   */
  setCsrfToken(token: string): void {
    this.csrfToken = token;
  }

  /**
   * Get CSRF token
   */
  getCsrfToken(): string | null {
    return this.csrfToken;
  }

  /**
   * Initialize CSRF token from the page's __csrf_token global
   * Call this on app startup
   */
  initCsrfToken(): void {
    // Try to get from window object if set by backend
    const win = window as unknown as Record<string, unknown>;
    if (win.__csrf_token) {
      this.csrfToken = String(win.__csrf_token);
      return;
    }
    
    // Try to get from meta tag
    const meta = document.querySelector('meta[name="csrf_token"]');
    if (meta) {
      this.csrfToken = meta.getAttribute('content') || 'auto';
      return;
    }
    
    // Default to 'auto' for TT-RSS which handles it automatically when logged in
    this.csrfToken = 'auto';
  }

  /**
   * Fetch with error handling
   */
  private async request<T>(
    endpoint: string,
    params: Record<string, string | number | boolean | string[] | number[]> = {},
    method: 'GET' | 'POST' = 'GET'
  ): Promise<ApiResponse<T>> {
    const url = new URL(this.baseUrl, window.location.origin);
    
    // Build params object - remove op/method from params to avoid duplication
    const { op, method: _m, ...restParams } = params as Record<string, string | number | boolean | string[] | number[]>;
    
    const allParams: Record<string, string> = {
      op: String(op || endpoint),
      method: String(_m || 'index'),
    };

    // Add remaining params, converting arrays to proper format
    Object.entries(restParams).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        // Arrays get [] suffix for PHP backend (e.g., ids[]=1&ids[]=2)
        value.forEach((v) => {
          allParams[`${key}[]`] = String(v);
        });
      } else if (value !== undefined && value !== null) {
        allParams[key] = String(value);
      }
    });

    // Add CSRF token
    if (this.csrfToken) {
      allParams.csrf_token = this.csrfToken;
    }

    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      credentials: 'include',
    };

    let response: Response;
    let data: ApiResponse<T>;

    if (method === 'GET') {
      Object.entries(allParams).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
      response = await fetch(url.toString(), options);
    } else {
      const formData = new URLSearchParams();
      Object.entries(allParams).forEach(([key, value]) => {
        formData.set(key, value);
      });
      options.body = formData.toString();
      response = await fetch(url.toString(), options);
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    data = await response.json();
    return data;
  }

  // ============================================
  // Authentication
  // ============================================
  
  async login(username: string, password: string): Promise<ApiResponse<{ session_id: string; api_level: number }>> {
    return this.request<{ session_id: string; api_level: number }>('login', {
      op: 'login',
      user: username,
      password: password,
    }, 'POST');
  }

  async logout(): Promise<ApiResponse<boolean>> {
    return this.request<boolean>('logout', {
      op: 'logout',
    }, 'POST');
  }

  async getConfig(): Promise<ApiResponse<{
    daemon_possible: boolean;
    debug_redis: boolean;
    labels: Array<{ id: number; caption: string }>;
    max_sequence: number;
    profiles_enabled: boolean;
    own_tokens: Array<{ id: string; title: string }>;
    special_articles_exist: boolean;
    viewport: string;
  }>> {
    return this.request('index', {
      op: 'index',
      method: 'getConfig',
    });
  }

  // ============================================
  // Feeds
  // ============================================

  async getFeedTree(): Promise<ApiResponse<{
    feeds: Array<{
      id: number;
      title: string;
      unread: number;
      cat_id: number | null;
      feed_url: string;
      site_url: string;
    }>;
    categories: Array<{
      id: number;
      title: string;
      unread: number;
      parent_id: number | null;
    }>;
  }>> {
    return this.request('feeds', {
      op: 'feeds',
      method: 'getTree',
    });
  }

  async getHeadlines(
    feedId: number | string,
    options: {
      isCat?: boolean;
      viewMode?: 'adaptive' | 'all_articles' | 'unread';
      limit?: number;
      skip?: number;
      search?: string;
      searchMode?: 'all' | 'title' | 'content' | 'both';
      tag?: string;
    } = {}
  ): Promise<ApiResponse<{
    headlines: Array<{
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
    }>;
    headlines_count: number;
    first_id: number;
    last_id: number;
  }>> {
    return this.request('feeds', {
      op: 'feeds',
      method: 'getHeadlines',
      feed_id: feedId,
      is_cat: options.isCat ? '1' : '0',
      view_mode: options.viewMode || 'adaptive',
      limit: options.limit || 30,
      skip: options.skip || 0,
      search: options.search || '',
      search_mode: options.searchMode || 'all',
      tag: options.tag || '',
    });
  }

  async getArticle(articleId: number): Promise<ApiResponse<{
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
  }>> {
    return this.request('article', {
      op: 'article',
      method: 'view',
      article_id: articleId,
    });
  }

  // ============================================
  // Article Actions
  // ============================================

  async catchupArticles(articleIds: number[], mode: 0 | 1): Promise<ApiResponse<boolean>> {
    return this.request('RPC', {
      op: 'RPC',
      method: 'catchupSelected',
      ids: articleIds,
      cmode: mode,
    }, 'POST');
  }

  async markArticles(articleIds: number[], mode: 0 | 2): Promise<ApiResponse<boolean>> {
    return this.request('RPC', {
      op: 'RPC',
      method: 'markSelected',
      ids: articleIds,
      cmode: mode,
    }, 'POST');
  }

  async publishArticles(articleIds: number[], mode: 0 | 2): Promise<ApiResponse<boolean>> {
    return this.request('RPC', {
      op: 'RPC',
      method: 'publishSelected',
      ids: articleIds,
      cmode: mode,
    }, 'POST');
  }

  async deleteArticles(articleIds: number[]): Promise<ApiResponse<boolean>> {
    return this.request('RPC', {
      op: 'RPC',
      method: 'delete',
      ids: articleIds,
    }, 'POST');
  }

  async updateArticleNote(articleId: number, note: string): Promise<ApiResponse<boolean>> {
    return this.request('article', {
      op: 'article',
      method: 'updateArticle',
      article_id: articleId,
      note: note,
    }, 'POST');
  }

  // ============================================
  // Feed Actions
  // ============================================

  async addFeed(feedUrl: string, categoryId?: number, title?: string): Promise<ApiResponse<{ feed_id: number }>> {
    return this.request('feeds', {
      op: 'feeds',
      method: 'addFeed',
      feed_url: feedUrl,
      cat_id: categoryId || 0,
      title: title || '',
    }, 'POST');
  }

  async deleteFeed(feedId: number): Promise<ApiResponse<boolean>> {
    return this.request('feeds', {
      op: 'feeds',
      method: 'deleteFeed',
      feed_id: feedId,
    }, 'POST');
  }

  async purgeFeed(feedId: number): Promise<ApiResponse<boolean>> {
    return this.request('feeds', {
      op: 'feeds',
      method: 'purge',
      feed_id: feedId,
    }, 'POST');
  }

  // ============================================
  // Labels
  // ============================================

  async getLabels(): Promise<ApiResponse<Array<{
    id: number;
    caption: string;
    fg_color: string;
    bg_color: string;
  }>>> {
    return this.request('labels', {
      op: 'labels',
      method: 'getAll',
    });
  }

  async createLabel(caption: string, fgColor?: string, bgColor?: string): Promise<ApiResponse<{ id: number }>> {
    return this.request('labels', {
      op: 'labels',
      method: 'create',
      caption: caption,
      fg_color: fgColor || '',
      bg_color: bgColor || '',
    }, 'POST');
  }

  async assignLabel(labelId: number, articleIds: number[]): Promise<ApiResponse<boolean>> {
    return this.request('labels', {
      op: 'labels',
      method: 'assign',
      label_id: labelId,
      article_ids: articleIds.join(','),
    }, 'POST');
  }

  // ============================================
  // Categories
  // ============================================

  async getCategories(): Promise<ApiResponse<Array<{
    id: number;
    title: string;
    unread: number;
    parent_id: number | null;
  }>>> {
    return this.request('feeds', {
      op: 'feeds',
      method: 'getCategories',
    });
  }

  async createCategory(title: string, parentId?: number): Promise<ApiResponse<{ id: number }>> {
    return this.request('feeds', {
      op: 'feeds',
      method: 'createCategory',
      title: title,
      parent_id: parentId || 0,
    }, 'POST');
  }

  async deleteCategory(categoryId: number): Promise<ApiResponse<boolean>> {
    return this.request('feeds', {
      op: 'feeds',
      method: 'deleteCategory',
      cat_id: categoryId,
    }, 'POST');
  }

  // ============================================
  // Search
  // ============================================

  async search(
    query: string,
    searchMode: 'all' | 'title' | 'content' | 'both' = 'all',
    limit: number = 50
  ): Promise<ApiResponse<{
    headlines: Array<{
      id: number;
      title: string;
      feed_id: number;
      is_read: boolean;
      is_starred: boolean;
      updated: number;
    }>;
  }>> {
    return this.request('feeds', {
      op: 'feeds',
      method: 'search',
      search_query: query,
      search_mode: searchMode,
      limit: limit,
    });
  }
}

export const api = new ApiClient();
export default api;
