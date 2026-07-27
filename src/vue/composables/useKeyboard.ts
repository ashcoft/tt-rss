/**
 * Keyboard Shortcuts Composable
 * Handles keyboard navigation and shortcuts for TT-RSS
 */

import { onMounted, onUnmounted } from 'vue';

export interface KeyboardShortcuts {
  onNext?: () => void;
  onPrevious?: () => void;
  onSelect?: () => void;
  onOpenArticle?: () => void;
  onToggleRead?: () => void;
  onToggleStar?: () => void;
  onTogglePublish?: () => void;
  onRefresh?: () => void;
  onSearch?: () => void;
  onCatchup?: () => void;
  onHelp?: () => void;
}

export function useKeyboard(shortcuts: KeyboardShortcuts) {
  /**
   * Process keyboard shortcuts
   * @param ev - Keyboard event object
   */
  const processKey = (ev: KeyboardEvent): void => {
    // Ignore if typing in input/textarea
    const target = ev.target;
    if (target instanceof HTMLElement) {
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }
    }

    switch (ev.key.toLowerCase()) {
      // Navigation
      case 'j':
      case 'arrowdown':
        ev.preventDefault();
        shortcuts.onNext?.();
        break;
      case 'k':
      case 'arrowup':
        ev.preventDefault();
        shortcuts.onPrevious?.();
        break;
      case 'enter':
        ev.preventDefault();
        shortcuts.onSelect?.();
        break;
      
      // Article actions
      case 'o':
      case 'l':
        ev.preventDefault();
        shortcuts.onOpenArticle?.();
        break;
      case 'r':
        ev.preventDefault();
        shortcuts.onToggleRead?.();
        break;
      case 's':
        if (!ev.ctrlKey && !ev.metaKey) {
          ev.preventDefault();
          shortcuts.onToggleStar?.();
        }
        break;
      case 'f':
        ev.preventDefault();
        shortcuts.onTogglePublish?.();
        break;
      
      // Other actions
      case 'g':
        if (ev.shiftKey) {
          ev.preventDefault();
          shortcuts.onCatchup?.();
        }
        break;
      case '/':
        ev.preventDefault();
        shortcuts.onSearch?.();
        break;
      case '?':
        ev.preventDefault();
        shortcuts.onHelp?.();
        break;
      case 'u':
        if (!ev.ctrlKey && !ev.metaKey) {
          ev.preventDefault();
          shortcuts.onRefresh?.();
        }
        break;
    }
  };

  onMounted(() => {
    document.addEventListener('keydown', processKey);
  });

  onUnmounted(() => {
    document.removeEventListener('keydown', processKey);
  });
}

export default useKeyboard;
