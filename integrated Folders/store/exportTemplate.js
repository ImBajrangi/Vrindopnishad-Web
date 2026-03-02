// exportTemplate.js - Modern Poetry Reader Template Generator

function generateModernPoetryHTML(title, author, tags, body) {
    // Sanitize function
    function sanitizeText(text) {
        return text.replace(/[<>&"']/g, function(match) {
            const escape = {
                '<': '&lt;',
                '>': '&gt;',
                '&': '&amp;',
                '"': '&quot;',
                "'": '&#39;'
            };
            return escape[match];
        });
    }

    const sanitizedTitle = sanitizeText(title || 'Document');
    const sanitizedAuthor = sanitizeText(author || '');
    const sanitizedTags = sanitizeText(tags || '');
    
    // Process tags into individual tag elements
    const tagElements = sanitizedTags ? 
        sanitizedTags.split(',')
            .map(tag => `<span class="tag">${tag.trim()}</span>`)
            .join('') : '';

    return `<!DOCTYPE html>
<html lang="hi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${sanitizedTitle}</title>
    ${sanitizedAuthor ? `<meta name="author" content="${sanitizedAuthor}">` : ''}
    ${sanitizedTags ? `<meta name="keywords" content="${sanitizedTags}">` : ''}
    <meta name="description" content="${sanitizedTitle} - Modern Poetry Reader">
    
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Noto Sans Devanagari', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
            color: #e8e8e8;
            line-height: 1.8;
            min-height: 100vh;
            overflow-x: hidden;
        }

        .container {
            max-width: 900px;
            margin: 0 auto;
            padding: 2rem;
            position: relative;
        }

        .header {
            text-align: center;
            padding: 3rem 0;
            margin-bottom: 3rem;
            position: relative;
        }

        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 100px;
            height: 4px;
            background: linear-gradient(90deg, #ff6b6b, #feca57, #48cae4, #ff6b6b);
            border-radius: 2px;
            animation: shimmer 3s ease-in-out infinite;
        }

        .title {
            font-size: clamp(2.5rem, 5vw, 4rem);
            font-weight: 800;
            background: linear-gradient(135deg, #ff6b6b 0%, #feca57 50%, #48cae4 100%);
            background-size: 200% 200%;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: gradientShift 4s ease-in-out infinite;
            margin-bottom: 1rem;
            text-shadow: 0 0 30px rgba(255, 107, 107, 0.3);
        }

        .subtitle {
            font-size: 1.4rem;
            color: #b8b8b8;
            margin-bottom: 2rem;
            font-weight: 300;
            letter-spacing: 0.5px;
        }

        .metadata {
            display: flex;
            justify-content: center;
            gap: 2rem;
            flex-wrap: wrap;
            margin-bottom: 2rem;
        }

        .metadata-item {
            background: rgba(255, 255, 255, 0.05);
            padding: 0.8rem 1.5rem;
            border-radius: 25px;
            font-size: 0.95rem;
            color: #c8c8c8;
            border: 1px solid rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
        }

        .metadata-item:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: rgba(255, 107, 107, 0.3);
        }

        .tags {
            display: flex;
            justify-content: center;
            gap: 0.8rem;
            flex-wrap: wrap;
            margin-top: 1rem;
        }

        .tag {
            background: linear-gradient(135deg, rgba(255, 107, 107, 0.2), rgba(254, 202, 87, 0.2));
            color: #feca57;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.85rem;
            border: 1px solid rgba(254, 202, 87, 0.3);
            transition: all 0.3s ease;
        }

        .tag:hover {
            background: linear-gradient(135deg, rgba(255, 107, 107, 0.3), rgba(254, 202, 87, 0.3));
            border-color: rgba(254, 202, 87, 0.5);
        }

        .content {
            position: relative;
            z-index: 2;
        }

        .content-item {
            margin-bottom: 3rem;
            animation: fadeInUp 0.8s ease-out;
            animation-fill-mode: both;
        }

        .content-item:nth-child(odd) {
            animation-delay: 0.1s;
        }

        .content-item:nth-child(even) {
            animation-delay: 0.2s;
        }

        h1, h2, h3, h4, h5, h6 {
            color: #ff6b6b;
            margin: 2.5rem 0 1.5rem 0;
            font-weight: 700;
            text-shadow: 0 0 20px rgba(255, 107, 107, 0.3);
        }

        h2 {
            font-size: 2.8rem;
            background: linear-gradient(135deg, #ff6b6b, #feca57);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        h3 { font-size: 2.2rem; }
        h4 { font-size: 1.8rem; }

        p {
            font-size: 1.3rem;
            line-height: 2;
            color: #e0e0e0;
            margin-bottom: 2rem;
            text-align: justify;
            padding: 2.5rem;
            background: rgba(255, 255, 255, 0.02);
            border-radius: 20px;
            border: 1px solid rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
        }

        p::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 4px;
            height: 100%;
            background: linear-gradient(180deg, #ff6b6b, #feca57);
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        p:hover {
            background: rgba(255, 255, 255, 0.05);
            border-color: rgba(255, 107, 107, 0.2);
            transform: translateY(-2px);
            box-shadow: 0 12px 40px rgba(255, 107, 107, 0.1);
        }

        p:hover::before {
            opacity: 1;
        }

        .hindi-text {
            font-family: 'Noto Sans Devanagari', serif;
            font-size: 1.4rem;
            line-height: 2.2;
            color: #f0f0f0;
            text-align: center;
            letter-spacing: 0.5px;
        }

        .poetry-format {
            text-align: center;
            font-style: italic;
            background: linear-gradient(135deg, rgba(72, 202, 228, 0.05), rgba(255, 107, 107, 0.05));
            border: 1px solid rgba(72, 202, 228, 0.2);
            position: relative;
        }

        .poetry-format::after {
            content: '"';
            position: absolute;
            top: 1rem;
            right: 2rem;
            font-size: 3rem;
            color: rgba(72, 202, 228, 0.3);
            font-family: serif;
        }

        .poetry-format::before {
            content: '"';
            position: absolute;
            bottom: 1rem;
            left: 2rem;
            font-size: 3rem;
            color: rgba(72, 202, 228, 0.3);
            font-family: serif;
            transform: rotate(180deg);
        }

        .quote-block {
            background: linear-gradient(135deg, rgba(72, 202, 228, 0.1), rgba(255, 107, 107, 0.05));
            border-left: 6px solid #48cae4;
            padding: 3rem 2.5rem;
            margin: 3rem 0;
            font-style: italic;
            font-size: 1.4rem;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(72, 202, 228, 0.1);
            position: relative;
        }

        .quote-block::before {
            content: '"';
            position: absolute;
            top: -10px;
            left: 20px;
            font-size: 4rem;
            color: #48cae4;
            opacity: 0.5;
        }

        .media-item {
            margin: 4rem 0;
            border-radius: 20px;
            overflow: hidden;
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
            transition: all 0.3s ease;
        }

        .media-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 25px 80px rgba(255, 107, 107, 0.1);
        }

        img, video, audio {
            width: 100%;
            height: auto;
            border-radius: 15px;
        }

        .media-caption {
            padding: 2rem;
            text-align: center;
            color: #b8b8b8;
            font-style: italic;
            font-size: 1.1rem;
            background: rgba(255, 255, 255, 0.02);
        }

        .video-container {
            position: relative;
            width: 100%;
            height: 0;
            padding-bottom: 56.25%;
            border-radius: 15px;
            overflow: hidden;
        }

        .video-container iframe {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: none;
        }

        .floating-elements {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
        }

        .floating-element {
            position: absolute;
            width: 4px;
            height: 4px;
            background: rgba(255, 107, 107, 0.6);
            border-radius: 50%;
            animation: float 8s ease-in-out infinite;
        }

        .floating-element:nth-child(2) {
            left: 20%;
            animation-delay: -2s;
            background: rgba(254, 202, 87, 0.6);
        }

        .floating-element:nth-child(3) {
            left: 40%;
            animation-delay: -4s;
            background: rgba(72, 202, 228, 0.6);
        }

        .floating-element:nth-child(4) {
            left: 60%;
            animation-delay: -6s;
            background: rgba(255, 107, 107, 0.4);
        }

        .floating-element:nth-child(5) {
            left: 80%;
            animation-delay: -8s;
            background: rgba(254, 202, 87, 0.4);
        }

        @keyframes gradientShift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
        }

        @keyframes shimmer {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 1; }
        }

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes floatUp {
            0%, 100% {
                transform: translateY(100vh) rotate(0deg);
                opacity: 0;
            }
            10%, 90% {
                opacity: 1;
            }
            50% {
                transform: translateY(-10vh) rotate(180deg);
            }
        }

        @media (max-width: 768px) {
            .container { padding: 1rem; }
            .title { font-size: 2.5rem; }
            .subtitle { font-size: 1.2rem; }
            p { font-size: 1.2rem; padding: 2rem 1.5rem; }
            .metadata { flex-direction: column; align-items: center; }
            h2 { font-size: 2.2rem; }
            h3 { font-size: 1.8rem; }
            h4 { font-size: 1.5rem; }
        }

        @media (max-width: 480px) {
            .title { font-size: 2rem; }
            p { font-size: 1.1rem; padding: 1.5rem 1rem; }
            .poetry-format::before, .poetry-format::after { font-size: 2rem; }
        }

        @media print {
            body { background: white; color: black; }
            .container { max-width: 100%; padding: 1rem; }
            .title { color: #333; -webkit-text-fill-color: #333; }
            p { background: #f9f9f9; border: 1px solid #ddd; }
            .floating-elements { display: none; }
        }
    </style>
</head>
<body>
    <div class="floating-elements">
        <div class="floating-element"></div>
        <div class="floating-element"></div>
        <div class="floating-element"></div>
        <div class="floating-element"></div>
        <div class="floating-element"></div>
    </div>

    <div class="container">
        <header class="header">
            <h1 class="title">${sanitizedTitle}</h1>
            <div class="metadata">
                ${sanitizedAuthor ? `<div class="metadata-item">
                    <strong>लेखक:</strong> ${sanitizedAuthor}
                </div>` : ''}
                <div class="metadata-item">
                    <strong>दिनांक:</strong> ${new Date().toLocaleDateString('hi-IN')}
                </div>
            </div>
            ${tagElements ? `<div class="tags">${tagElements}</div>` : ''}
        </header>

        <main class="content">
            ${body}
        </main>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const progressBar = document.createElement('div');
            progressBar.style.cssText = 'position:fixed;top:0;left:0;width:0%;height:3px;background:linear-gradient(90deg,#ff6b6b,#feca57,#48cae4);z-index:10000;transition:width 0.3s ease;';
            document.body.appendChild(progressBar);

            window.addEventListener('scroll', () => {
                const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
                progressBar.style.width = scrollPercent + '%';
            });

            const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                });
            }, observerOptions);

            document.querySelectorAll('.content-item, p, h2, h3, h4, .media-item, .quote-block').forEach(item => {
                item.style.opacity = '0';
                item.style.transform = 'translateY(20px)';
                item.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
                observer.observe(item);
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowUp' && e.ctrlKey) {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                } else if (e.key === 'ArrowDown' && e.ctrlKey) {
                    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
                }
            });

            document.querySelectorAll('p, .quote-block').forEach(element => {
                element.addEventListener('dblclick', () => {
                    const text = element.textContent;
                    navigator.clipboard.writeText(text).then(() => {
                        const notification = document.createElement('div');
                        notification.textContent = 'Text copied to clipboard!';
                        notification.style.cssText = 'position:fixed;top:20px;right:20px;background:rgba(72,202,228,0.9);color:white;padding:1rem 2rem;border-radius:10px;z-index:10001;animation:slideIn 0.3s ease;';
                        document.body.appendChild(notification);
                        setTimeout(() => notification.remove(), 2000);
                    });
                });
            });
        });
    </script>
</body>
</html>`;
}

// Make the function globally available
window.generateModernPoetryHTML = generateModernPoetryHTML;