# af_readability plugin for Tiny Tiny RSS

This plugin inlines full article content using the Readability library.

## Installation

1. Copy this entire folder to `plugins.local/af_readability/`
2. The plugin includes all necessary vendor dependencies
3. Enable the plugin in TT-RSS preferences

## Features

- Inline article content from full HTML pages
- Works with RSS feeds that only have excerpts
- Filter actions for inline and append modes
- Per-feed configuration via feed editor
- Share functionality for bookmarklets
- DLE (DataLife Engine) tag preprocessing for image dump sites
- Ad injection removal for cleaner content extraction

## Usage

1. Enable the plugin in Preferences > Plugins
2. Go to Preferences > Feeds
3. Click on the Readability settings section
4. Enable for specific feeds in the feed editor
5. Click the article button (description icon) to load full content

## Supported Page Types

The plugin includes preprocessing for:
- DLE engine image tags (`<!--dle_image_begin:...--><!--dle_image_end-->`)
- MGID ad widget injections
- LiveInternet counters
- Facebook SDK scripts
- Google Analytics/Yandex tracking
- General ad injection patterns

## Key Changes from Original Plugin

1. **DLE Content Preprocessing**: Added `preprocess_dle_content()` method to clean up DataLife Engine CMS content before Readability parsing
2. **Enhanced Ignored Elements**: Extended the `ExtraIgnoredElements` configuration to include more ad-related elements
3. **Ad Pattern Removal**: Multiple regex patterns to remove common ad injection patterns found on sites like acidcow.com

## Dependencies

All dependencies are bundled in the `vendor/` directory:
- **fivefilters/readability.php**: Main Readability library (from tt-rss fork)
- **masterminds/html5**: HTML5 parser
- **League\Uri**: Minimal custom implementation for URI resolution

## Configuration Options

- `enable_share_anything`: Allows other plugins and bookmarklets to use the full-text fetching capability
- Per-feed settings:
  - **Inline content**: Replace article summary with full content
  - **Append mode**: Add full content after existing summary

## Technical Notes

The plugin uses a custom autoloader to load:
1. League\Uri classes for URI manipulation
2. Fivefilters Readability library for content extraction
3. Masterminds HTML5 for HTML parsing
4. PSR interfaces from the main tt-rss vendor directory