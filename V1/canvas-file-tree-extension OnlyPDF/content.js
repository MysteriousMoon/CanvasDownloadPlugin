class CanvasParser {
  constructor() {
    this.courseId = this.extractCourseId();
    this.modules = [];
    this.sections = [];
    this.allAttachments = [];
    this.allItems = [];
    this.courseName = this.extractCourseName();
    this.init();
  }

  init() {
    if (!this.courseId) {
      console.warn('Canvas Parser: Could not extract course ID from URL.');
      return;
    }
    this.parseModules();
    this.parseSections();
    this.addGlobalDownloadButton();
    this.addFileTreeButtons();
    this.addModuleDownloadButtons();
    this.addSectionDownloadButtons();
    this.addItemDownloadButtons();
    console.log(`Canvas Parser (v4.9) initialized: Found ${this.allAttachments.length} total attachments and ${this.allItems.length} total items.`);
  }

  extractCourseId() {
    const match = window.location.pathname.match(/\/courses\/(\d+)/);
    return match ? match[1] : null;
  }

  
  extractCourseName() {
    
    
    const breadcrumbCourseEl = document.querySelector('.ic-app-crumbs li:not(.home) a span.ellipsible');
    if (breadcrumbCourseEl) {
      return breadcrumbCourseEl.textContent.trim();
    }
    
    
    const ellipsibleElements = document.querySelectorAll('span.ellipsible');
    for (let el of ellipsibleElements) {
      
      const text = el.textContent.trim();
      if (text && !text.includes("My Dashboard") && !text.includes("Home") && text !== "Modules") {
        return text;
      }
    }
    
    
    const breadcrumb = document.querySelector('.ic-app-crumbs .home + a');
    if (breadcrumb) {
      return breadcrumb.textContent.trim();
    }
    
    
    const pageTitle = document.querySelector('.page-title');
    if (pageTitle) {
      const title = pageTitle.textContent.split('|')[0].trim();
      if (title && title !== "Modules") {
        return title;
      }
    }
    
    
    const docTitle = document.title.split(':')[0].trim();
    if (docTitle && docTitle !== "Modules") {
      return docTitle;
    }
    
    
    return 'Canvas Course';
  }

  parseModules() {
    const moduleElements = document.querySelectorAll('.context_module');
    moduleElements.forEach(moduleEl => {
      const module = this.parseModule(moduleEl);
      if (module) {
        
        if (module.title && (module.items.length > 0 || module.attachments.length > 0)) {
          this.modules.push(module);
          this.allAttachments.push(...module.attachments);
          this.allItems.push(...module.items);
        }
      }
    });
  }

  parseModule(moduleEl) {
    const titleEl = moduleEl.querySelector('.ig-header-title .name');
    if (!titleEl) return null;
    const moduleId = moduleEl.getAttribute('data-module-id');
    const title = titleEl.textContent.trim();
    const attachments = [];
    const items = [];
    
    
    
    const moduleItems = moduleEl.querySelectorAll('.context_module_item:not(.context_module_sub_header)');
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
    const titleEl = itemEl.querySelector('.ig-title');
    let title = '';
    
    
    if (titleEl) {
      title = titleEl.textContent.trim();
    } else {
      
      const altTitleEl = itemEl.querySelector('.title');
      if (altTitleEl) {
        title = altTitleEl.textContent.trim();
      } else {
        const moduleTitleEl = itemEl.querySelector('.module-item-title .item_name');
        if (moduleTitleEl) {
          title = moduleTitleEl.textContent.trim();
        }
      }
    }
    
    
    if (!title) {
      const anyTitleEl = itemEl.querySelector('[title]:not([title=""])');
      if (anyTitleEl && anyTitleEl.getAttribute('title')) {
        title = anyTitleEl.getAttribute('title').trim();
      }
    }
    
    if (!title) return null;
    
    const itemId = itemEl.id.replace('context_module_item_', '');
    
    
    let url = '';
    const linkEl = itemEl.querySelector('a.title, a.ig-title, .module-item-title a.item_link');
    if (linkEl && linkEl.href) {
      url = linkEl.href;
    }
    
    
    if (itemEl.classList.contains('external_url') && !url) {
      const externalLinkEl = itemEl.querySelector('a[href]:not([href="#"])');
      if (externalLinkEl && externalLinkEl.href) {
        url = externalLinkEl.href;
      }
    }
    
    
    let type = 'unknown';
    if (itemEl.classList.contains('attachment')) type = 'file';
    else if (itemEl.classList.contains('assignment')) type = 'assignment';
    else if (itemEl.classList.contains('quiz')) type = 'quiz';
    else if (itemEl.classList.contains('discussion-topic')) type = 'discussion';
    else if (itemEl.classList.contains('external-url') || itemEl.classList.contains('external_url')) type = 'link';
    else if (itemEl.classList.contains('external-tool')) type = 'external-tool';
    else if (itemEl.classList.contains('wiki-page')) type = 'page';
    else {
      
      const typeSpan = itemEl.querySelector('span.type');
      if (typeSpan && typeSpan.textContent) {
        const typeText = typeSpan.textContent.trim();
        if (typeText === 'external_url') type = 'link';
        else if (typeText === 'wiki_page') type = 'page';
        else if (typeText === 'assignment') type = 'assignment';
        else if (typeText === 'quiz') type = 'quiz';
        else if (typeText === 'discussion_topic') type = 'discussion';
      } else {
        if (itemEl.querySelector('.icon-assignment')) type = 'assignment';
        else if (itemEl.querySelector('.icon-quiz')) type = 'quiz';
        else if (itemEl.querySelector('.icon-discussion')) type = 'discussion';
        else if (itemEl.querySelector('.icon-document')) type = 'page';
        else if (itemEl.querySelector('.icon-link')) type = 'link';
      }
    }
    
    
    const downloadInfo = itemEl.classList.contains('attachment') ? 
      this.extractAttachmentInfo(itemEl) : null;
    
    return { 
      id: itemId, 
      title, 
      element: itemEl,
      type,
      url,
      downloadInfo
    };
  }

  parseSections() {
    this.modules.forEach(module => {
      const moduleItems = Array.from(module.element.querySelectorAll('.context_module_item'));
      
      
      const subHeaderIndices = moduleItems.map((item, index) => 
        item.classList.contains('context_module_sub_header') ? index : -1
      ).filter(index => index !== -1);
      
      
      for (let i = 0; i < subHeaderIndices.length; i++) {
        const startIdx = subHeaderIndices[i];
        const endIdx = (i < subHeaderIndices.length - 1) 
          ? subHeaderIndices[i + 1] 
          : moduleItems.length;
        
        const subHeaderEl = moduleItems[startIdx];
        const sectionTitle = subHeaderEl.querySelector('.title')?.textContent.trim() || 'Untitled Section';
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
        
        this.sections.push({
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
  }

  parseAttachment(itemEl) {
    const titleEl = itemEl.querySelector('.ig-title');
    if (!titleEl) return null;
    const title = titleEl.textContent.trim();
    const itemId = itemEl.id.replace('context_module_item_', '');
    const downloadInfo = this.extractAttachmentInfo(itemEl);
    if (!downloadInfo) return null;
    return { id: itemId, title, element: itemEl, downloadInfo };
  }

  extractAttachmentInfo(itemEl) {
    const classNames = itemEl.className;
    const attachmentMatch = classNames.match(/attachment_(\d+)/i);
    if (attachmentMatch) {
      const fileId = attachmentMatch[1];
      const downloadUrl = `/courses/${this.courseId}/files/${fileId}/download?download_frd=1`;
      return { fileId, downloadUrl, canDownload: true };
    }
    return null;
  }

  addGlobalDownloadButton() {
    const existingButton = document.querySelector('#cp-global-btn');
    if (existingButton) existingButton.remove();

    const headerBar = document.querySelector('.header-bar');
    if (!headerBar) return;

    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'btn';
    downloadBtn.id = 'cp-global-btn';
    downloadBtn.innerHTML = `📥 Download All (${this.allAttachments.length})`;
    downloadBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.downloadAllAttachments();
    });
    headerBar.prepend(downloadBtn);
  }

  addFileTreeButtons() {
    // Remove reference to MD button, only handle PDF button
    const existingButtons = document.querySelectorAll('#cp-filetree-pdf-btn');
    existingButtons.forEach(btn => btn.remove());

    const headerBar = document.querySelector('.header-bar');
    if (!headerBar) return;
    
    // Only create the PDF button
    const pdfBtn = document.createElement('button');
    pdfBtn.className = 'btn';
    pdfBtn.id = 'cp-filetree-pdf-btn';
    pdfBtn.style.marginLeft = '5px';
    pdfBtn.innerHTML = `📄 PDF Tree`;
    pdfBtn.title = 'Download course structure as PDF';
    
    pdfBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.downloadPdfTree();
    });
    
    // Add the PDF button to the header
    const globalBtn = document.querySelector('#cp-global-btn');
    if (globalBtn && globalBtn.nextSibling) {
      headerBar.insertBefore(pdfBtn, globalBtn.nextSibling);
    } else {
      headerBar.prepend(pdfBtn);
    }
  }

  async downloadPdfTree() {
    const btn = document.getElementById('cp-filetree-pdf-btn');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '⏳ Generating PDF tree...';

    try {
      // Generate the HTML content
      const html = this.generateHtmlForPdf();
      
      // Generate timestamp
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10);
      const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '-');
      
      // Sanitize course name for filename
      const courseName = this.courseName.replace(/[^\w\s-]/g, '_').trim();
      
      // Open in a new window
      const printWindow = window.open('', '_blank');
      printWindow.document.write(html);
      printWindow.document.title = `${this.courseName} - Modules Structure`;
      printWindow.document.close();
      
      // Wait for content to load, then print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          btn.innerHTML = '✅ PDF tree ready';
          
          setTimeout(() => {
            btn.innerHTML = originalText;
            btn.disabled = false;
          }, 3000);
        }, 500);
      };
    } catch (error) {
      console.error('Failed to generate PDF tree:', error);
      btn.innerHTML = '❌ PDF tree generation failed';
      
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.disabled = false;
      }, 3000);
    }
  }

  // Generate HTML for PDF tree
  generateHtmlForPdf() {
    // Format date and time
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    const seconds = String(now.getUTCSeconds()).padStart(2, '0');
    const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    
    // Get current user
    const currentUser = document.querySelector('#global_nav_profile_link .menu-item__text')?.textContent.trim() || 'Unknown User';
    
    // Icons for item types
    const typeIcons = {
      file: '📄',
      assignment: '📝',
      quiz: '❓',
      discussion: '💬',
      page: '📄',
      link: '🔗',
      'external-tool': '🧰',
      unknown: '📎'
    };
    
    // Build HTML template
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.courseName} - Modules Structure</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      margin: 20px;
      color: #333;
    }
    h1 {
      color: #0057a0;
      border-bottom: 2px solid #0057a0;
      padding-bottom: 10px;
    }
    h2 {
      color: #0057a0;
      margin-top: 20px;
      border-bottom: 1px solid #ccc;
      padding-bottom: 5px;
    }
    h3 {
      color: #555;
      margin-top: 15px;
      margin-left: 20px;
      background-color: #f5f5f5;
      padding: 5px 10px;
      border-left: 3px solid #0057a0;
      font-size: 1.2em;
    }
    .day-header {
      font-weight: bold;
      color:rgb(32, 54, 255);
      font-size: 1.2em;
      margin-left: 25px;
      margin-top: 15px;
      margin-bottom: 10px;
      padding-left: 5px;
      border-bottom: 1px dashedrgb(92, 49, 245);
      display: inline-block;
    }
    .metadata {
      background-color: #f5f5f5;
      padding: 10px;
      border-radius: 5px;
      margin-bottom: 20px;
    }
    .metadata p {
      margin: 5px 0;
    }
    .module-item {
      margin: 8px 0;
      margin-left: 40px;
    }
    .section-item {
      margin: 8px 0;
      margin-left: 60px;
    }
    .item-type {
      font-weight: bold;
      color: #555;
    }
    hr {
      border: 0;
      height: 1px;
      background: #ddd;
      margin: 20px 0;
    }
    a {
      color: #0057a0;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    .user-subtitle {
      font-size: 0.85em;
      color: #666;
      font-style: italic;
      margin-left: 5px;
    }
    @media print {
      body { font-size: 12pt; }
      h1 { font-size: 18pt; }
      h2 { font-size: 16pt; }
      h3 { font-size: 14pt; }
      .day-header { font-size: 13pt; color:rgb(103, 59, 169); }
    }
  </style>
</head>
<body>
  <h1>${this.courseName} - Modules Structure</h1>
  <div class="metadata">
    <p><strong>Course ID:</strong> ${this.courseId}</p>
    <p><strong>Current User's Login:</strong> ${currentUser} <span class="user-subtitle">- Canvas Student Account</span></p>
    <p><strong>Total Items:</strong> ${this.allItems.length}</p>
    <p><strong>Total Files:</strong> ${this.allAttachments.length}</p>
    <p><strong>Total Modules:</strong> ${this.modules.length}</p>
  </div>`;
    
    // Add modules
    this.modules.forEach((module, moduleIndex) => {
      html += `<h2>${moduleIndex + 1}. ${module.title}</h2>`;
      
      // Find sections for this module
      const moduleSections = this.sections.filter(s => s.moduleId === module.id);
      
      if (moduleSections.length === 0) {
        // If no sections, list items directly under the module
        if (module.items.length > 0) {
          module.items.forEach((item, itemIndex) => {
            const icon = typeIcons[item.type] || typeIcons.unknown;
            const itemLink = item.url ? `<a href="${item.url}" target="_blank">${item.title}</a>` : item.title;
            html += `<div class="module-item">${icon} <span class="item-type">${item.type.toUpperCase()}:</span> ${itemLink}</div>`;
          });
        } else {
          html += `<div class="module-item"><em>No items in this module</em></div>`;
        }
      } else {
        // If there are sections, group items by section
        moduleSections.forEach((section, sectionIndex) => {
          // Check if this is a "Day X" section
          const isDaySection = /^Day\s+\d+$/i.test(section.title.trim());
          
          if (isDaySection) {
            html += `<div class="day-header">🗓️ ${section.title}</div>`;
          } else {
            html += `<h3>${moduleIndex + 1}.${sectionIndex + 1}. ${section.title}</h3>`;
          }
          
          if (section.items.length > 0) {
            section.items.forEach((item, itemIndex) => {
              const icon = typeIcons[item.type] || typeIcons.unknown;
              const itemLink = item.url ? `<a href="${item.url}" target="_blank">${item.title}</a>` : item.title;
              html += `<div class="section-item">${icon} <span class="item-type">${item.type.toUpperCase()}:</span> ${itemLink}</div>`;
            });
          } else {
            html += `<div class="section-item"><em>No items in this section</em></div>`;
          }
        });
      }
      
      // Add separator between modules
      html += `<hr>`;
    });
    
    html += `</body></html>`;
    
    return html;
  }

  downloadTextFile(text, filename) {
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  addModuleDownloadButtons() {
    this.modules.forEach(module => {
      if (module.attachments.length === 0) return;

      const createButton = () => {
        const buttonContainer = document.createElement('span');
        buttonContainer.className = 'cp-module-controls'; 

        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'Button Button--small';
        downloadBtn.innerHTML = `📥 Download Module (${module.attachments.length})`;
        downloadBtn.title = `Download all attachments in ${module.title}`;
        
        downloadBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          this.downloadModuleAttachments(module);
        });

        buttonContainer.appendChild(downloadBtn);
        return buttonContainer;
      };

      module.element.querySelectorAll('.cp-module-controls').forEach(btn => btn.remove());

      const nameSpanExpanded = module.element.querySelector('.collapse_module_link .name');
      const nameSpanCollapsed = module.element.querySelector('.expand_module_link .name');
      
      if (nameSpanExpanded) {
        nameSpanExpanded.appendChild(createButton());
      }
      if (nameSpanCollapsed) {
        nameSpanCollapsed.appendChild(createButton());
      }
    });
  }

  addSectionDownloadButtons() {
    this.sections.forEach(section => {
      if (section.attachments.length === 0) return;
      
      // Remove existing button if any
      const existingBtn = section.element.querySelector('.cp-section-controls');
      if (existingBtn) existingBtn.remove();
      
      // Create button container
      const buttonContainer = document.createElement('span');
      buttonContainer.className = 'cp-section-controls';
      buttonContainer.style.marginLeft = '10px';
      buttonContainer.style.display = 'inline-block';
      buttonContainer.style.verticalAlign = 'middle';
      
      // Create download button
      const downloadBtn = document.createElement('button');
      downloadBtn.className = 'Button Button--small';
      downloadBtn.innerHTML = `📥 Section (${section.attachments.length})`;
      downloadBtn.title = `Download all attachments in section "${section.title}"`;
      downloadBtn.style.fontSize = '12px';
      downloadBtn.style.padding = '2px 6px';
      
      // Add click handler
      downloadBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        this.downloadSectionAttachments(section);
      });
      
      buttonContainer.appendChild(downloadBtn);
      
      // Append to section title
      const titleEl = section.element.querySelector('.module-item-title');
      if (titleEl) {
        titleEl.appendChild(buttonContainer);
      }
    });
  }

  addItemDownloadButtons() {
    this.allAttachments.forEach(attachment => {
      const titleEl = attachment.element.querySelector('.ig-title');
      if (!titleEl) return;
      const existingBtn = attachment.element.querySelector('.cp-item-controls');
      if (existingBtn) existingBtn.remove();
      const buttonContainer = document.createElement('span');
      buttonContainer.className = 'cp-item-controls';
      buttonContainer.addEventListener('click', e => e.preventDefault());
      
      const downloadBtn = document.createElement('button');
      downloadBtn.className = 'Button Button--small'; 
      downloadBtn.innerHTML = '📥 Download';
      downloadBtn.title = 'Direct Download';

      downloadBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.downloadFile(attachment.downloadInfo.downloadUrl, attachment.title);
      });

      buttonContainer.appendChild(downloadBtn);
      titleEl.parentNode.insertBefore(buttonContainer, titleEl.nextSibling);
    });
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async downloadAllAttachments() {
    if (this.allAttachments.length === 0) {
      alert('No downloadable attachments found.');
      return;
    }
    if (!confirm(`Are you sure you want to download ${this.allAttachments.length} attachments one by one?`)) return;
    const btn = document.getElementById('cp-global-btn');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    for (let i = 0; i < this.allAttachments.length; i++) {
      const attachment = this.allAttachments[i];
      btn.textContent = `⏳ (${i + 1}/${this.allAttachments.length}) ${attachment.title}`;
      this.downloadFile(attachment.downloadInfo.downloadUrl, attachment.title);
      await this.delay(500);
    }
    btn.innerHTML = `✅ All download commands sent`;
    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }, 3000);
  }

  async downloadModuleAttachments(module) {
    if (module.attachments.length === 0) return;
    if (!confirm(`Are you sure you want to download all ${module.attachments.length} attachments in "${module.title}"?`)) return;
    
    // Get all buttons
    const buttons = module.element.querySelectorAll('.cp-module-controls .Button');
    const originalTexts = Array.from(buttons).map(btn => btn.textContent);
    
    // Disable buttons and set initial text
    buttons.forEach(btn => {
      btn.disabled = true;
      btn.textContent = '⏳ Starting downloads...';
    });
    
    try {
      // Download each attachment one by one
      for (let i = 0; i < module.attachments.length; i++) {
        const attachment = module.attachments[i];
        const progress = `⏳ (${i + 1}/${module.attachments.length}) ${attachment.title}`;
        
        // Update all buttons with current progress
        buttons.forEach(btn => {
          btn.textContent = progress;
        });
        
        // Download the file
        this.downloadFile(attachment.downloadInfo.downloadUrl, attachment.title);
        
        // Wait a bit before next download
        await this.delay(600);
      }
      
      // Show success message
      buttons.forEach(btn => {
        btn.textContent = `✅ Downloaded ${module.attachments.length} files`;
      });
    } catch (error) {
      console.error('Download failed:', error);
      buttons.forEach(btn => {
        btn.textContent = '❌ Download error';
      });
    }
    
    // Reset buttons after a delay
    setTimeout(() => {
      buttons.forEach((btn, i) => {
        btn.textContent = originalTexts[i];
        btn.disabled = false;
      });
    }, 3000);
  }

  async downloadSectionAttachments(section) {
    if (section.attachments.length === 0) return;
    if (!confirm(`Are you sure you want to download all ${section.attachments.length} attachments in section "${section.title}"?`)) return;
    
    // Get the button
    const button = section.element.querySelector('.cp-section-controls .Button');
    if (!button) return;
    
    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = '⏳ Starting downloads...';
    
    try {
      // Download each attachment one by one
      for (let i = 0; i < section.attachments.length; i++) {
        const attachment = section.attachments[i];
        button.textContent = `⏳ (${i + 1}/${section.attachments.length}) ${attachment.title}`;
        
        // Download the file
        this.downloadFile(attachment.downloadInfo.downloadUrl, attachment.title);
        
        // Wait a bit before next download
        await this.delay(600);
      }
      
      // Show success message
      button.textContent = `✅ Downloaded ${section.attachments.length} files`;
    } catch (error) {
      console.error('Section download failed:', error);
      button.textContent = '❌ Download error';
    }
    
    // Reset button after a delay
    setTimeout(() => {
      button.textContent = originalText;
      button.disabled = false;
    }, 3000);
  }

  downloadFile(url, filename) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || '';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}


function initializeParser() {
  if (window.location.pathname.includes('/modules')) {
    try {
      new CanvasParser();
    } catch (error) {
      console.error("Canvas Parser initialization failed:", error);
    }
  }
}

let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;

    setTimeout(initializeParser, 500);
  }
}).observe(document, { subtree: true, childList: true });


setTimeout(initializeParser, 500);