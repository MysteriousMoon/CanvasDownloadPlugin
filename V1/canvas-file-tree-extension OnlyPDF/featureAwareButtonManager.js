/**
 * Feature-aware Button Manager for Canvas Download Plugin
 * Extends ButtonManager to respect feature flags
 */
class FeatureAwareButtonManager extends ButtonManager {
  constructor(downloadManager) {
    super(downloadManager);
    this.features = CONFIG.FEATURES || {};
  }
  
  addFileTreeButtons(courseName, treeGenerator) {
    // Only add buttons for enabled features
    const existingButtons = `#${CONFIG.CSS_CLASSES.FILETREE_MD_BUTTON}, #${CONFIG.CSS_CLASSES.FILETREE_PDF_BUTTON}`;
    DOMUtils.removeExistingElements(existingButtons);
    
    const headerBar = DOMUtils.querySelector(CONFIG.SELECTORS.HEADER_BAR);
    if (!headerBar) return;
    
    const buttons = [];
    
    // Add MD button if enabled
    if (this.features.MARKDOWN_TREE !== false) {
      const mdBtn = this.createFileTreeButton(
        CONFIG.CSS_CLASSES.FILETREE_MD_BUTTON,
        '🌳 MD Tree',
        'Download course structure as Markdown with links',
        () => this.handleMarkdownDownload(courseName, treeGenerator)
      );
      buttons.push(mdBtn);
    }
    
    // Add PDF button if enabled
    if (this.features.PDF_TREE !== false) {
      const pdfBtn = this.createFileTreeButton(
        CONFIG.CSS_CLASSES.FILETREE_PDF_BUTTON,
        '📄 PDF Tree',
        'Download course structure as PDF',
        () => this.handlePdfDownload(courseName, treeGenerator)
      );
      buttons.push(pdfBtn);
    }
    
    // Insert buttons
    const globalBtn = DOMUtils.querySelector(`#${CONFIG.CSS_CLASSES.GLOBAL_BUTTON}`);
    buttons.forEach(btn => {
      if (globalBtn && globalBtn.nextSibling) {
        headerBar.insertBefore(btn, globalBtn.nextSibling);
      } else {
        headerBar.prepend(btn);
      }
    });
  }
  
  addGlobalDownloadButton(allAttachments, courseName) {
    if (this.features.GLOBAL_DOWNLOAD === false) return;
    super.addGlobalDownloadButton(allAttachments, courseName);
  }
  
  addModuleDownloadButtons(modules) {
    if (this.features.MODULE_DOWNLOAD === false) return;
    super.addModuleDownloadButtons(modules);
  }
  
  addSectionDownloadButtons(sections) {
    if (this.features.SECTION_DOWNLOAD === false) return;
    super.addSectionDownloadButtons(sections);
  }
  
  addItemDownloadButtons(allAttachments) {
    if (this.features.ITEM_DOWNLOAD === false) return;
    super.addItemDownloadButtons(allAttachments);
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FeatureAwareButtonManager;
}