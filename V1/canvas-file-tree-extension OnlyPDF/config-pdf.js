/**
 * PDF-Only Configuration for Canvas Download Plugin
 * This version focuses only on PDF generation and file downloads
 */
const CONFIG_PDF = {
  ...CONFIG,
  
  // Override features for PDF-only version
  FEATURES: {
    GLOBAL_DOWNLOAD: true,
    MODULE_DOWNLOAD: true,
    SECTION_DOWNLOAD: true,
    ITEM_DOWNLOAD: true,
    MARKDOWN_TREE: false,  // Disable markdown tree for PDF-only version
    PDF_TREE: true
  },
  
  // Override version
  VERSION: '5.0-PDF'
};

// Replace the main CONFIG for PDF-only version
Object.assign(CONFIG, CONFIG_PDF);