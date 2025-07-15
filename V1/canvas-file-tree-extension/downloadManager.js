/**
 * Download manager for Canvas attachments
 */
class DownloadManager {
  constructor() {
    this.downloadQueue = [];
    this.isDownloading = false;
  }
  
  static delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  async downloadFile(url, filename = '') {
    return ErrorHandler.safeAsyncExecute(async () => {
      DOMUtils.downloadFile(url, filename);
    });
  }
  
  async downloadMultipleFiles(attachments, progressCallback) {
    if (attachments.length === 0) {
      alert(CONFIG.MESSAGES.NO_ATTACHMENTS);
      return;
    }
    
    const count = attachments.length;
    const confirmMessage = CONFIG.MESSAGES.DOWNLOAD_CONFIRM.replace('{count}', count);
    if (!confirm(confirmMessage)) return;
    
    this.isDownloading = true;
    
    try {
      for (let i = 0; i < attachments.length; i++) {
        const attachment = attachments[i];
        
        if (progressCallback) {
          progressCallback(i + 1, attachments.length, attachment.title);
        }
        
        await this.downloadFile(attachment.downloadInfo.downloadUrl, attachment.title);
        await DownloadManager.delay(CONFIG.DOWNLOAD_DELAY);
      }
      
      if (progressCallback) {
        progressCallback(attachments.length, attachments.length, 'Complete', true);
      }
    } catch (error) {
      ErrorHandler.log('Download failed', error);
      if (progressCallback) {
        progressCallback(0, attachments.length, 'Error', false);
      }
    } finally {
      this.isDownloading = false;
    }
  }
  
  async downloadModuleAttachments(module, buttonUpdateCallback) {
    if (module.attachments.length === 0) return;
    
    const count = module.attachments.length;
    const confirmMessage = CONFIG.MESSAGES.MODULE_DOWNLOAD_CONFIRM
      .replace('{count}', count)
      .replace('{title}', module.title);
    
    if (!confirm(confirmMessage)) return;
    
    try {
      if (buttonUpdateCallback) {
        buttonUpdateCallback('⏳ Starting downloads...', true);
      }
      
      for (let i = 0; i < module.attachments.length; i++) {
        const attachment = module.attachments[i];
        const progress = `⏳ (${i + 1}/${module.attachments.length}) ${attachment.title}`;
        
        if (buttonUpdateCallback) {
          buttonUpdateCallback(progress, true);
        }
        
        await this.downloadFile(attachment.downloadInfo.downloadUrl, attachment.title);
        await DownloadManager.delay(CONFIG.SECTION_DOWNLOAD_DELAY);
      }
      
      if (buttonUpdateCallback) {
        buttonUpdateCallback(`✅ Downloaded ${module.attachments.length} files`, true);
      }
    } catch (error) {
      ErrorHandler.log('Module download failed', error);
      if (buttonUpdateCallback) {
        buttonUpdateCallback('❌ Download error', true);
      }
    }
  }
  
  async downloadSectionAttachments(section, buttonUpdateCallback) {
    if (section.attachments.length === 0) return;
    
    const count = section.attachments.length;
    const confirmMessage = CONFIG.MESSAGES.SECTION_DOWNLOAD_CONFIRM
      .replace('{count}', count)
      .replace('{title}', section.title);
    
    if (!confirm(confirmMessage)) return;
    
    try {
      if (buttonUpdateCallback) {
        buttonUpdateCallback('⏳ Starting downloads...', true);
      }
      
      for (let i = 0; i < section.attachments.length; i++) {
        const attachment = section.attachments[i];
        const progress = `⏳ (${i + 1}/${section.attachments.length}) ${attachment.title}`;
        
        if (buttonUpdateCallback) {
          buttonUpdateCallback(progress, true);
        }
        
        await this.downloadFile(attachment.downloadInfo.downloadUrl, attachment.title);
        await DownloadManager.delay(CONFIG.SECTION_DOWNLOAD_DELAY);
      }
      
      if (buttonUpdateCallback) {
        buttonUpdateCallback(`✅ Downloaded ${section.attachments.length} files`, true);
      }
    } catch (error) {
      ErrorHandler.log('Section download failed', error);
      if (buttonUpdateCallback) {
        buttonUpdateCallback('❌ Download error', true);
      }
    }
  }
  
  async downloadMarkdownTree(courseName, treeGenerator) {
    return ErrorHandler.safeAsyncExecute(async () => {
      const treeText = treeGenerator.generateMarkdownTree();
      const fileName = this.generateFileName(courseName, 'ModulesTree', '.md');
      DOMUtils.downloadTextFile(treeText, fileName, 'text/markdown');
      return true;
    }, false);
  }
  
  async downloadPdfTree(courseName, treeGenerator) {
    return ErrorHandler.safeAsyncExecute(async () => {
      const html = treeGenerator.generateHtmlForPdf();
      const printWindow = window.open('', '_blank');
      printWindow.document.write(html);
      printWindow.document.title = `${courseName} - Modules Structure`;
      printWindow.document.close();
      
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 500);
      };
      
      return true;
    }, false);
  }
  
  generateFileName(courseName, suffix, extension) {
    const sanitizedCourseName = CourseExtractor.sanitizeFilename(courseName);
    const dateTime = CourseExtractor.formatFileDateTime();
    return `${sanitizedCourseName}_${suffix}_${dateTime}${extension}`;
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DownloadManager;
}