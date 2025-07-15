/**
 * File tree generators for Canvas courses
 */
class FileTreeGenerator {
  constructor(courseId, courseName, modules, sections, allItems, allAttachments) {
    this.courseId = courseId;
    this.courseName = courseName;
    this.modules = modules;
    this.sections = sections;
    this.allItems = allItems;
    this.allAttachments = allAttachments;
  }
  
  generateMarkdownTree() {
    const currentUser = CourseExtractor.getCurrentUser();
    const typeIcons = CONFIG.TYPE_ICONS;
    
    let md = `# ${this.courseName} - Modules Structure\n\n`;
    md += `- **Course ID:** ${this.courseId}\n`;
    md += `- **Current User's Login:** ${currentUser} *- Canvas Student Account*\n`;
    md += `- **Total Items:** ${this.allItems.length}\n`;
    md += `- **Total Files:** ${this.allAttachments.length}\n`;
    md += `- **Total Modules:** ${this.modules.length}\n`;
    md += `---\n\n`;
    
    this.modules.forEach((module, moduleIndex) => {
      md += `## ${moduleIndex + 1}. ${module.title}\n\n`;
      
      const moduleSections = this.sections.filter(s => s.moduleId === module.id);
      
      if (moduleSections.length === 0) {
        if (module.items.length > 0) {
          module.items.forEach(item => {
            const icon = typeIcons[item.type] || typeIcons.unknown;
            const linkText = item.url ? `[${item.title}](${item.url})` : item.title;
            md += `- ${icon} **${item.type.toUpperCase()}:** ${linkText}\n`;
          });
        } else {
          md += `- *No items in this module*\n`;
        }
      } else {
        moduleSections.forEach((section, sectionIndex) => {
          const isDaySection = /^Day\s+\d+$/i.test(section.title.trim());
          
          if (isDaySection) {
            md += `### 🗓️ ${section.title}\n\n`;
          } else {
            md += `### ${moduleIndex + 1}.${sectionIndex + 1}. ${section.title}\n\n`;
          }
          
          if (section.items.length > 0) {
            section.items.forEach(item => {
              const icon = typeIcons[item.type] || typeIcons.unknown;
              const linkText = item.url ? `[${item.title}](${item.url})` : item.title;
              md += `- ${icon} **${item.type.toUpperCase()}:** ${linkText}\n`;
            });
          } else {
            md += `- *No items in this section*\n`;
          }
          
          md += `\n`;
        });
      }
      
      md += `---\n\n`;
    });
    
    return md;
  }
  
  generateHtmlForPdf() {
    const currentUser = CourseExtractor.getCurrentUser();
    const typeIcons = CONFIG.TYPE_ICONS;
    
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
      color: rgb(32, 54, 255);
      font-size: 1.2em;
      margin-left: 25px;
      margin-top: 15px;
      margin-bottom: 10px;
      padding-left: 5px;
      border-bottom: 1px dashed rgb(92, 49, 245);
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
      .day-header { font-size: 13pt; color: rgb(103, 59, 169); }
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
    
    this.modules.forEach((module, moduleIndex) => {
      html += `<h2>${moduleIndex + 1}. ${module.title}</h2>`;
      
      const moduleSections = this.sections.filter(s => s.moduleId === module.id);
      
      if (moduleSections.length === 0) {
        if (module.items.length > 0) {
          module.items.forEach(item => {
            const icon = typeIcons[item.type] || typeIcons.unknown;
            const itemLink = item.url ? `<a href="${item.url}" target="_blank">${item.title}</a>` : item.title;
            html += `<div class="module-item">${icon} <span class="item-type">${item.type.toUpperCase()}:</span> ${itemLink}</div>`;
          });
        } else {
          html += `<div class="module-item"><em>No items in this module</em></div>`;
        }
      } else {
        moduleSections.forEach((section, sectionIndex) => {
          const isDaySection = /^Day\s+\d+$/i.test(section.title.trim());
          
          if (isDaySection) {
            html += `<div class="day-header">🗓️ ${section.title}</div>`;
          } else {
            html += `<h3>${moduleIndex + 1}.${sectionIndex + 1}. ${section.title}</h3>`;
          }
          
          if (section.items.length > 0) {
            section.items.forEach(item => {
              const icon = typeIcons[item.type] || typeIcons.unknown;
              const itemLink = item.url ? `<a href="${item.url}" target="_blank">${item.title}</a>` : item.title;
              html += `<div class="section-item">${icon} <span class="item-type">${item.type.toUpperCase()}:</span> ${itemLink}</div>`;
            });
          } else {
            html += `<div class="section-item"><em>No items in this section</em></div>`;
          }
        });
      }
      
      html += `<hr>`;
    });
    
    html += `</body></html>`;
    
    return html;
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FileTreeGenerator;
}