/**
 * UI Button manager for Canvas Download Plugin
 */
class ButtonManager {
  constructor(downloadManager) {
    this.downloadManager = downloadManager;
  }
  
  addGlobalDownloadButton(allAttachments, courseName) {
    DOMUtils.removeExistingElements(`#${CONFIG.CSS_CLASSES.GLOBAL_BUTTON}`);
    
    const headerBar = DOMUtils.querySelector(CONFIG.SELECTORS.HEADER_BAR);
    if (!headerBar) return;
    
    const downloadBtn = DOMUtils.createElement('button', {
      class: 'btn',
      id: CONFIG.CSS_CLASSES.GLOBAL_BUTTON
    }, `📥 Download All (${allAttachments.length})`);
    
    DOMUtils.addEventListenerSafe(downloadBtn, 'click', (e) => {
      e.preventDefault();
      this.handleGlobalDownload(allAttachments, downloadBtn);
    });
    
    headerBar.prepend(downloadBtn);
  }
  
  addFileTreeButtons(courseName, treeGenerator) {
    const existingButtons = `#${CONFIG.CSS_CLASSES.FILETREE_MD_BUTTON}, #${CONFIG.CSS_CLASSES.FILETREE_PDF_BUTTON}`;
    DOMUtils.removeExistingElements(existingButtons);
    
    const headerBar = DOMUtils.querySelector(CONFIG.SELECTORS.HEADER_BAR);
    if (!headerBar) return;
    
    const mdBtn = this.createFileTreeButton(
      CONFIG.CSS_CLASSES.FILETREE_MD_BUTTON,
      '🌳 MD Tree',
      'Download course structure as Markdown with links',
      () => this.handleMarkdownDownload(courseName, treeGenerator)
    );
    
    const pdfBtn = this.createFileTreeButton(
      CONFIG.CSS_CLASSES.FILETREE_PDF_BUTTON,
      '📄 PDF Tree',
      'Download course structure as PDF',
      () => this.handlePdfDownload(courseName, treeGenerator)
    );
    
    const globalBtn = DOMUtils.querySelector(`#${CONFIG.CSS_CLASSES.GLOBAL_BUTTON}`);
    if (globalBtn && globalBtn.nextSibling) {
      headerBar.insertBefore(pdfBtn, globalBtn.nextSibling);
      headerBar.insertBefore(mdBtn, globalBtn.nextSibling);
    } else {
      headerBar.prepend(pdfBtn);
      headerBar.prepend(mdBtn);
    }
  }
  
  createFileTreeButton(id, text, title, clickHandler) {
    const btn = DOMUtils.createElement('button', {
      class: 'btn',
      id: id,
      title: title,
      style: { marginLeft: '5px' }
    }, text);
    
    DOMUtils.addEventListenerSafe(btn, 'click', (e) => {
      e.preventDefault();
      clickHandler();
    });
    
    return btn;
  }
  
  addModuleDownloadButtons(modules) {
    modules.forEach(module => {
      if (module.attachments.length === 0) return;
      
      const createButton = () => {
        const buttonContainer = DOMUtils.createElement('span', {
          class: CONFIG.CSS_CLASSES.MODULE_CONTROLS
        });
        
        const downloadBtn = DOMUtils.createElement('button', {
          class: CONFIG.CSS_CLASSES.BUTTON_STYLE,
          title: `Download all attachments in ${module.title}`
        }, `📥 Download Module (${module.attachments.length})`);
        
        DOMUtils.addEventListenerSafe(downloadBtn, 'click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          this.handleModuleDownload(module, downloadBtn);
        });
        
        buttonContainer.appendChild(downloadBtn);
        return buttonContainer;
      };
      
      DOMUtils.removeExistingElements(`.${CONFIG.CSS_CLASSES.MODULE_CONTROLS}`);
      
      const nameSpanExpanded = DOMUtils.querySelector('.collapse_module_link .name', module.element);
      const nameSpanCollapsed = DOMUtils.querySelector('.expand_module_link .name', module.element);
      
      if (nameSpanExpanded) nameSpanExpanded.appendChild(createButton());
      if (nameSpanCollapsed) nameSpanCollapsed.appendChild(createButton());
    });
  }
  
  addSectionDownloadButtons(sections) {
    sections.forEach(section => {
      if (section.attachments.length === 0) return;
      
      DOMUtils.removeExistingElements(`.${CONFIG.CSS_CLASSES.SECTION_CONTROLS}`);
      
      const buttonContainer = DOMUtils.createElement('span', {
        class: CONFIG.CSS_CLASSES.SECTION_CONTROLS,
        style: {
          marginLeft: '10px',
          display: 'inline-block',
          verticalAlign: 'middle'
        }
      });
      
      const downloadBtn = DOMUtils.createElement('button', {
        class: CONFIG.CSS_CLASSES.BUTTON_STYLE,
        title: `Download all attachments in section "${section.title}"`,
        style: {
          fontSize: '12px',
          padding: '2px 6px'
        }
      }, `📥 Section (${section.attachments.length})`);
      
      DOMUtils.addEventListenerSafe(downloadBtn, 'click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        this.handleSectionDownload(section, downloadBtn);
      });
      
      buttonContainer.appendChild(downloadBtn);
      
      const titleEl = DOMUtils.querySelector('.module-item-title', section.element);
      if (titleEl) titleEl.appendChild(buttonContainer);
    });
  }
  
  addItemDownloadButtons(allAttachments) {
    allAttachments.forEach(attachment => {
      const titleEl = DOMUtils.querySelector(CONFIG.SELECTORS.ITEM_TITLE, attachment.element);
      if (!titleEl) return;
      
      DOMUtils.removeExistingElements(`.${CONFIG.CSS_CLASSES.ITEM_CONTROLS}`);
      
      const buttonContainer = DOMUtils.createElement('span', {
        class: CONFIG.CSS_CLASSES.ITEM_CONTROLS
      });
      
      DOMUtils.addEventListenerSafe(buttonContainer, 'click', e => e.preventDefault());
      
      const downloadBtn = DOMUtils.createElement('button', {
        class: CONFIG.CSS_CLASSES.BUTTON_STYLE,
        title: 'Direct Download'
      }, '📥 Download');
      
      DOMUtils.addEventListenerSafe(downloadBtn, 'click', (e) => {
        e.stopPropagation();
        this.downloadManager.downloadFile(attachment.downloadInfo.downloadUrl, attachment.title);
      });
      
      buttonContainer.appendChild(downloadBtn);
      DOMUtils.insertAfter(buttonContainer, titleEl);
    });
  }
  
  async handleGlobalDownload(allAttachments, button) {
    const originalText = button.innerHTML;
    button.disabled = true;
    
    const updateProgress = (current, total, title, isComplete = false) => {
      if (isComplete) {
        button.innerHTML = `✅ All download commands sent`;
      } else if (current === 0) {
        button.innerHTML = `❌ Download failed`;
      } else {
        button.innerHTML = `⏳ (${current}/${total}) ${title}`;
      }
    };
    
    await this.downloadManager.downloadMultipleFiles(allAttachments, updateProgress);
    
    setTimeout(() => {
      button.innerHTML = originalText;
      button.disabled = false;
    }, CONFIG.BUTTON_RESET_DELAY);
  }
  
  async handleModuleDownload(module, button) {
    const originalText = button.textContent;
    const updateCallback = (text, disabled) => {
      button.textContent = text;
      button.disabled = disabled;
    };
    
    await this.downloadManager.downloadModuleAttachments(module, updateCallback);
    
    setTimeout(() => {
      button.textContent = originalText;
      button.disabled = false;
    }, CONFIG.BUTTON_RESET_DELAY);
  }
  
  async handleSectionDownload(section, button) {
    const originalText = button.textContent;
    const updateCallback = (text, disabled) => {
      button.textContent = text;
      button.disabled = disabled;
    };
    
    await this.downloadManager.downloadSectionAttachments(section, updateCallback);
    
    setTimeout(() => {
      button.textContent = originalText;
      button.disabled = false;
    }, CONFIG.BUTTON_RESET_DELAY);
  }
  
  async handleMarkdownDownload(courseName, treeGenerator) {
    const btn = document.getElementById(CONFIG.CSS_CLASSES.FILETREE_MD_BUTTON);
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '⏳ Generating MD tree...';
    
    const success = await this.downloadManager.downloadMarkdownTree(courseName, treeGenerator);
    
    btn.innerHTML = success ? '✅ MD tree downloaded' : '❌ MD tree generation failed';
    
    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }, CONFIG.BUTTON_RESET_DELAY);
  }
  
  async handlePdfDownload(courseName, treeGenerator) {
    const btn = document.getElementById(CONFIG.CSS_CLASSES.FILETREE_PDF_BUTTON);
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '⏳ Generating PDF tree...';
    
    const success = await this.downloadManager.downloadPdfTree(courseName, treeGenerator);
    
    btn.innerHTML = success ? '✅ PDF tree ready' : '❌ PDF tree generation failed';
    
    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }, CONFIG.BUTTON_RESET_DELAY);
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ButtonManager;
}