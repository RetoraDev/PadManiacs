(function (global) {
  "use strict";

  class DokiDocs {
    constructor() {
      this.version = "1.1.0";
      this.tags = {};
      this.init();
    }

    init() {
      // Register default tags
      this.registerDefaultTags();
    }

    registerDefaultTags() {
      this.tags = {
        // Simple tags
        title: (content, args) => this.createTag("doki-title", content, args),
        heading: (content, args) => this.createTag("doki-heading", content, args),
        subheading: (content, args) => this.createTag("doki-subheading", content, args),
        p: (content, args) => this.createTag("doki-paragraph", content, args),
        paragraph: (content, args) => this.createTag("doki-paragraph", content, args),
        code: (content, args) => this.createInlineCode(content, args),
        link: (content, args) => this.createLink(content, args),
        img: (content, args) => this.createImage(content, args),
        image: (content, args) => this.createImage(content, args),
        video: (content, args) => this.createVideo(content, args),
        iframe: (content, args) => this.createIframe(content, args),
        citation: (content, args) => this.createTag("doki-citation", content, args),
        credit: (content, args) => this.createTag("doki-credit", content, args),
        footer: (content, args) => this.createTag("doki-footer", content, args),
        tab: (content, args) => this.createTag("doki-tab", content, args),
        frame: (content, args) => this.createTag("doki-frame", content, args),
        note: (content, args) => this.createTag("doki-note", content, args),
        warning: (content, args) => this.createTag("doki-warning", content, args),
        danger: (content, args) => this.createTag("doki-danger", content, args),

        // Block tags
        codeblock: (content, args) => this.createCodeBlock(content, args),
        table: (content, args) => this.createTable(content, args),
        list: (content, args) => this.createList(content, args)
      };
    }

    createTag(tagName, content, args = []) {
      const element = document.createElement(tagName);
      element.innerHTML = this.processContent(content);

      // Add arguments as data attributes
      args.forEach((arg, index) => {
        if (arg.includes("=")) {
          const [key, value] = arg.split("=");
          element.setAttribute(`data-${key}`, value);
        } else {
          element.setAttribute(`data-arg-${index}`, arg);
        }
      });

      return element;
    }
    
    createInlineCode(content, args) {
      const element = document.createElement("doki-inline-code");
      const code = document.createElement("code");
      code.textContent = content;
      
      // Set language class for highlight.js
      if (args.length > 0) {
        code.className = `language-${args[0]}`;
      } else {
        code.className = 'language-plaintext';
      }
      
      code.setAttribute("translate", "no");
      element.appendChild(code);
      
      return element;
    }
    
    createCodeBlock(content, args, inline) {
      if (inline) {
        return this.createInlineCode(content, args);
      }
      
      const element = document.createElement("doki-code-block-container");
      const block = document.createElement("doki-code-block");
      
      // For code blocks, use <pre><code> structure required by Highlight.js
      const pre = document.createElement("pre");
      const code = document.createElement("code");
      
      // Normalize indentation by removing common leading whitespace
      const normalizedContent = this.normalizeCodeBlock(content);
      code.innerHTML = normalizedContent;
      
      // Set language class for highlight.js
      if (args.length > 0) {
        code.className = `language-${args[0]}`;
      } else {
        code.className = 'language-plaintext';
      }
      
      code.setAttribute("translate", "no");
      code.setAttribute("data-original-content", normalizedContent);
      
      pre.appendChild(code);
      block.appendChild(pre);
      element.appendChild(block);
      
      return element;
    }

    normalizeCodeBlock(content) {
      if (!content) return '';
      
      let lines = content.split('\n');
      
      // Trim empty lines from start and end
      while (lines.length > 0 && lines[0].trim() === '') {
        lines.shift();
      }
      while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
        lines.pop();
      }
      
      if (lines.length === 0) return '';
      
      // Special case: if we only have one line, just trim it
      if (lines.length === 1) {
        return lines[0].trim();
      }
      
      // Find the minimum indentation from non-empty lines (excluding the very first line)
      let minIndent = Infinity;
      for (let i = 1; i < lines.length; i++) { // Start from second line
        const line = lines[i];
        if (line.trim().length === 0) continue;
        const indent = line.match(/^[ \t]*/)[0].length;
        if (indent < minIndent) {
          minIndent = indent;
        }
      }
      
      // If we didn't find any indentation in subsequent lines, use the first line's indentation
      if (minIndent === Infinity) {
        minIndent = lines[0].match(/^[ \t]*/)[0].length;
      }
      
      // Ensure we don't remove more characters than any line has
      const normalizedLines = lines.map(line => {
        if (!line.startsWith(" ")) return line;
        
        if (line.trim().length === 0) {
          return line;
        }
        // Only remove up to the actual length of the line
        const removeCount = Math.min(minIndent, line.length);
        return line.substring(removeCount);
      });
      
      return normalizedLines.join('\n');
    }    
    
    createList(content, args) {
      const element = document.createElement('doki-list');
      const items = content.trim().split('\n').filter(item => item.trim());
      
      // Determine list type and format
      const firstItem = items[0]?.trim() || '';
      let listType = 'unordered';
      let bulletType = '*';
      let numberFormat = '#.';
      
      // Detect list type from first item
      if (firstItem.match(/^\d+[\.\)\-]/)) {
        listType = 'ordered';
        
        // Detect number format
        if (firstItem.match(/^\d+\./)) {
          numberFormat = '#.';
        } else if (firstItem.match(/^\d+\)\./)) {
          numberFormat = '(#).';
        } else if (firstItem.match(/^\d+\)/)) {
          numberFormat = '(#)';
        } else if (firstItem.match(/^\d+\)-/)) {
          numberFormat = '(#)-';
        } else if (firstItem.match(/^\d+-/)) {
          numberFormat = '#-';
        }
      } else {
        // Detect bullet type for unordered lists
        const firstChar = firstItem.charAt(0);
        if (['-', '•', '*', '~'].includes(firstChar)) {
          bulletType = firstChar;
        }
      }
      
      element.setAttribute('data-type', listType);
      if (listType === 'unordered') {
        element.setAttribute('data-bullet', bulletType);
      } else {
        element.setAttribute('data-format', numberFormat);
      }
      
      // Process list items
      items.forEach(item => {
        const listItem = document.createElement('doki-list-item');
        
        // Remove the bullet/number prefix and trim
        let itemContent = item.trim();
        if (listType === 'unordered') {
          itemContent = itemContent.substring(1).trim();
        } else {
          itemContent = itemContent.replace(/^(\d+[\.\)\-]\s*)/, '').trim();
        }
        
        listItem.innerHTML = this.processContent(itemContent);
        element.appendChild(listItem);
      });
      
      return element;
    }

    createLink(content, args) {
      const element = document.createElement("a");
      element.textContent = content;

      let href = content;
      let target = "";
      
      if (args.length > 0) {
        href = args[0];
        
        if (args.length > 1) {
          target = args[1];
        }
      }

      element.href = href;
      element.target = target;

      return element;
    }

    createImage(content, args) {
      const element = document.createElement("doki-image");
      const image = document.createElement("img");
      image.src = content;

      args.forEach(arg => {
        if (arg.startsWith("width=")) {
          element.style.width = arg.split("=")[1];
        } else if (arg.startsWith("height=")) {
          element.style.height = arg.split("=")[1];
        } else if (arg.startsWith("alt=")) {
          image.alt = arg.split("=")[1];
        }
      });
      
      element.appendChild(image);

      return element;
    }

    createVideo(content, args) {
      const element = document.createElement("doki-video");
      const video = document.createElement("video");
      video.src = content;
      video.controls = true;

      args.forEach(arg => {
        if (arg.startsWith("width=")) {
          video.style.width = arg.split("=")[1];
        } else if (arg.startsWith("height=")) {
          video.style.height = arg.split("=")[1];
        } else if (arg === "autoplay") {
          video.autoplay = true;
        } else if (arg === "loop") {
          video.loop = true;
        } else if (arg === "muted") {
          video.muted = true;
        }
      });

      element.appendChild(video);
      return element;
    }

    createIframe(content, args) {
      const element = document.createElement("doki-iframe");
      const iframe = document.createElement("iframe");
      iframe.src = content;

      args.forEach(arg => {
        if (arg.startsWith("width=")) {
          iframe.style.width = arg.split("=")[1];
        } else if (arg.startsWith("height=")) {
          iframe.style.height = arg.split("=")[1];
        } else if (arg.startsWith("title=")) {
          iframe.title = arg.split("=")[1];
        }
      });

      element.appendChild(iframe);
      return element;
    }

    createTable(content, args) {
      // Create container for horizontal scrolling
      const container = document.createElement('doki-table-container');
      const element = document.createElement('doki-table');
      
      const rows = content.trim().split('\n');
      
      // First, parse all rows to find the maximum number of columns
      let maxColumns = 0;
      const parsedRows = rows.map(row => {
        const cells = row.trim().slice(1, -1).split('|').map(cell => cell.trim());
        maxColumns = Math.max(maxColumns, cells.length);
        return cells;
      });
      
      // Process each row
      parsedRows.forEach((cells, rowIndex) => {
        const rowElement = document.createElement('doki-table-row');
        
        // Fill missing cells with empty content to match max columns
        while (cells.length < maxColumns) {
          cells.push('');
        }
        
        cells.forEach((cell, cellIndex) => {
          let cellElement;
          
          if (rowIndex === 0 && args.includes('header')) {
            cellElement = document.createElement('doki-table-header');
          } else {
            cellElement = document.createElement('doki-table-cell');
          }
          
          cellElement.innerHTML = this.processContent(cell);
          rowElement.appendChild(cellElement);
        });
        
        element.appendChild(rowElement);
      });
      
      container.appendChild(element);
      return container;
    }
    
    processContent(content) {
      // Process nested Doki tags in content
      return this.parseInlineTags(content);
    }

    parseInlineTags(text) {
      return text.replace(/\[([^\]:]+):\s*"([^"]*)"\s*([^\]]*)\]/g, (match, tagName, content, argsStr) => {
        const args = argsStr
          .trim()
          .split(/\s+/)
          .filter(arg => arg);

        if (this.tags[tagName]) {
          const element = this.tags[tagName](content, args);
          return element.outerHTML;
        }

        return match;
      });
    }

    parseBlockTags(html) {
      const blockRegex = /\[(\w+)([^\]]*)\]([\s\S]*?)\[\/\1\]/g;

      return html.replace(blockRegex, (match, tagName, argsStr, content) => {
        const args = argsStr
          .trim()
          .split(/\s+/)
          .filter(arg => arg);

        if (this.tags[tagName]) {
          const element = this.tags[tagName](content.trim(), args);
          return element.outerHTML;
        }

        return match;
      });
    }

    parse(html) {
      let result = this.parseBlockTags(html);
      result = this.parseInlineTags(result);
      return result;
    }

    processElement(element = document.body) {
      const html = element.innerHTML;
      element.innerHTML = this.parse(html);
      this.applySyntaxHighlighting();
    }

    applySyntaxHighlighting() {
      this.loadHighlightJS();
    }
    
    loadHighlightJS() {
      const scripts = document.getElementsByTagName('script');
      let scriptPath = null;
      
      for (let i = 0; i < scripts.length; i++) {
        if (window.dokiDocsLocation) break;
        
        const src = scripts[i].src;
        if (src && src.includes('doki-docs.js')) {
          scriptPath = src.substring(0, src.lastIndexOf('/') + 1);
          break;
        }
      }
      
      if (!scriptPath) {
        scriptPath = window.dokiDocsLocation || './';
      }
    
      // Try to load local highlight.js files
      this.tryLoadLocalHighlightJS(scriptPath);
    }
    
    tryLoadLocalHighlightJS(scriptPath) {
      console.log('loading hljs from', scriptPath);
      
      const minifiedScript = document.createElement('script');
      minifiedScript.src = scriptPath + 'highlight.min.js';
      
      minifiedScript.onload = () => this.initializeHighlightJS();
      minifiedScript.onerror = () => {
        // If minified fails, try non-minified
        const regularScript = document.createElement('script');
        regularScript.src = scriptPath + 'highlight.js';
        
        regularScript.onload = () => this.initializeHighlightJS();
        regularScript.onerror = () => {
          // If both local files fail, load from CDN
          this.loadHighlightJSFromCDN();
        };
        
        document.head.appendChild(regularScript);
      };
      
      document.head.appendChild(minifiedScript);
    }
    
    loadHighlightJSFromCDN() {
      const cdnScript = document.createElement('script');
      cdnScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js';
      
      cdnScript.onload = () => this.initializeHighlightJS();
      cdnScript.onerror = () => {
        // Nothing left to do. We couldn't find it
      };
      
      document.head.appendChild(cdnScript);
    }
    
    initializeHighlightJS() {
      if (window.hljs && typeof window.hljs.highlightAll === 'function') {
        const codeBlocks = document.querySelectorAll('doki-code-block-container');
        codeBlocks.forEach(block => {
          if (block.querySelector('doki-code-block') && block.querySelector('code')) {
            const code = block.querySelector('code');
            if (code) {
              const content = code.textContent;
              const copyButton = document.createElement('button');
              copyButton.className = 'doki-copy-button';
              copyButton.textContent = 'Copy';
              copyButton.setAttribute('aria-label', 'Copy code to clipboard');
              
              copyButton.addEventListener('click', async () => {
                try {
                  await navigator.clipboard.writeText(content);
                  copyButton.textContent = 'Copied!';
                  copyButton.classList.add('copied');
                  
                  setTimeout(() => {
                    copyButton.textContent = 'Copy';
                    copyButton.classList.remove('copied');
                  }, 500);
                } catch (err) {
                  console.error('Failed to copy code: ', err);
                 }
              });
              
              block.appendChild(copyButton);
              
              hljs.highlightElement(code);
            }
          }
        });
        
        const inlineCodeBlocks = document.querySelectorAll('doki-inline-code');
        inlineCodeBlocks.forEach(block => {
          if (block.querySelector('code')) {
            const code = block.querySelector('code');
            if (code) {
              hljs.highlightElement(code);
            }
          }
        });
      }
    }
        
    registerTag(tagName, handler) {
      this.tags[tagName] = handler;
    }

    // Node.js compatibility
    static init() {
      if (typeof window !== "undefined") {
        window.DokiDocs = DokiDocs;

        // Auto-initialize when DOM is ready
        if (document.readyState === "loading") {
          document.addEventListener("DOMContentLoaded", () => {
            const doki = new DokiDocs();
            doki.processElement();
            document.body.classList.remove("doki-hidden");
          });
        } else {
          const doki = new DokiDocs();
          doki.processElement();
          document.body.classList.remove("doki-hidden");
        }
      }
      return DokiDocs;
    }
  }

  // Export for different environments
  if (typeof module !== "undefined" && module.exports) {
    module.exports = DokiDocs;
  } else if (typeof define === "function" && define.amd) {
    define([], () => DokiDocs);
  } else {
    global.DokiDocs = DokiDocs;
    DokiDocs.init();
  }
})(typeof window !== "undefined" ? window : global);
