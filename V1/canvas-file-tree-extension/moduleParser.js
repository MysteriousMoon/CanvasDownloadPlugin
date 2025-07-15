/**
 * Canvas module and item parser
 */
class ModuleParser {
  constructor(courseId) {
    this.courseId = courseId;
  }
  
  parseModules() {
    const modules = [];
    const allAttachments = [];
    const allItems = [];
    
    const moduleElements = DOMUtils.querySelectorAll(CONFIG.SELECTORS.MODULE);
    moduleElements.forEach(moduleEl => {
      const module = this.parseModule(moduleEl);
      if (module && module.title && (module.items.length > 0 || module.attachments.length > 0)) {
        modules.push(module);
        allAttachments.push(...module.attachments);
        allItems.push(...module.items);
      }
    });
    
    return { modules, allAttachments, allItems };
  }
  
  parseModule(moduleEl) {
    const titleEl = DOMUtils.querySelector(CONFIG.SELECTORS.MODULE_TITLE, moduleEl);
    if (!titleEl) return null;
    
    const moduleId = moduleEl.getAttribute('data-module-id');
    const title = DOMUtils.getTextContent(titleEl);
    const attachments = [];
    const items = [];
    
    const moduleItems = DOMUtils.querySelectorAll(CONFIG.SELECTORS.MODULE_ITEM, moduleEl);
    moduleItems.forEach(itemEl => {
      const item = this.parseItem(itemEl);
      if (item) {
        items.push(item);
        if (itemEl.classList.contains('attachment')) {
          const attachment = this.parseAttachment(itemEl);
          if (attachment) attachments.push(attachment);
        }
      }
    });
    
    return { id: moduleId, title, element: moduleEl, attachments, items };
  }
  
  parseItem(itemEl) {
    const title = this.extractItemTitle(itemEl);
    if (!title) return null;
    
    const itemId = itemEl.id.replace('context_module_item_', '');
    const url = this.extractItemUrl(itemEl);
    const type = this.extractItemType(itemEl);
    const downloadInfo = itemEl.classList.contains('attachment') ? 
      this.extractAttachmentInfo(itemEl) : null;
    
    return { id: itemId, title, element: itemEl, type, url, downloadInfo };
  }
  
  extractItemTitle(itemEl) {
    // Try primary title selector
    let titleEl = DOMUtils.querySelector(CONFIG.SELECTORS.ITEM_TITLE, itemEl);
    if (titleEl) return DOMUtils.getTextContent(titleEl);
    
    // Try alternative title selectors
    titleEl = DOMUtils.querySelector(CONFIG.SELECTORS.ITEM_TITLE_ALT, itemEl);
    if (titleEl) return DOMUtils.getTextContent(titleEl);
    
    titleEl = DOMUtils.querySelector(CONFIG.SELECTORS.ITEM_TITLE_MODULE, itemEl);
    if (titleEl) return DOMUtils.getTextContent(titleEl);
    
    // Try title attribute
    const anyTitleEl = DOMUtils.querySelector('[title]:not([title=""])', itemEl);
    if (anyTitleEl) {
      const title = anyTitleEl.getAttribute('title');
      if (title) return title.trim();
    }
    
    return null;
  }
  
  extractItemUrl(itemEl) {
    const linkEl = DOMUtils.querySelector(CONFIG.SELECTORS.ITEM_LINK, itemEl);
    if (linkEl && linkEl.href) return linkEl.href;
    
    // Check for external URLs
    if (itemEl.classList.contains('external_url')) {
      const externalLinkEl = DOMUtils.querySelector('a[href]:not([href="#"])', itemEl);
      if (externalLinkEl && externalLinkEl.href) return externalLinkEl.href;
    }
    
    return '';
  }
  
  extractItemType(itemEl) {
    // Check CSS classes first
    if (itemEl.classList.contains('attachment')) return CONFIG.ITEM_TYPES.FILE;
    if (itemEl.classList.contains('assignment')) return CONFIG.ITEM_TYPES.ASSIGNMENT;
    if (itemEl.classList.contains('quiz')) return CONFIG.ITEM_TYPES.QUIZ;
    if (itemEl.classList.contains('discussion-topic')) return CONFIG.ITEM_TYPES.DISCUSSION;
    if (itemEl.classList.contains('external-url') || itemEl.classList.contains('external_url')) {
      return CONFIG.ITEM_TYPES.LINK;
    }
    if (itemEl.classList.contains('external-tool')) return CONFIG.ITEM_TYPES.EXTERNAL_TOOL;
    if (itemEl.classList.contains('wiki-page')) return CONFIG.ITEM_TYPES.PAGE;
    
    // Check type span
    const typeSpan = DOMUtils.querySelector('span.type', itemEl);
    if (typeSpan) {
      const typeText = DOMUtils.getTextContent(typeSpan);
      switch (typeText) {
        case 'external_url': return CONFIG.ITEM_TYPES.LINK;
        case 'wiki_page': return CONFIG.ITEM_TYPES.PAGE;
        case 'assignment': return CONFIG.ITEM_TYPES.ASSIGNMENT;
        case 'quiz': return CONFIG.ITEM_TYPES.QUIZ;
        case 'discussion_topic': return CONFIG.ITEM_TYPES.DISCUSSION;
      }
    }
    
    // Check icons
    if (DOMUtils.querySelector('.icon-assignment', itemEl)) return CONFIG.ITEM_TYPES.ASSIGNMENT;
    if (DOMUtils.querySelector('.icon-quiz', itemEl)) return CONFIG.ITEM_TYPES.QUIZ;
    if (DOMUtils.querySelector('.icon-discussion', itemEl)) return CONFIG.ITEM_TYPES.DISCUSSION;
    if (DOMUtils.querySelector('.icon-document', itemEl)) return CONFIG.ITEM_TYPES.PAGE;
    if (DOMUtils.querySelector('.icon-link', itemEl)) return CONFIG.ITEM_TYPES.LINK;
    
    return CONFIG.ITEM_TYPES.UNKNOWN;
  }
  
  parseAttachment(itemEl) {
    const titleEl = DOMUtils.querySelector(CONFIG.SELECTORS.ITEM_TITLE, itemEl);
    if (!titleEl) return null;
    
    const title = DOMUtils.getTextContent(titleEl);
    const itemId = itemEl.id.replace('context_module_item_', '');
    const downloadInfo = this.extractAttachmentInfo(itemEl);
    
    if (!downloadInfo) return null;
    
    return { id: itemId, title, element: itemEl, downloadInfo };
  }
  
  extractAttachmentInfo(itemEl) {
    const classNames = itemEl.className;
    const attachmentMatch = classNames.match(CONFIG.ATTACHMENT_CLASS_PATTERN);
    
    if (attachmentMatch) {
      const fileId = attachmentMatch[1];
      const downloadUrl = CONFIG.DOWNLOAD_URL_PATTERN
        .replace('{courseId}', this.courseId)
        .replace('{fileId}', fileId);
      return { fileId, downloadUrl, canDownload: true };
    }
    
    return null;
  }
  
  parseSections(modules) {
    const sections = [];
    
    modules.forEach(module => {
      const moduleItems = Array.from(DOMUtils.querySelectorAll('.context_module_item', module.element));
      const subHeaderIndices = moduleItems
        .map((item, index) => item.classList.contains('context_module_sub_header') ? index : -1)
        .filter(index => index !== -1);
      
      for (let i = 0; i < subHeaderIndices.length; i++) {
        const startIdx = subHeaderIndices[i];
        const endIdx = (i < subHeaderIndices.length - 1) ? subHeaderIndices[i + 1] : moduleItems.length;
        
        const subHeaderEl = moduleItems[startIdx];
        const sectionTitle = DOMUtils.getTextContent(DOMUtils.querySelector('.title', subHeaderEl)) || 'Untitled Section';
        const sectionId = subHeaderEl.id;
        
        const sectionItems = [];
        const sectionAttachments = [];
        
        for (let j = startIdx + 1; j < endIdx; j++) {
          const itemEl = moduleItems[j];
          if (itemEl.classList.contains('context_module_sub_header')) continue;
          
          const item = this.parseItem(itemEl);
          if (item) {
            sectionItems.push(item);
            if (itemEl.classList.contains('attachment')) {
              const attachment = this.parseAttachment(itemEl);
              if (attachment) sectionAttachments.push(attachment);
            }
          }
        }
        
        sections.push({
          id: sectionId,
          title: sectionTitle,
          element: subHeaderEl,
          moduleId: module.id,
          moduleTitle: module.title,
          items: sectionItems,
          attachments: sectionAttachments
        });
      }
    });
    
    return sections;
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ModuleParser;
}