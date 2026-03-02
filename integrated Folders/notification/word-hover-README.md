# Word Hover Effect

An interactive text enhancement that makes each word in your content react to hover with animations, colors, and text-to-speech functionality.

## Features

- **Word-Level Interactivity**: Each word gets its own hover and click effects
- **Animation Variety**: Different animations for words based on their position
- **Text-to-Speech**: Click on any word to hear it pronounced
- **Multi-language Support**: Works with both English and Hindi text
- **Proper Punctuation Handling**: Preserves punctuation and formatting
- **Responsive Design**: Adapts to different screen sizes
- **Dark Mode Compatible**: Special styling for dark mode
- **Accessibility Features**: Respects reduced motion preferences

## Implementation

The implementation consists of two main files:

1. `word-hover.css` - Contains all the styling and animation effects
2. `word-hover.js` - Contains the logic to process text content and add interactivity

## How It Works

1. The JavaScript identifies text elements on the page (paragraphs, headings, etc.)
2. It breaks down the text into individual words while preserving punctuation
3. Each word is wrapped in a `<span>` tag with appropriate classes
4. CSS provides hover animations, colors, and effects
5. Click events trigger text-to-speech functionality

## Usage

1. Include the CSS and JS files in your HTML:

```html
<link rel="stylesheet" href="word-hover.css">
<script src="word-hover.js" defer></script>
```

2. The script automatically processes text in these elements:
   - `.item_p` - Regular paragraphs
   - `.chapter-description` - Chapter descriptions
   - `.book-subtitle` - Book subtitles
   - `.heading` - Headings
   - `.book-title` - Book titles
   - `.end-message` - End messages

3. For Hindi text, add the `lang="hi"` attribute to the container:

```html
<p class="item_p" lang="hi">
  प्रकृति की अद्भुत विविधता का अन्वेषण करें और जानें कि प्रकृति मौसमों के बदलते ताल के अनुसार कैसे अनुकूलित होती है।
</p>
```

## Customization

### Colors

You can change the hover colors by modifying these CSS rules:

```css
.hoverable-word:nth-child(5n+1):hover {
  color: #ff9f43; /* Orange */
}

.hoverable-word:nth-child(5n+2):hover {
  color: #0abde3; /* Blue */
}

/* and so on... */
```

### Animations

Modify the animations by changing the keyframes:

```css
@keyframes bounce {
  0%, 100% { transform: translateY(0) scale(1.1); }
  50% { transform: translateY(-10px) scale(1.15); }
}
```

### Text-to-Speech

Customize the speech properties in the JavaScript:

```javascript
function speakWord(word) {
  // ...
  utterance.rate = 0.9;  // Speed (0.1 to 10)
  utterance.pitch = 1;   // Pitch (0 to 2)
  // ...
}
```

## Testing

Use the `word-hover-test.html` file to test the implementation with different types of text and see how the effects work.

## Troubleshooting

- **Words not being processed**: Make sure your text is in an element with one of the supported classes
- **Text-to-speech not working**: Some browsers have restrictions on audio playback without user interaction
- **Hindi text not displaying correctly**: Ensure you have the Laila font or another Hindi-compatible font

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (except some text-to-speech voices might be limited)
- Opera: Full support
- Mobile browsers: Hover effects limited to touch, animations reduced on low-power devices

## Performance Notes

The script uses MutationObserver to detect new content, so it works with dynamically loaded text. For very large amounts of text, processing might take a moment, but it's optimized to only process each element once. 