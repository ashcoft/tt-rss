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
  const handleKeyDown = (event: KeyboardEvent) => {
    // Ignore if typing in input/textarea
    const target = event.target;
    if (target instanceof HTMLElement) {
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }
    }

    switch (event.key.toLowerCase()) {
      // Navigation
      case 'j':
      case 'arrowdown':
        event.preventDefault();
        shortcuts.onNext?.();
        break;
      case 'k':
      case 'arrowup':
        event.preventDefault();
        shortcuts.onPrevious?.();
        break;
      case 'enter':
        event.preventDefault();
        shortcuts.onSelect?.();
        break;
      
      // Article actions
      case 'o':
      case 'l':
        event.preventDefault();
        shortcuts.onOpenArticle?.();
        break;
      case 'r':
        event.preventDefault();
        shortcuts.onToggleRead?.();
        break;
      case 's':
        if (!event.ctrlKey && !event.metaKey) {
          event.preventDefault();
          shortcuts.onToggleStar?.();
        }
        break;
      case 'f':
        event.preventDefault();
        shortcuts.onTogglePublish?.();
        break;
      
      // Other actions
      case 'g':
        if (event.shiftKey) {
          event.preventDefault();
          shortcuts.onCatchup?.();
        }
        break;
      case '/':
        event.preventDefault();
        shortcuts.onSearch?.();
        break;
      case '?':
        event.preventDefault();
        shortcuts.onHelp?.();
        break;
      case 'u':
        if (!event.ctrlKey && !event.metaKey) {
          event.preventDefault();
          shortcuts.onRefresh?.();
        }
        break;
    }
  };

  onMounted(() => {
    document.addEventListener('keydown', handleKeyDown);
  });

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown);
  });
}

export default useKeyboard;
