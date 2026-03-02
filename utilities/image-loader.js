class ImageLoader {
  constructor() {
    this.lazyImages = [...document.querySelectorAll('img.lazyload')];
    this.init();
  }

  init() {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(this.handleIntersection);
      this.lazyImages.forEach(img => this.observer.observe(img));
    } else {
      this.loadImagesImmediately();
    }
  }
  
  handleIntersection = (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.loadImage(entry.target);
        this.observer.unobserve(entry.target);
      }
    });
  }
} 