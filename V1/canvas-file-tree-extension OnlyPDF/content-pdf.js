/**
 * Canvas Download Plugin - PDF-Only Version
 * Version 5.0-PDF - Modular Architecture
 */

/**
 * PDF-Only Canvas Parser Controller
 * Uses the same modular architecture but with PDF-specific features
 */
class CanvasParserPDF extends CanvasParser {
  constructor() {
    super();
  }
  
  initializeUI() {
    // Create file tree generator
    this.fileTreeGenerator = new FileTreeGenerator(
      this.courseId,
      this.courseName,
      this.modules,
      this.sections,
      this.allItems,
      this.allAttachments
    );
    
    // Use feature-aware button manager
    this.buttonManager = new FeatureAwareButtonManager(this.downloadManager);
    
    // Add all UI buttons (respecting feature flags)
    this.buttonManager.addGlobalDownloadButton(this.allAttachments, this.courseName);
    this.buttonManager.addFileTreeButtons(this.courseName, this.fileTreeGenerator);
    this.buttonManager.addModuleDownloadButtons(this.modules);
    this.buttonManager.addSectionDownloadButtons(this.sections);
    this.buttonManager.addItemDownloadButtons(this.allAttachments);
  }
}

/**
 * Initialize the Canvas Parser - PDF Version
 */
function initializeParserPDF() {
  if (window.location.pathname.includes('/modules')) {
    try {
      new CanvasParserPDF();
    } catch (error) {
      ErrorHandler.handleError('PDF parser initialization', error);
    }
  }
}

/**
 * URL change detection for SPA navigation
 */
let lastUrlPDF = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrlPDF) {
    lastUrlPDF = url;
    setTimeout(initializeParserPDF, CONFIG.INIT_DELAY);
  }
}).observe(document, { subtree: true, childList: true });

// Initialize on page load
setTimeout(initializeParserPDF, CONFIG.INIT_DELAY);