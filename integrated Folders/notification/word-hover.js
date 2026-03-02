/**
 * Word Hover Effects
 * Add interactive hover effects to text content
 * Optimized to prevent flickering on scroll and hover
 */

// Wait until after all other scripts have loaded to initialize
window.addEventListener('load', function() {
  // Delay initialization to let GSAP animations settle
  setTimeout(initWordHoverEffects, 2000);
});

// Debounce function to prevent rapid execution
function debounce(func, wait) {
  let timeout;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

// Performance flags to disable processing during animations
let isScrolling = false;
let isAnimating = false;

// Detect scroll events
window.addEventListener('scroll', function() {
  isScrolling = true;
  clearTimeout(window.scrollEndTimer);
  window.scrollEndTimer = setTimeout(function() {
    isScrolling = false;
  }, 200);
}, { passive: true });

// Global processed flags to prevent duplicate processing
window.processedElements = window.processedElements || new WeakSet();

function initWordHoverEffects() {
  // Don't process if currently scrolling or animating
  if (isScrolling || isAnimating) {
    setTimeout(initWordHoverEffects, 500);
    return;
  }
  
  // Log initialization
  console.log('Initializing word hover effects');
  
  // Select specific text elements that should have hover effects
  // Be more selective to avoid disrupting layout
  const textElements = document.querySelectorAll('.item_p:not(.word-hover-processed), .chapter-description:not(.word-hover-processed):not(.book-cover *)');
  
  // Return if no unprocessed elements found
  if (textElements.length === 0) {
    return;
  }
  
  // Mark that animation is in progress
  isAnimating = true;
  
  // Process in batches to prevent UI freezing
  processBatch(textElements, 0, 5);
}

// Process elements in small batches to prevent UI freezing
function processBatch(elements, startIndex, batchSize) {
  const endIndex = Math.min(startIndex + batchSize, elements.length);
  
  // Process current batch
  for (let i = startIndex; i < endIndex; i++) {
    processElement(elements[i]);
  }
  
  // Continue with next batch if there are more elements
  if (endIndex < elements.length) {
    setTimeout(() => {
      processBatch(elements, endIndex, batchSize);
    }, 100);
  } else {
    // All elements processed, animation is complete
    isAnimating = false;
    
    // Now process headings
    processHeadings();
  }
}

// Process heading elements separately to avoid UI blocking
function processHeadings() {
  // Don't process if currently scrolling or animating
  if (isScrolling) {
    setTimeout(processHeadings, 500);
    return;
  }
  
  // Add hover effects to heading elements more selectively
  const headings = document.querySelectorAll('.item_content h2:not(.item_number):not(.word-hover-processed)');
  
  // Return if no unprocessed headings found
  if (headings.length === 0) {
    return;
  }
  
  // Mark that animation is in progress
  isAnimating = true;
  
  // Process headings in smaller batches
  processBatch(headings, 0, 3);
}

// Process a single element
function processElement(element) {
  // Skip if already processed or in processed set
  if (element.classList.contains('word-hover-processed') || window.processedElements.has(element)) {
    return;
  }
  
  // Add to processed set to prevent duplicate processing
  window.processedElements.add(element);
  
  // Skip elements with special attributes or classes that might break layout
  if (element.hasAttribute('data-no-hover') || 
      element.classList.contains('no-hover') ||
      element.closest('.book-cover') || 
      element.closest('.notes-panel') ||
      element.closest('.link-panel') ||
      element.closest('.end-actions') ||
      element.closest('.mobile-menu')) {
    return;
  }
  
  // Skip if in a scrolling section that's currently animating
  const scrollSection = element.closest('.scroll-section');
  if (scrollSection && scrollSection.getAttribute('data-animating') === 'true') {
    return;
  }
  
  // Store original content for safety
  const originalContent = element.innerHTML;
  
  try {
    // Get the text content
    const text = element.textContent;
    
    // Skip if empty
    if (!text || text.trim() === '') return;
    
    // Create DocumentFragment for better performance
    const fragment = document.createDocumentFragment();
    
    // Split text into words, preserving punctuation (reused from previous implementation)
    const words = text.match(/[\w\u0900-\u097F]+|[^\s\w\u0900-\u097F]+/g) || [];
    
    // Build content in memory to reduce DOM operations
    let tempContainer = document.createElement('div');
    
    words.forEach((word, index) => {
      // Check if the word is actual text or just punctuation/whitespace
      if (/^[\w\u0900-\u097F]+$/.test(word)) {
        // It's a word - create span
        const span = document.createElement('span');
        span.className = 'hoverable-word' + (element.tagName === 'H2' ? ' heading-word' : '');
        span.textContent = word;
        tempContainer.appendChild(span);
      } else {
        // It's punctuation or other character - add as text node
        tempContainer.appendChild(document.createTextNode(word));
      }
      
      // Add space between words, but not before punctuation
      if (index < words.length - 1 && !/^[^\w\u0900-\u097F]+$/.test(words[index + 1])) {
        tempContainer.appendChild(document.createTextNode(' '));
      }
    });
    
    // Update the element with the new content
    element.innerHTML = tempContainer.innerHTML;
    
    // Mark as processed
    element.classList.add('word-hover-processed');
  } catch (error) {
    // If anything goes wrong, restore original content
    console.error('Error applying word hover effect:', error);
    element.innerHTML = originalContent;
  }
}

// Only set up click event once
if (!window.wordHoverEventAdded) {
  // Add click event for word pronunciation using event delegation
  document.addEventListener('click', function(event) {
    if (event.target.classList.contains('hoverable-word')) {
      // Remove speaking class from all words
      document.querySelectorAll('.hoverable-word.speaking').forEach(el => {
        el.classList.remove('speaking');
      });
      
      // Add speaking class to clicked word
      event.target.classList.add('speaking');
      
      // Speak the word
      speakWord(event.target.textContent);
    }
  });
  
  // Mark that we've added the event listener to prevent duplicates
  window.wordHoverEventAdded = true;
}

// Debounced function to update ScrollTrigger
const refreshScrollTrigger = debounce(function() {
  if (window.ScrollTrigger && typeof window.ScrollTrigger.refresh === 'function') {
    window.ScrollTrigger.refresh();
  }
}, 300);

// Function to speak a word using text-to-speech
function speakWord(word) {
  // Check if speech synthesis is supported
  if ('speechSynthesis' in window) {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Create utterance
    const utterance = new SpeechSynthesisUtterance(word);
    
    // Get current voice settings or use defaults
    const voiceSettings = window.voiceSettings || {
      rate: 0.9,        // Speed
      pitch: 1.1,       // Pitch
      volume: 1,        // Volume
      voiceIndex: 0,    // Default voice index
      voiceType: 'auto', // Auto, male, female
      selectedVoice: null // Specific selected voice
    };
    
    // Set properties
    utterance.rate = voiceSettings.rate;
    utterance.pitch = voiceSettings.pitch;
    utterance.volume = voiceSettings.volume;
    
    // Get available voices
    let voices = window.speechSynthesis.getVoices();
    
    // If voices aren't loaded yet, try again in a moment
    if (voices.length === 0) {
      setTimeout(() => {
        voices = window.speechSynthesis.getVoices();
        setVoiceAndSpeak();
      }, 100);
    } else {
      setVoiceAndSpeak();
    }
    
    function setVoiceAndSpeak() {
      // First check if a specific voice is selected from the dropdown
      if (voiceSettings.selectedVoice) {
        const [langCode, voiceIndex] = voiceSettings.selectedVoice.split('|');
        const langVoices = voices.filter(v => v.lang === langCode);
        
        if (langVoices[voiceIndex]) {
          utterance.voice = langVoices[voiceIndex];
          console.log(`Using specifically selected voice: ${utterance.voice.name}`);
          window.speechSynthesis.speak(utterance);
          
          // Set up end event
          setupEndEvent();
          return;
        }
      }
      
      // If no specific voice is selected or the selection is invalid, use the automatic selection
      
      // Check if the text is in Hindi (contains Devanagari characters)
      const isHindi = /[\u0900-\u097F]/.test(word);
      
      // Check language preference if set
      const preferredLang = voiceSettings.prefLang || 'auto';
      
      // Find appropriate voices based on language
      let languageVoices;
      let preferredVoice;
      
      if (preferredLang !== 'auto') {
        // Use preferred language if set
        languageVoices = voices.filter(voice => voice.lang.includes(preferredLang));
      } else if (isHindi) {
        // For Hindi text
        languageVoices = voices.filter(voice => voice.lang.includes('hi') || voice.lang.includes('in'));
        
        // If no Hindi voices, try to use any Google voice as fallback
        if (languageVoices.length === 0) {
          languageVoices = voices.filter(voice => voice.name.includes('Google'));
        }
      } else {
        // For English text - filter by user preference if set
        if (voiceSettings.voiceType === 'male') {
          languageVoices = voices.filter(voice => 
            (voice.lang.includes('en') && (voice.name.includes('Male') || voice.name.includes('David') || voice.name.includes('Tom')))
          );
        } else if (voiceSettings.voiceType === 'female') {
          languageVoices = voices.filter(voice => 
            (voice.lang.includes('en') && (voice.name.includes('Female') || voice.name.includes('Samantha') || voice.name.includes('Karen')))
          );
        } else {
          // Auto - get all English voices
          languageVoices = voices.filter(voice => voice.lang.includes('en'));
        }
        
        // Prioritize voices in this order: Google, en-US, en-GB, any English
        preferredVoice = languageVoices.find(voice => voice.name.includes('Google'));
        
        if (!preferredVoice) {
          preferredVoice = languageVoices.find(voice => voice.lang.includes('en-US'));
        }
        
        if (!preferredVoice) {
          preferredVoice = languageVoices.find(voice => voice.lang.includes('en-GB'));
        }
      }
      
      // Use user-selected voice if available, otherwise use preferred or first available
      if (voiceSettings.voiceIndex < languageVoices.length) {
        utterance.voice = languageVoices[voiceSettings.voiceIndex];
      } else if (preferredVoice) {
        utterance.voice = preferredVoice;
      } else if (languageVoices.length > 0) {
        utterance.voice = languageVoices[0];
      } else if (voices.length > 0) {
        // Fallback to any available voice
        utterance.voice = voices[0];
      }
      
      // Adjust properties for Hindi voices
      if (isHindi && utterance.voice) {
        utterance.rate = 0.8; // Slightly slower for Hindi
        utterance.pitch = 1.0; // Neutral pitch
      }
      
      // Debug voice info
      if (window.debugVoice) {
        console.log(`Speaking with voice: ${utterance.voice?.name}, language: ${utterance.voice?.lang}`);
      }
      
      // Speak the word
      window.speechSynthesis.speak(utterance);
      
      // Setup end event
      setupEndEvent();
    }
    
    function setupEndEvent() {
      // Add utterance event handlers
      utterance.onend = function() {
        // Remove speaking class from all words when speech ends
        document.querySelectorAll('.hoverable-word.speaking').forEach(el => {
          el.classList.remove('speaking');
        });
      };
    }
  }
}

// Detect when GSAP animations are running
if (window.gsap) {
  const originalTo = window.gsap.to;
  window.gsap.to = function() {
    isAnimating = true;
    const tween = originalTo.apply(this, arguments);
    const originalOnComplete = tween.vars.onComplete;
    
    tween.vars.onComplete = function() {
      if (originalOnComplete) {
        originalOnComplete.apply(this, arguments);
      }
      setTimeout(() => {
        isAnimating = false;
      }, 300);
    };
    
    return tween;
  };
}

// When ScrollTrigger updates, mark sections as animating
if (window.ScrollTrigger) {
  window.ScrollTrigger.addEventListener('refresh', function() {
    document.querySelectorAll('.scroll-section').forEach(section => {
      section.setAttribute('data-animating', 'true');
      setTimeout(() => {
        section.removeAttribute('data-animating');
      }, 1000);
    });
  });
}

// Only set up observer once
if (!window.wordHoverObserver) {
  // Set up a more efficient observer that only triggers for specific changes
  const observer = new MutationObserver(debounce(function(mutations) {
    let shouldInit = false;
    
    for (let i = 0; i < mutations.length; i++) {
      const mutation = mutations[i];
      
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // Check if any of the added nodes or their children are relevant elements
        for (let j = 0; j < mutation.addedNodes.length; j++) {
          const node = mutation.addedNodes[j];
          
          if (node.nodeType === Node.ELEMENT_NODE) {
            const hasRelevantContent = node.querySelector && (
              node.querySelector('.item_p:not(.word-hover-processed), .chapter-description:not(.word-hover-processed), .item_content h2:not(.item_number):not(.word-hover-processed)') || 
              (node.classList && (node.classList.contains('item_p') || node.classList.contains('chapter-description')))
            );
            
            if (hasRelevantContent) {
              shouldInit = true;
              break;
            }
          }
        }
        
        if (shouldInit) break;
      }
    }
    
    // Only reinitialize if relevant content was added and not during animations
    if (shouldInit && !isScrolling && !isAnimating) {
      setTimeout(initWordHoverEffects, 300);
    }
  }, 500));
  
  // Start observing the document body for DOM changes with a more specific configuration
  observer.observe(document.body, { 
    childList: true, 
    subtree: true,
    characterData: false,
    attributeFilter: ['class']
  });
  
  // Store observer reference
  window.wordHoverObserver = observer;
}

// Initialize voice selection controls if they exist on the page
function initVoiceControls() {
  // Create global settings object if it doesn't exist
  window.voiceSettings = window.voiceSettings || {
    rate: 0.9,
    pitch: 1.1,
    volume: 1,
    voiceIndex: 0,
    voiceType: 'auto',
    selectedVoice: null  // Store the specific selected voice
  };
  
  // Create voice control UI if it doesn't exist yet
  if (!document.getElementById('voice-controls') && 
      document.querySelector('.controls') && 
      !window.voiceControlsInitialized) {
    
    // Create voice controls container
    const controlsDiv = document.createElement('div');
    controlsDiv.id = 'voice-controls';
    controlsDiv.className = 'test-section';
    controlsDiv.style.marginTop = '2rem';
    
    // Add heading
    const heading = document.createElement('h2');
    heading.textContent = 'Voice Settings';
    controlsDiv.appendChild(heading);
    
    // Create voice selector dropdown for all available voices
    const voiceSelectDiv = document.createElement('div');
    voiceSelectDiv.style.marginBottom = '1rem';
    
    const voiceSelectLabel = document.createElement('label');
    voiceSelectLabel.textContent = 'Select Voice: ';
    voiceSelectLabel.setAttribute('for', 'voice-select');
    
    // Create dropdown for all voices
    const voiceSelect = document.createElement('select');
    voiceSelect.id = 'voice-select';
    voiceSelect.style.width = '100%';
    voiceSelect.style.maxWidth = '300px';
    voiceSelect.style.marginBottom = '1rem';
    
    // Initially add a loading option
    const loadingOption = document.createElement('option');
    loadingOption.value = '';
    loadingOption.textContent = 'Loading voices...';
    voiceSelect.appendChild(loadingOption);
    
    voiceSelectDiv.appendChild(voiceSelectLabel);
    voiceSelectDiv.appendChild(document.createElement('br'));
    voiceSelectDiv.appendChild(voiceSelect);
    controlsDiv.appendChild(voiceSelectDiv);
    
    // Create voice type selector as a fallback
    const voiceTypeDiv = document.createElement('div');
    voiceTypeDiv.style.marginBottom = '1rem';
    
    const voiceTypeLabel = document.createElement('label');
    voiceTypeLabel.textContent = 'Voice Type: ';
    voiceTypeLabel.setAttribute('for', 'voice-type');
    
    const voiceTypeSelect = document.createElement('select');
    voiceTypeSelect.id = 'voice-type';
    
    ['Auto', 'Male', 'Female'].forEach(type => {
      const option = document.createElement('option');
      option.value = type.toLowerCase();
      option.textContent = type;
      if (type.toLowerCase() === window.voiceSettings.voiceType) {
        option.selected = true;
      }
      voiceTypeSelect.appendChild(option);
    });
    
    voiceTypeDiv.appendChild(voiceTypeLabel);
    voiceTypeDiv.appendChild(voiceTypeSelect);
    controlsDiv.appendChild(voiceTypeDiv);
    
    // Create language preference dropdown
    const langDiv = document.createElement('div');
    langDiv.style.marginBottom = '1rem';
    
    const langLabel = document.createElement('label');
    langLabel.textContent = 'Preferred Language: ';
    langLabel.setAttribute('for', 'lang-select');
    
    const langSelect = document.createElement('select');
    langSelect.id = 'lang-select';
    
    // Add common languages
    const languages = [
      { code: 'auto', name: 'Auto Detect' },
      { code: 'en-US', name: 'English (US)' },
      { code: 'en-GB', name: 'English (UK)' },
      { code: 'hi-IN', name: 'Hindi' },
      { code: 'es-ES', name: 'Spanish' },
      { code: 'fr-FR', name: 'French' },
      { code: 'de-DE', name: 'German' },
      { code: 'it-IT', name: 'Italian' },
      { code: 'ja-JP', name: 'Japanese' },
      { code: 'zh-CN', name: 'Chinese' }
    ];
    
    languages.forEach(lang => {
      const option = document.createElement('option');
      option.value = lang.code;
      option.textContent = lang.name;
      if (lang.code === (window.voiceSettings.prefLang || 'auto')) {
        option.selected = true;
      }
      langSelect.appendChild(option);
    });
    
    langDiv.appendChild(langLabel);
    langDiv.appendChild(langSelect);
    controlsDiv.appendChild(langDiv);
    
    // Create rate slider
    const rateDiv = document.createElement('div');
    rateDiv.style.marginBottom = '1rem';
    
    const rateLabel = document.createElement('label');
    rateLabel.textContent = 'Speed: ';
    rateLabel.setAttribute('for', 'rate-slider');
    
    const rateValue = document.createElement('span');
    rateValue.id = 'rate-value';
    rateValue.textContent = window.voiceSettings.rate;
    rateValue.style.marginLeft = '0.5rem';
    
    const rateSlider = document.createElement('input');
    rateSlider.type = 'range';
    rateSlider.id = 'rate-slider';
    rateSlider.min = '0.5';
    rateSlider.max = '1.5';
    rateSlider.step = '0.1';
    rateSlider.value = window.voiceSettings.rate;
    rateSlider.style.width = '100%';
    rateSlider.style.maxWidth = '300px';
    
    rateDiv.appendChild(rateLabel);
    rateDiv.appendChild(rateValue);
    rateDiv.appendChild(document.createElement('br'));
    rateDiv.appendChild(rateSlider);
    controlsDiv.appendChild(rateDiv);
    
    // Create pitch slider
    const pitchDiv = document.createElement('div');
    pitchDiv.style.marginBottom = '1rem';
    
    const pitchLabel = document.createElement('label');
    pitchLabel.textContent = 'Pitch: ';
    pitchLabel.setAttribute('for', 'pitch-slider');
    
    const pitchValue = document.createElement('span');
    pitchValue.id = 'pitch-value';
    pitchValue.textContent = window.voiceSettings.pitch;
    pitchValue.style.marginLeft = '0.5rem';
    
    const pitchSlider = document.createElement('input');
    pitchSlider.type = 'range';
    pitchSlider.id = 'pitch-slider';
    pitchSlider.min = '0.5';
    pitchSlider.max = '2';
    pitchSlider.step = '0.1';
    pitchSlider.value = window.voiceSettings.pitch;
    pitchSlider.style.width = '100%';
    pitchSlider.style.maxWidth = '300px';
    
    pitchDiv.appendChild(pitchLabel);
    pitchDiv.appendChild(pitchValue);
    pitchDiv.appendChild(document.createElement('br'));
    pitchDiv.appendChild(pitchSlider);
    controlsDiv.appendChild(pitchDiv);
    
    // Test sentence
    const testDiv = document.createElement('div');
    testDiv.style.marginTop = '1.5rem';
    testDiv.style.display = 'flex';
    testDiv.style.flexWrap = 'wrap';
    testDiv.style.gap = '0.5rem';
    
    const testButton = document.createElement('button');
    testButton.textContent = 'Test Voice';
    testButton.id = 'test-voice';
    
    const resetButton = document.createElement('button');
    resetButton.textContent = 'Reset Settings';
    resetButton.id = 'reset-voice';
    resetButton.style.backgroundColor = '#888';
    
    testDiv.appendChild(testButton);
    testDiv.appendChild(resetButton);
    controlsDiv.appendChild(testDiv);
    
    // Voice info display
    const infoDiv = document.createElement('div');
    infoDiv.id = 'voice-info';
    infoDiv.style.marginTop = '1rem';
    infoDiv.style.fontSize = '0.9rem';
    infoDiv.style.color = '#666';
    controlsDiv.appendChild(infoDiv);
    
    // Add the controls to the page after the main controls
    document.querySelector('.controls').parentNode.insertBefore(
      controlsDiv, 
      document.querySelector('.controls').nextSibling
    );
    
    // Populate voices when they're available
    function populateVoices() {
      const voices = window.speechSynthesis.getVoices();
      
      // Clear existing options except the first one
      while (voiceSelect.options.length > 1) {
        voiceSelect.remove(1);
      }
      
      if (voices.length === 0) {
        // If no voices available yet, try again later
        setTimeout(populateVoices, 100);
        return;
      }
      
      // Update the first option
      voiceSelect.options[0].textContent = '-- Select Voice --';
      
      // Group voices by language
      const voicesByLang = {};
      
      voices.forEach(voice => {
        const langCode = voice.lang.split('-')[0];
        if (!voicesByLang[langCode]) {
          voicesByLang[langCode] = [];
        }
        voicesByLang[langCode].push(voice);
      });
      
      // Create option groups for each language
      for (const langCode in voicesByLang) {
        const group = document.createElement('optgroup');
        let langName = new Intl.DisplayNames(['en'], { type: 'language' }).of(langCode);
        group.label = langName || langCode.toUpperCase();
        
        // Sort voices within the language group
        voicesByLang[langCode].sort((a, b) => {
          // Premium/high-quality voices first
          const aQuality = (a.name.includes('Premium') || a.name.includes('Enhanced') || a.name.includes('Google')) ? 1 : 0;
          const bQuality = (b.name.includes('Premium') || b.name.includes('Enhanced') || b.name.includes('Google')) ? 1 : 0;
          
          if (aQuality !== bQuality) return bQuality - aQuality;
          
          // Then by name
          return a.name.localeCompare(b.name);
        });
        
        voicesByLang[langCode].forEach((voice, index) => {
          const option = document.createElement('option');
          option.value = `${voice.lang}|${index}`;
          
          // Create a nice label with voice name and language variant
          let voiceDesc = voice.name;
          
          // Add quality indicator if it's a premium voice
          if (voice.name.includes('Premium') || voice.name.includes('Enhanced') || voice.name.includes('Google')) {
            voiceDesc += ' ⭐'; 
          }
          
          // Add locale info if not in voice name already
          if (!voice.name.includes(voice.lang.split('-')[1])) {
            const locale = voice.lang.split('-')[1];
            voiceDesc += ` (${locale})`;
          }
          
          option.textContent = voiceDesc;
          
          // Select the previously selected voice if any
          if (window.voiceSettings.selectedVoice === option.value) {
            option.selected = true;
          }
          
          group.appendChild(option);
        });
        
        voiceSelect.appendChild(group);
      }
      
      // Update voice info display
      updateVoiceInfo();
    }
    
    // Call once to initialize and also when voices change
    populateVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = populateVoices;
    }
    
    // Update voice info display
    function updateVoiceInfo() {
      const infoDiv = document.getElementById('voice-info');
      if (!infoDiv) return;
      
      const voices = window.speechSynthesis.getVoices();
      let selectedVoiceValue = voiceSelect.value;
      
      if (selectedVoiceValue && selectedVoiceValue !== '') {
        const [langCode, voiceIndex] = selectedVoiceValue.split('|');
        const langVoices = voices.filter(v => v.lang === langCode);
        
        if (langVoices[voiceIndex]) {
          const voice = langVoices[voiceIndex];
          infoDiv.innerHTML = `
            <strong>Selected voice:</strong> ${voice.name}<br>
            <strong>Language:</strong> ${voice.lang}<br>
            <strong>Default:</strong> ${voice.default ? 'Yes' : 'No'}<br>
            <strong>Local/Remote:</strong> ${voice.localService ? 'Local' : 'Remote'}
          `;
        }
      } else {
        // Show general voice count info
        infoDiv.innerHTML = `<strong>${voices.length} voices available</strong> - Select a voice from the dropdown`;
      }
    }
    
    // Event handlers
    voiceSelect.addEventListener('change', function() {
      window.voiceSettings.selectedVoice = this.value;
      updateVoiceInfo();
    });
    
    voiceTypeSelect.addEventListener('change', function() {
      window.voiceSettings.voiceType = this.value;
    });
    
    langSelect.addEventListener('change', function() {
      window.voiceSettings.prefLang = this.value;
    });
    
    rateSlider.addEventListener('input', function() {
      window.voiceSettings.rate = parseFloat(this.value);
      document.getElementById('rate-value').textContent = this.value;
    });
    
    pitchSlider.addEventListener('input', function() {
      window.voiceSettings.pitch = parseFloat(this.value);
      document.getElementById('pitch-value').textContent = this.value;
    });
    
    testButton.addEventListener('click', function() {
      const testSentence = 'This is a test of the voice settings. How does it sound?';
      const hindiTestSentence = 'यह आवाज़ सेटिंग्स का परीक्षण है। यह कैसा लगता है?';
      
      // Determine which test sentence to use based on the selected voice language
      let selectedText = testSentence;
      const selectedLang = langSelect.value;
      
      if (selectedLang === 'hi-IN' || voiceSelect.value.startsWith('hi-')) {
        selectedText = hindiTestSentence;
      }
      
      // Remove any speaking class
      document.querySelectorAll('.hoverable-word.speaking').forEach(el => {
        el.classList.remove('speaking');
      });
      
      // Speak test sentence
      speakWord(selectedText);
    });
    
    resetButton.addEventListener('click', function() {
      // Reset to defaults
      window.voiceSettings = {
        rate: 0.9,
        pitch: 1.1,
        volume: 1,
        voiceIndex: 0,
        voiceType: 'auto',
        prefLang: 'auto',
        selectedVoice: null
      };
      
      // Update UI
      voiceSelect.value = '';
      voiceTypeSelect.value = 'auto';
      langSelect.value = 'auto';
      rateSlider.value = 0.9;
      pitchSlider.value = 1.1;
      document.getElementById('rate-value').textContent = '0.9';
      document.getElementById('pitch-value').textContent = '1.1';
      
      updateVoiceInfo();
    });
    
    // Mark as initialized
    window.voiceControlsInitialized = true;
  }
}

// Initialize voice controls after the page loads
window.addEventListener('DOMContentLoaded', initVoiceControls); 
