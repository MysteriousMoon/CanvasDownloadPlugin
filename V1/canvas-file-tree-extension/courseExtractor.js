/**
 * Canvas course information extractor
 */
class CourseExtractor {
  static extractCourseId() {
    const match = window.location.pathname.match(CONFIG.COURSE_URL_PATTERN);
    return match ? match[1] : null;
  }
  
  static extractCourseName() {
    // Try breadcrumb course element
    const breadcrumbCourseEl = DOMUtils.querySelector(CONFIG.SELECTORS.BREADCRUMB_COURSE);
    if (breadcrumbCourseEl) {
      return DOMUtils.getTextContent(breadcrumbCourseEl);
    }
    
    // Try ellipsible elements
    const ellipsibleElements = DOMUtils.querySelectorAll('span.ellipsible');
    for (let el of ellipsibleElements) {
      const text = DOMUtils.getTextContent(el);
      if (text && !text.includes("My Dashboard") && !text.includes("Home") && text !== "Modules") {
        return text;
      }
    }
    
    // Try simple breadcrumb
    const breadcrumb = DOMUtils.querySelector(CONFIG.SELECTORS.BREADCRUMB_SIMPLE);
    if (breadcrumb) {
      return DOMUtils.getTextContent(breadcrumb);
    }
    
    // Try page title
    const pageTitle = DOMUtils.querySelector(CONFIG.SELECTORS.PAGE_TITLE);
    if (pageTitle) {
      const title = DOMUtils.getTextContent(pageTitle).split('|')[0].trim();
      if (title && title !== "Modules") {
        return title;
      }
    }
    
    // Try document title
    const docTitle = document.title.split(':')[0].trim();
    if (docTitle && docTitle !== "Modules") {
      return docTitle;
    }
    
    // Return default
    return CONFIG.DEFAULT_COURSE_NAME;
  }
  
  static getCurrentUser() {
    const userEl = DOMUtils.querySelector(CONFIG.SELECTORS.USER_PROFILE);
    return userEl ? DOMUtils.getTextContent(userEl) : 'Unknown User';
  }
  
  static formatDateTime(date = new Date()) {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
  
  static formatFileDateTime(date = new Date()) {
    const dateStr = date.toISOString().slice(0, 10);
    const timeStr = date.toTimeString().slice(0, 8).replace(/:/g, '-');
    return `${dateStr}_${timeStr}`;
  }
  
  static sanitizeFilename(filename) {
    return filename.replace(/[^\w\s-]/g, '_').trim();
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CourseExtractor;
}