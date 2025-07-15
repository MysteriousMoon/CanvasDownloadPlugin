/**
 * DOM utilities for Canvas Download Plugin
 */
class DOMUtils {
  static querySelector(selector, parent = document) {
    return ErrorHandler.safeExecute(() => parent.querySelector(selector), null);
  }
  
  static querySelectorAll(selector, parent = document) {
    return ErrorHandler.safeExecute(() => Array.from(parent.querySelectorAll(selector)), []);
  }
  
  static getTextContent(element) {
    return element ? element.textContent.trim() : '';
  }
  
  static removeExistingElements(selector) {
    const elements = this.querySelectorAll(selector);
    elements.forEach(el => el.remove());
  }
  
  static createElement(tag, attributes = {}, textContent = '') {
    const element = document.createElement(tag);
    
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'style' && typeof value === 'object') {
        Object.assign(element.style, value);
      } else {
        element.setAttribute(key, value);
      }
    });
    
    if (textContent) {
      element.textContent = textContent;
    }
    
    return element;
  }
  
  static addEventListenerSafe(element, event, handler) {
    if (element && typeof handler === 'function') {
      element.addEventListener(event, (e) => {
        ErrorHandler.safeExecute(() => handler(e));
      });
    }
  }
  
  static insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
  }
  
  static downloadFile(url, filename = '') {
    const link = this.createElement('a', { href: url, download: filename });
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  static downloadTextFile(content, filename, mimeType = 'text/plain') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    this.downloadFile(url, filename);
    URL.revokeObjectURL(url);
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DOMUtils;
}