/**
 * Refactored Canvas Download Plugin - Main Controller
 * Version 5.0 - Modular Architecture
 */

// Import all modules (in a real module system)
// For now, we'll rely on script loading order in manifest.json

/**
 * Main Canvas Parser Controller
 * Coordinates all the modules to provide download functionality
 */
class CanvasParser {
  constructor() {
    this.courseId = CourseExtractor.extractCourseId();
    this.courseName = CourseExtractor.extractCourseName();
    this.modules = [];
    this.sections = [];
    this.allAttachments = [];
    this.allItems = [];
    
    // Initialize components
    this.moduleParser = new ModuleParser(this.courseId);
    this.downloadManager = new DownloadManager();
    this.buttonManager = new ButtonManager(this.downloadManager);
    
    this.init();
  }
  
  init() {
    if (!this.courseId) {
      ErrorHandler.log(CONFIG.MESSAGES.COURSE_ID_ERROR);
      return;
    }
    
    try {
      this.parseContent();
      this.initializeUI();
      this.logInitialization();
    } catch (error) {
      ErrorHandler.handleError('initialization', error);
    }
  }
  
  parseContent() {
    // Parse modules and items
    const parseResult = this.moduleParser.parseModules();
    this.modules = parseResult.modules;
    this.allAttachments = parseResult.allAttachments;
    this.allItems = parseResult.allItems;
    
    // Parse sections
    this.sections = this.moduleParser.parseSections(this.modules);
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
    
    // Add all UI buttons
    this.buttonManager.addGlobalDownloadButton(this.allAttachments, this.courseName);
    this.buttonManager.addFileTreeButtons(this.courseName, this.fileTreeGenerator);
    this.buttonManager.addModuleDownloadButtons(this.modules);
    this.buttonManager.addSectionDownloadButtons(this.sections);
    this.buttonManager.addItemDownloadButtons(this.allAttachments);
  }
  
  logInitialization() {
    const message = CONFIG.MESSAGES.INIT_SUCCESS
      .replace('{version}', CONFIG.VERSION)
      .replace('{attachments}', this.allAttachments.length)
      .replace('{items}', this.allItems.length);
    
    console.log(message);
  }
}

/**
 * Initialize the Canvas Parser
 */
function initializeParser() {
  if (window.location.pathname.includes('/modules')) {
    try {
      new CanvasParser();
    } catch (error) {
      ErrorHandler.handleError('parser initialization', error);
    }
  }
}

/**
 * URL change detection for SPA navigation
 */
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    setTimeout(initializeParser, CONFIG.INIT_DELAY);
  }
}).observe(document, { subtree: true, childList: true });

// Initialize on page load
setTimeout(initializeParser, CONFIG.INIT_DELAY);