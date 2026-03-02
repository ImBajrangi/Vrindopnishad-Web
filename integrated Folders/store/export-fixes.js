// Replace the existing exportHTML() function
exportHTML() {
    try {
        const title = document.getElementById('display-title').textContent || 'Untitled Document';
        const author = document.getElementById('author-name').value || '';
        const tags = document.getElementById('content-tags').value || '';
        const body = document.getElementById('content-body').innerHTML;
        const quality = document.getElementById('export-quality').value || 'medium';
        
        // Enhanced HTML cleaning for export
        const cleanBody = this.cleanHTMLForExport(body);
        
        const exportHTML = this.generateExportHTML(title, author, tags, cleanBody, quality);
        
        // Create and trigger download
        const blob = new Blob([exportHTML], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = this.sanitizeFileName(title) + '.html';
        
        // Ensure the link is added to DOM for some browsers
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the URL
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        
        this.showNotification('HTML exported successfully');
        
    } catch (error) {
        console.error('Export error:', error);
        this.showNotification('Export failed. Please try again.', 'error');
    }
}

// Enhanced HTML cleaning function
cleanHTMLForExport(html) {
    let cleanHTML = html;
    
    try {
        // Remove drag handles and delete buttons
        cleanHTML = cleanHTML.replace(/<div class="drag-handle"[^>]*>[\s\S]*?<\/div>/gi, '');
        cleanHTML = cleanHTML.replace(/<button class="delete-btn"[^>]*>[\s\S]*?<\/button>/gi, '');
        
        // Remove editable classes while preserving other classes
        cleanHTML = cleanHTML.replace(/class="([^"]*?)editable-item([^"]*?)"/gi, (match, before, after) => {
            const newClasses = (before + after).trim();
            return newClasses ? `class="${newClasses}"` : '';
        });
        
        // Fix iframe attributes for better compatibility
        cleanHTML = cleanHTML.replace(/<iframe([^>]*)>/gi, (match, attrs) => {
            // Ensure proper iframe attributes
            if (!attrs.includes('loading=')) {
                attrs += ' loading="lazy"';
            }
            if (!attrs.includes('title=')) {
                attrs += ' title="Embedded content"';
            }
            return `<iframe${attrs}>`;
        });
        
        // Ensure all media elements have proper error handling
        cleanHTML = cleanHTML.replace(/<video([^>]*)>/gi, (match, attrs) => {
            if (!attrs.includes('controls')) {
                attrs += ' controls';
            }
            if (!attrs.includes('preload=')) {
                attrs += ' preload="metadata"';
            }
            return `<video${attrs}>`;
        });
        
        cleanHTML = cleanHTML.replace(/<audio([^>]*)>/gi, (match, attrs) => {
            if (!attrs.includes('controls')) {
                attrs += ' controls';
            }
            if (!attrs.includes('preload=')) {
                attrs += ' preload="metadata"';
            }
            return `<audio${attrs}>`;
        });
        
        // Clean up empty elements
        cleanHTML = cleanHTML.replace(/<[^>]+class\s*=\s*[""'][\s]*[""'][^>]*>/gi, (match) => {
            return match.replace(/class\s*=\s*[""'][\s]*[""']/gi, '');
        });
        
        // Remove empty class attributes
        cleanHTML = cleanHTML.replace(/\s+class\s*=\s*[""']\s*[""']/gi, '');
        
        // Normalize whitespace
        cleanHTML = cleanHTML.replace(/\s+/g, ' ').replace(/>\s+</g, '><');
        
        return cleanHTML;
        
    } catch (error) {
        console.error('HTML cleaning error:', error);
        return html; // Return original if cleaning fails
    }
}

// Enhanced export HTML generation
generateExportHTML(title, author, tags, body, quality) {
    const timestamp = new Date().toISOString();
    const compressionLevel = this.getCompressionLevel(quality);
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>${this.sanitizeText(title)}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="Content created with Vrindopnishad CMS">
    <meta name="author" content="${this.sanitizeText(author)}">
    <meta name="keywords" content="${this.sanitizeText(tags)}">
    <meta name="generator" content="Vrindopnishad CMS">
    <meta name="created" content="${timestamp}">
    <style>
        ${this.generateExportCSS(compressionLevel)}
    </style>
</head>
<body>
    <div class="container">
        <header class="document-header">
            <h1 class="document-title">${this.sanitizeText(title)}</h1>
            ${author ? `<p class="document-author">By ${this.sanitizeText(author)}</p>` : ''}
            ${tags ? `<div class="document-tags">${this.sanitizeText(tags).split(',').map(tag => `<span class="tag">${tag.trim()}</span>`).join('')}</div>` : ''}
        </header>
        <main class="document-content">
            ${body}
        </main>
        <footer class="document-footer">
            <p>Created with Vrindopnishad CMS on ${new Date().toLocaleDateString()}</p>
        </footer>
    </div>
    
    <script>
        // Error handling for media elements
        document.addEventListener('DOMContentLoaded', function() {
            // Handle video loading errors
            document.querySelectorAll('video').forEach(video => {
                video.addEventListener('error', function(e) {
                    console.warn('Video loading error:', e);
                    this.style.display = 'none';
                    const errorMsg = document.createElement('p');
                    errorMsg.textContent = 'Video could not be loaded.';
                    errorMsg.style.color = '#ff6b6b';
                    errorMsg.style.textAlign = 'center';
                    errorMsg.style.padding = '2rem';
                    this.parentNode.appendChild(errorMsg);
                });
            });
            
            // Handle image loading errors
            document.querySelectorAll('img').forEach(img => {
                img.addEventListener('error', function(e) {
                    console.warn('Image loading error:', e);
                    this.alt = 'Image could not be loaded: ' + this.src;
                    this.style.border = '2px dashed #ff6b6b';
                    this.style.padding = '1rem';
                });
            });
            
            // Handle iframe loading errors
            document.querySelectorAll('iframe').forEach(iframe => {
                iframe.addEventListener('error', function(e) {
                    console.warn('Iframe loading error:', e);
                    const errorMsg = document.createElement('p');
                    errorMsg.textContent = 'Embedded content could not be loaded.';
                    errorMsg.style.color = '#ff6b6b';
                    errorMsg.style.textAlign = 'center';
                    errorMsg.style.padding = '2rem';
                    this.parentNode.appendChild(errorMsg);
                    this.style.display = 'none';
                });
            });
        });
    </script>
</body>
</html>`;
}

// Generate CSS based on quality setting
generateExportCSS(compressionLevel) {
    const baseCSS = `
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
            font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif; 
            background: #000; 
            color: #fff; 
            line-height: 1.6; 
            margin: 0; 
            padding: 2rem; 
        }
        .container { 
            max-width: 900px; 
            margin: 0 auto; 
            background: #1e1e1e; 
            padding: 3rem; 
            border-radius: 1rem; 
            box-shadow: 0 20px 40px rgba(0,0,0,0.6);
            border: 1px solid #333;
        }
        .document-header { 
            margin-bottom: 3rem; 
            padding-bottom: 2rem; 
            border-bottom: 2px solid #333; 
        }
        .document-title { 
            font-size: clamp(2rem, 5vw, 4rem); 
            margin-bottom: 1rem; 
            background: linear-gradient(135deg, #fff, #00d4ff); 
            -webkit-background-clip: text; 
            -webkit-text-fill-color: transparent; 
            background-clip: text; 
            font-weight: 900; 
        }
        .document-author { 
            font-size: 1.2rem; 
            color: #94a3b8; 
            margin-bottom: 1rem; 
        }
        .document-tags { 
            display: flex; 
            flex-wrap: wrap; 
            gap: 0.5rem; 
        }
        .tag { 
            background: #0ea5e9; 
            color: #000; 
            padding: 0.25rem 0.75rem; 
            border-radius: 1rem; 
            font-size: 0.8rem; 
            font-weight: 600; 
        }
        h1, h2, h3, h4, h5, h6 { 
            color: #fff; 
            margin: 2rem 0 1rem; 
            font-weight: 700; 
        }
        h2 { font-size: clamp(1.5rem, 3vw, 2.5rem); }
        h3 { font-size: clamp(1.2rem, 2.5vw, 2rem); }
        h4 { font-size: clamp(1rem, 2vw, 1.5rem); }
        p { 
            margin-bottom: 2rem; 
            padding: 2rem; 
            background: rgba(0,0,0,0.2); 
            border-radius: 12px; 
            border: 1px solid rgba(255,255,255,0.1); 
            line-height: 2;
        }
        p.lyrics {
            white-space: pre-line;
            line-height: 2.5;
            text-align: center;
            font-size: 1.2em;
            background: rgba(0,0,0,0.3);
        }
        .media-item { 
            margin: 3rem 0; 
            border-radius: 1rem; 
            overflow: hidden; 
            background: #111; 
            border: 1px solid #333;
        }
        .media-item img, .media-item video { 
            width: 100%; 
            height: auto; 
            display: block; 
        }
        .media-caption { 
            padding: 1rem; 
            text-align: center; 
            color: #94a3b8; 
            font-style: italic; 
        }
        .video-container { 
            position: relative; 
            padding-bottom: 56.25%; 
            height: 0; 
            overflow: hidden; 
        }
        .video-container iframe { 
            position: absolute; 
            top: 0; 
            left: 0; 
            width: 100%; 
            height: 100%; 
        }
        .quote-block { 
            background: linear-gradient(135deg, rgba(0,212,255,0.1), rgba(14,165,233,0.1)); 
            border-left: 6px solid #00d4ff; 
            padding: 2.5rem; 
            margin: 3rem 0; 
            border-radius: 1rem; 
            font-style: italic; 
            font-size: 1.2rem; 
            position: relative; 
        }
        .quote-block::before { 
            content: '"'; 
            position: absolute; 
            top: 1rem; 
            left: 1.5rem; 
            font-size: 4rem; 
            color: #00d4ff; 
            opacity: 0.3; 
        }
        .document-footer { 
            margin-top: 3rem; 
            padding-top: 2rem; 
            border-top: 1px solid #333; 
            text-align: center; 
            color: #64748b; 
            font-size: 0.9rem; 
        }
        audio { 
            width: 100%; 
            margin: 1rem 0; 
        }
        ul, ol { 
            margin-left: 2rem; 
            color: #e2e8f0; 
        }
        li { 
            margin-bottom: 0.5rem; 
        }
        @media (max-width: 768px) { 
            .container { 
                padding: 1.5rem; 
                margin: 1rem; 
            } 
            .document-title { 
                font-size: 2rem; 
            } 
            p { 
                padding: 1.5rem; 
            } 
        }
        @media print { 
            body { 
                background: white; 
                color: black; 
            } 
            .container { 
                box-shadow: none; 
                background: white; 
            } 
            .document-title, h1, h2, h3, h4, h5, h6 { 
                color: black; 
            } 
        }
    `;
    
    return compressionLevel === 'high' ? baseCSS : baseCSS.replace(/\s+/g, ' ');
}

getCompressionLevel(quality) {
    return quality === 'high' ? 'high' : quality === 'low' ? 'low' : 'medium';
}

sanitizeFileName(filename) {
    return filename
        .replace(/[<>:"/\\|?*\x00-\x1f]/g, '_')
        .replace(/\s+/g, '_')
        .toLowerCase()
        .substring(0, 100);
}