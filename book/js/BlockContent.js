class BlockContent {
    constructor() {
        this.contentData = null;
        this.mediaBasePath = '/book/media';
        this.audioBasePath = '/book/audio';
    }
}
    // async loadContent() {
    //     try {
    //         // Load main content data
    //         const contentResponse = await fetch();
    //         if (!contentResponse.ok) throw new Error('Failed to load content');
    //         this.contentData = await contentResponse.json();

    //         // Load section-specific data
    //         for (const [sectionId, section] of Object.entries(this.contentData.sections)) {
    //             const sectionResponse = await fetch(`/book/data/sections/${sectionId}.json`);
    //             if (sectionResponse.ok) {
    //                 const sectionData = await sectionResponse.json();
    //                 this.contentData.sections[sectionId] = {
    //                     ...section,
    //                     ...sectionData
    //                 };
    //             }
    //         }

//             return this.contentData;
//         } catch (error) {
//             console.error('Error loading content:', error);
//             return null;
//         }
//     }

//     renderChapter(chapter) {
//         return `
//             <div class="section chapter-intro" id="${chapter.id}-intro">
//                 <div class="container-medium">
//                     <div class="padding-vertical">
//                         <div class="max-width-large">
//                             <div class="chapter-header">
//                                 <span class="chapter-number">${chapter.number}</span>
//                                 <h1 class="heading">${chapter.title}</h1>
//                                 <p class="chapter-description">${chapter.description}</p>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//             <div class="scroll-section ${chapter.scrollType}-section section" id="${chapter.id}">
//                 <div class="wrapper">
//                     <div role="list" class="list">
//                         ${chapter.blocks.map(block => this.renderBlock(block, chapter.scrollType)).join('')}
//                     </div>
//                 </div>
//             </div>
//         `;
//     }

//     renderBlock(block, scrollType) {
//         const section = this.contentData.sections[scrollType];
//         const theme = section?.theme || 'light';

//         return `
//             <div role="listitem" class="item ${theme}" data-block-id="${block.id}">
//                 <div class="page-number">Page ${block.pageNumber}</div>
//                 <div class="item_content">
//                     <h2 class="item_number">${block.pageNumber}</h2>
//                     <h2>${block.title}</h2>
//                     ${this.renderContent(block.content)}
//                     ${this.renderBlockActions(block, scrollType)}
//                 </div>
//                 ${this.renderBlockMedia(block.media)}
//             </div>
//         `;
//     }

//     renderContent(content) {
//         if (!content) return '';
        
//         return `
//             <div class="content-wrapper">
//                 ${content.sanskrit ? `
//                     <div class="sanskrit-text">${content.sanskrit}</div>
//                 ` : ''}
//                 ${content.translation ? `
//                     <div class="translation">${content.translation}</div>
//                 ` : ''}
//                 ${content.explanation ? `
//                     <div class="explanation">${content.explanation}</div>
//                 ` : ''}
//             </div>
//         `;
//     }

//     renderBlockActions(block, scrollType) {
//         return `
//             <div class="page-actions">
//                 <button class="page-action bookmark" data-section="${scrollType}" data-block-id="${block.id}">
//                     <i class="fas fa-bookmark"></i>
//                 </button>
//                 <button class="page-action notes" data-section="${scrollType}" data-block-id="${block.id}">
//                     <i class="fas fa-sticky-note"></i>
//                 </button>
//                 <button class="page-action block-music" data-section="${scrollType}" data-block-id="${block.id}">
//                     <i class="fas fa-music"></i>
//                 </button>
//                 <button class="page-action link-page" data-section="${scrollType}" data-block-id="${block.id}" data-title="${block.title}">
//                     <i class="fas fa-link"></i>
//                 </button>
//             </div>
//         `;
//     }

//     renderBlockMedia(media) {
//         if (media.video) {
//             return `
//                 <video src="${media.video}" loading="lazy" autoplay muted loop class="item_media"></video>
//             `;
//         }
//         return '';
//     }

//     async initializeContent() {
//         const content = await this.loadContent();
//         if (!content) return;

//         // Set book title and subtitle
//         document.querySelector('.book-title').textContent = content.book.title;
//         document.querySelector('.book-subtitle').textContent = content.book.subtitle;

//         // Render chapters
//         const mainWrapper = document.querySelector('.main-wrapper');
//         const bookCover = document.querySelector('#book-cover');
//         const chaptersHtml = content.chapters.map(chapter => this.renderChapter(chapter)).join('');
        
//         // Insert chapters after book cover
//         bookCover.insertAdjacentHTML('afterend', chaptersHtml);

//         // Initialize scroll behaviors based on chapter types
//         this.initializeScrollBehaviors();
//     }

//     initializeScrollBehaviors() {
//         // Initialize horizontal scroll for horizontal sections
//         document.querySelectorAll('.horizontal-section').forEach(section => {
//             // Add horizontal scroll logic
//         });

//         // Initialize vertical scroll for vertical sections
//         document.querySelectorAll('.vertical-section').forEach(section => {
//             // Add vertical scroll logic
//         });
//     }
// }

// export default BlockContent;
