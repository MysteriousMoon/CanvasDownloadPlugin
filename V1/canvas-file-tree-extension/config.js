/**
 * Configuration constants for Canvas Download Plugin
 */
const CONFIG = {
  // Delays and timeouts
  DOWNLOAD_DELAY: 500,
  SECTION_DOWNLOAD_DELAY: 600,
  INIT_DELAY: 500,
  BUTTON_RESET_DELAY: 3000,
  
  // Selectors
  SELECTORS: {
    MODULE: '.context_module',
    MODULE_TITLE: '.ig-header-title .name',
    MODULE_ITEM: '.context_module_item:not(.context_module_sub_header)',
    MODULE_SUB_HEADER: '.context_module_sub_header',
    ITEM_TITLE: '.ig-title',
    ITEM_TITLE_ALT: '.title',
    ITEM_TITLE_MODULE: '.module-item-title .item_name',
    ITEM_LINK: 'a.title, a.ig-title, .module-item-title a.item_link',
    HEADER_BAR: '.header-bar',
    BREADCRUMB_COURSE: '.ic-app-crumbs li:not(.home) a span.ellipsible',
    BREADCRUMB_SIMPLE: '.ic-app-crumbs .home + a',
    PAGE_TITLE: '.page-title',
    USER_PROFILE: '#global_nav_profile_link .menu-item__text'
  },
  
  // CSS Classes
  CSS_CLASSES: {
    GLOBAL_BUTTON: 'cp-global-btn',
    FILETREE_MD_BUTTON: 'cp-filetree-md-btn',
    FILETREE_PDF_BUTTON: 'cp-filetree-pdf-btn',
    MODULE_CONTROLS: 'cp-module-controls',
    SECTION_CONTROLS: 'cp-section-controls',
    ITEM_CONTROLS: 'cp-item-controls',
    BUTTON_STYLE: 'Button Button--small'
  },
  
  // File types and icons
  ITEM_TYPES: {
    FILE: 'file',
    ASSIGNMENT: 'assignment',
    QUIZ: 'quiz',
    DISCUSSION: 'discussion',
    PAGE: 'page',
    LINK: 'link',
    EXTERNAL_TOOL: 'external-tool',
    UNKNOWN: 'unknown'
  },
  
  TYPE_ICONS: {
    file: '📄',
    assignment: '📝',
    quiz: '❓',
    discussion: '💬',
    page: '📄',
    link: '🔗',
    'external-tool': '🧰',
    unknown: '📎'
  },
  
  // URLs and patterns
  DOWNLOAD_URL_PATTERN: '/courses/{courseId}/files/{fileId}/download?download_frd=1',
  COURSE_URL_PATTERN: /\/courses\/(\d+)/,
  ATTACHMENT_CLASS_PATTERN: /attachment_(\d+)/i,
  
  // Default values
  DEFAULT_COURSE_NAME: 'Canvas Course',
  VERSION: '5.0',
  
  // UI Messages
  MESSAGES: {
    NO_ATTACHMENTS: 'No downloadable attachments found.',
    DOWNLOAD_CONFIRM: 'Are you sure you want to download {count} attachments one by one?',
    MODULE_DOWNLOAD_CONFIRM: 'Are you sure you want to download all {count} attachments in "{title}"?',
    SECTION_DOWNLOAD_CONFIRM: 'Are you sure you want to download all {count} attachments in section "{title}"?',
    COURSE_ID_ERROR: 'Canvas Parser: Could not extract course ID from URL.',
    INIT_SUCCESS: 'Canvas Parser (v{version}) initialized: Found {attachments} total attachments and {items} total items.'
  }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}