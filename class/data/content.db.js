// Content Database Structure
const contentDB = {
    // Content Collection
    contents: [
        {
            id: String, // Unique identifier
            title: String, // Content title
            slug: String, // URL-friendly version of title
            content: String, // Main content
            excerpt: String, // Short description
            status: String, // draft, published, archived
            visibility: String, // public, private, password-protected
            author: {
                id: String,
                name: String,
                email: String
            },
            categories: [String], // Array of category IDs
            tags: [String], // Array of tag names
            featuredImage: {
                url: String,
                alt: String,
                caption: String
            },
            media: [{
                type: String, // image, video, audio, file
                url: String,
                alt: String,
                caption: String,
                metadata: Object
            }],
            seo: {
                title: String,
                description: String,
                keywords: [String],
                ogTitle: String,
                ogDescription: String,
                ogImage: String,
                canonicalUrl: String
            },
            metadata: {
                createdAt: Date,
                updatedAt: Date,
                publishedAt: Date,
                readingTime: Number, // in minutes
                wordCount: Number,
                viewCount: Number,
                likeCount: Number,
                commentCount: Number
            },
            settings: {
                allowComments: Boolean,
                featured: Boolean,
                sticky: Boolean,
                password: String, // for password-protected content
                template: String // default, full-width, sidebar
            }
        }
    ],

    // Categories Collection
    categories: [
        {
            id: String,
            name: String,
            slug: String,
            description: String,
            parent: String, // Parent category ID
            count: Number, // Number of posts in category
            metadata: {
                createdAt: Date,
                updatedAt: Date
            }
        }
    ],

    // Tags Collection
    tags: [
        {
            id: String,
            name: String,
            slug: String,
            description: String,
            count: Number, // Number of posts with this tag
            metadata: {
                createdAt: Date,
                updatedAt: Date
            }
        }
    ],

    // Users Collection
    users: [
        {
            id: String,
            username: String,
            email: String,
            password: String, // Hashed
            name: String,
            role: String, // admin, editor, author, subscriber
            avatar: String,
            bio: String,
            social: {
                website: String,
                twitter: String,
                facebook: String,
                instagram: String
            },
            metadata: {
                createdAt: Date,
                updatedAt: Date,
                lastLogin: Date,
                postCount: Number
            },
            settings: {
                emailNotifications: Boolean,
                twoFactorAuth: Boolean,
                theme: String // light, dark, system
            }
        }
    ],

    // Comments Collection
    comments: [
        {
            id: String,
            contentId: String, // Reference to content
            author: {
                id: String,
                name: String,
                email: String,
                avatar: String
            },
            content: String,
            parent: String, // Parent comment ID for replies
            status: String, // approved, pending, spam
            metadata: {
                createdAt: Date,
                updatedAt: Date,
                ip: String,
                userAgent: String
            }
        }
    ],

    // Media Collection
    media: [
        {
            id: String,
            type: String, // image, video, audio, file
            url: String,
            filename: String,
            mimeType: String,
            size: Number, // in bytes
            dimensions: {
                width: Number,
                height: Number
            },
            metadata: {
                createdAt: Date,
                updatedAt: Date,
                uploadedBy: String, // User ID
                alt: String,
                caption: String,
                description: String
            }
        }
    ],

    // Settings Collection
    settings: {
        site: {
            title: String,
            description: String,
            logo: String,
            favicon: String,
            language: String,
            timezone: String,
            dateFormat: String,
            timeFormat: String
        },
        content: {
            postsPerPage: Number,
            defaultStatus: String,
            defaultVisibility: String,
            allowComments: Boolean,
            commentModeration: Boolean,
            defaultTemplate: String
        },
        seo: {
            metaDescription: String,
            metaKeywords: String,
            robotsTxt: String,
            sitemapEnabled: Boolean,
            analyticsId: String
        },
        social: {
            facebook: String,
            twitter: String,
            instagram: String,
            linkedin: String
        },
        email: {
            fromName: String,
            fromEmail: String,
            smtpHost: String,
            smtpPort: Number,
            smtpUser: String,
            smtpPass: String
        }
    }
};

// Database Helper Functions
const dbHelpers = {
    // Content Functions
    async createContent(content) {
        // Implementation
    },
    async updateContent(id, content) {
        // Implementation
    },
    async deleteContent(id) {
        // Implementation
    },
    async getContent(id) {
        // Implementation
    },
    async listContents(query) {
        // Implementation
    },

    // Category Functions
    async createCategory(category) {
        // Implementation
    },
    async updateCategory(id, category) {
        // Implementation
    },
    async deleteCategory(id) {
        // Implementation
    },
    async getCategory(id) {
        // Implementation
    },
    async listCategories() {
        // Implementation
    },

    // Tag Functions
    async createTag(tag) {
        // Implementation
    },
    async updateTag(id, tag) {
        // Implementation
    },
    async deleteTag(id) {
        // Implementation
    },
    async getTag(id) {
        // Implementation
    },
    async listTags() {
        // Implementation
    },

    // User Functions
    async createUser(user) {
        // Implementation
    },
    async updateUser(id, user) {
        // Implementation
    },
    async deleteUser(id) {
        // Implementation
    },
    async getUser(id) {
        // Implementation
    },
    async listUsers() {
        // Implementation
    },

    // Comment Functions
    async createComment(comment) {
        // Implementation
    },
    async updateComment(id, comment) {
        // Implementation
    },
    async deleteComment(id) {
        // Implementation
    },
    async getComment(id) {
        // Implementation
    },
    async listComments(contentId) {
        // Implementation
    },

    // Media Functions
    async uploadMedia(file) {
        // Implementation
    },
    async deleteMedia(id) {
        // Implementation
    },
    async getMedia(id) {
        // Implementation
    },
    async listMedia() {
        // Implementation
    },

    // Settings Functions
    async updateSettings(settings) {
        // Implementation
    },
    async getSettings() {
        // Implementation
    }
};

// Export the database structure and helpers
export { contentDB, dbHelpers }; 