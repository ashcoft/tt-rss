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

/**
 * Handles keyboard events for navigation and shortcuts
 * @param event - KeyboardEvent from document
 */
export function useKeyboard(shortcuts: KeyboardShortcuts) {
  /**
   * Process keyboard input for navigation
   * @param e - Keyboard event object
   */
  const processKeyboardInput = (e: KeyboardEvent): void => {
    // Ignore if typing in input/textarea
    const target = e.target;
    if (target instanceof HTMLElement) {
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }
    }

    switch (e.key.toLowerCase()) {
      // Navigation
      case 'j':
      case 'arrowdown':
        e.preventDefault();
        shortcuts.onNext?.();
        break;
      case 'k':
      case 'arrowup':
        e.preventDefault();
        shortcuts.onPrevious?.();
        break;
      case 'enter':
        e.preventDefault();
        shortcuts.onSelect?.();
        break;
      
      // Article actions
      case 'o':
      case 'l':
        e.preventDefault();
        shortcuts.onOpenArticle?.();
        break;
      case 'r':
        e.preventDefault();
        shortcuts.onToggleRead?.();
        break;
      case 's':
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          shortcuts.onToggleStar?.();
        }
        break;
      case 'f':
        e.preventDefault();
        shortcuts.onTogglePublish?.();
        break;
      
      // Other actions
      case 'g':
        if (e.shiftKey) {
          e.preventDefault();
          shortcuts.onCatchup?.();
        }
        break;
      case '/':
        e.preventDefault();
        shortcuts.onSearch?.();
        break;
      case '?':
        e.preventDefault();
        shortcuts.onHelp?.();
        break;
      case 'u':
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          shortcuts.onRefresh?.();
        }
        break;
    }
  };

  onMounted(() => {
    document.addEventListener('keydown', processKeyboardInput);
  });

  onUnmounted(() => {
    document.removeEventListener('keydown', processKeyboardInput);
  });
}

export default useKeyboard;
