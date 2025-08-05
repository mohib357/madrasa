// js/gallery.js

document.addEventListener('DOMContentLoaded', function () {
  const galleryContainer = document.getElementById('gallery-container');
  const loadMoreContainer = document.getElementById('load-more-container');

  // URL for the gallery data.
  const galleryURL = 'gallery.json';
  let allImages = [];
  const hiddenLinksContainer = document.createElement('div');
  hiddenLinksContainer.id = 'hidden-gallery-links';
  hiddenLinksContainer.style.display = 'none';
  document.body.appendChild(hiddenLinksContainer);

  // --- Configuration ---

  // Number of images to show/hide at a time.
  const imagesPerLoad = 5;

  // List of CSS animation classes for the lightbox.
  const animationClasses = [
    'enter-from-right', 'enter-from-left', 'enter-from-bottom', 'enter-from-top',
    'enter-zoom-in', 'enter-fade', 'enter-rotate-scale', 'enter-flip-right',
    'enter-flip-down', 'enter-from-top-left', 'enter-from-bottom-right',
    'enter-skew', 'enter-soft-zoom', 'enter-newspaper', 'enter-bounce-right'
  ];

  // Store the last used animation to avoid repetition.
  let lastAnimation = '';

  // --- Functions ---

  /**
     * Loads a batch of images from the hidden container to the visible gallery.
     */
  function loadImages() {
    const hiddenLinks = Array.from(hiddenLinksContainer.children);
    const linksToShow = hiddenLinks.slice(0, imagesPerLoad);

    // Move items and add a staggered animation effect.
    linksToShow.forEach((galleryItem, index) => {
      galleryContainer.appendChild(galleryItem);
      setTimeout(() => {
        galleryItem.classList.add('enter');

        // Stagger the animation start time.
      }, 50 * index);
    });
    updateButtons();
  }

  /**
       * Hides the last batch of images, moving them back to the hidden container.
       */
  function hideImages() {
    const currentItems = Array.from(galleryContainer.children);

    // Calculate how many images to remove.
    const itemsToRemoveCount = Math.min(imagesPerLoad, currentItems.length - imagesPerLoad);

    // Do nothing if not enough items to hide.
    if (itemsToRemoveCount <= 0) return;
    const itemsToHide = currentItems.slice(-itemsToRemoveCount);

    itemsToHide.forEach((item) => {
      item.classList.remove('enter');
      item.classList.add('exit');

      // After the exit animation finishes, move the item back to the hidden container.
      item.addEventListener('transitionend', () => {
        hiddenLinksContainer.prepend(item);
        item.classList.remove('exit');
        if (galleryContainer.children.length === currentItems.length - itemsToHide.length) {
          updateButtons();
        }

        // Listener runs only once per item.
      }, { once: true });
    });
  }

  /**
     * Shows/hides the 'Load More' and 'Show Less' buttons based on image count.
     */

  function updateButtons() {
    loadMoreContainer.innerHTML = '';
    let buttonsHTML = '';

    // Show 'Load More' if there are hidden images.
    if (hiddenLinksContainer.children.length > 0) {
      buttonsHTML += `<button id="load-more-btn" class="bg-green-700 text-white px-8 py-3 rounded-lg hover:bg-green-800 transition transform hover:scale-105">আরও ছবি দেখুন</button>`;
    }

    // Show 'Show Less' if more than the initial batch is visible. 
    if (galleryContainer.children.length > imagesPerLoad) {
      buttonsHTML += `<button id="show-less-btn" class="ml-4 bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition">কম দেখুন</button>`;
    }
    loadMoreContainer.innerHTML = buttonsHTML;

    // Re-attach listeners to the new buttons.
    attachButtonListeners();
  }

  /**
     * Attaches click event listeners to the gallery buttons.
     */
  function attachButtonListeners() {
    document.getElementById('load-more-btn')?.addEventListener('click', loadImages);
    document.getElementById('show-less-btn')?.addEventListener('click', hideImages);
  }

  /**
     * Applies a random animation to the lightbox image.
     * @param {HTMLElement} imageElement - The lightbox image element.
     */
  function applyLightboxAnimation(imageElement) {
    if (!imageElement) return;
    let randomAnimation;

    // Ensure the new animation is different from the last one.
    do {
      randomAnimation = animationClasses[Math.floor(Math.random() * animationClasses.length)];
    } while (randomAnimation === lastAnimation && animationClasses.length > 1);
    lastAnimation = randomAnimation;

    // Apply animation classes.
    imageElement.className = 'lb-image carousel-item';
    setTimeout(() => {
      imageElement.classList.add(randomAnimation);
      requestAnimationFrame(() => {
        imageElement.classList.add('active');
      });
    }, 50);
  }

  /**
       * Sets up an observer to animate the lightbox image whenever it's opened or changed.
       */
  function setupLightbox() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.addedNodes.length) {
          const lightboxNode = Array.from(mutation.addedNodes).find(node => node.id === 'lightbox');
          if (lightboxNode) {
            const image = lightboxNode.querySelector('.lb-image');
            if (image) {
              applyLightboxAnimation(image);
              const imageObserver = new MutationObserver(() => applyLightboxAnimation(image));
              imageObserver.observe(image, { attributes: true, attributeFilter: ['src'] });
            }
          }
        }
      });
    });
    observer.observe(document.body, { childList: true });
  }

  // --- Initialization ---

  // Fetch gallery data from JSON file and initialize the gallery.
  fetch(galleryURL)
    .then(response => response.ok ? response.json() : Promise.reject('Network response was not ok'))
    .then(images => {
      galleryContainer.innerHTML = '';
      allImages = images;
      if (allImages.length > 0) {
        allImages.forEach((image, index) => {
          const galleryItem = document.createElement('div');
          galleryItem.className = 'gallery-thumbnail aspect-square overflow-hidden rounded-lg shadow-lg group';
          galleryItem.innerHTML = `<a href="${image.src}" data-lightbox="gallery" data-title="${image.alt}" data-index="${index}"><img src="${image.src}" alt="${image.alt}" loading="lazy" class="w-full h-full object-cover group-hover:scale-110 transition duration-300 cursor-pointer"></a>`;
          hiddenLinksContainer.appendChild(galleryItem);
        });
        loadImages();
        setupLightbox();
      } else {
        galleryContainer.innerHTML = '<p class="col-span-full text-center text-gray-600">গ্যালারিতে কোনো ছবি পাওয়া যায়নি।</p>';
      }
    })
    .catch(error => {
      console.error('Error fetching gallery images:', error);
      galleryContainer.innerHTML = '<p class="col-span-full text-center text-red-500">গ্যালারির ছবি লোড করা সম্ভব হয়নি।</p>';
    });
});