// js/gallery.js    
    document.addEventListener('DOMContentLoaded', function () {
      const galleryContainer = document.getElementById('gallery-container');
      const loadMoreContainer = document.getElementById('load-more-container');
      const galleryURL = 'gallery.json';
      let allImages = [];

      const hiddenLinksContainer = document.createElement('div');
      hiddenLinksContainer.id = 'hidden-gallery-links';
      hiddenLinksContainer.style.display = 'none';
      document.body.appendChild(hiddenLinksContainer);

      const imagesPerLoad = 5;
      const animationClasses = [
        'enter-from-right', 'enter-from-left', 'enter-from-bottom', 'enter-from-top',
        'enter-zoom-in', 'enter-fade', 'enter-rotate-scale', 'enter-flip-right',
        'enter-flip-down', 'enter-from-top-left', 'enter-from-bottom-right',
        'enter-skew', 'enter-soft-zoom', 'enter-newspaper', 'enter-bounce-right'
      ];
      let lastAnimation = '';

      // ১. স্মুথভাবে ছবি লোড করার ফাংশন (অপরিবর্তিত)
      function loadImages() {
        const hiddenLinks = Array.from(hiddenLinksContainer.children);
        const linksToShow = hiddenLinks.slice(0, imagesPerLoad);

        linksToShow.forEach((galleryItem, index) => {
          galleryContainer.appendChild(galleryItem);
          setTimeout(() => {
            galleryItem.classList.add('enter');
          }, 50 * index);
        });
        updateButtons();
      }

      // ==================== শুধুমাত্র এই ফাংশনটি সংশোধন করা হয়েছে ====================
      function hideImages() {
        const currentItems = Array.from(galleryContainer.children);

        // কতগুলো আইটেম সরাতে হবে তা গণনা করা হচ্ছে
        const itemsToRemoveCount = Math.min(imagesPerLoad, currentItems.length - imagesPerLoad);

        if (itemsToRemoveCount <= 0) return; // সরানোর মতো আইটেম না থাকলে কিছুই করবে না

        // শেষ থেকে আইটেমগুলো সিলেক্ট করা হচ্ছে
        const itemsToHide = currentItems.slice(-itemsToRemoveCount);

        itemsToHide.forEach((item) => {
          item.classList.remove('enter');
          item.classList.add('exit');
          item.addEventListener('transitionend', () => {
            // অদৃশ্য div-এ ফেরত পাঠানো হচ্ছে
            hiddenLinksContainer.prepend(item);
            item.classList.remove('exit');

            // সব আইটেম সরানো শেষ হলে বাটন আপডেট করা
            if (galleryContainer.children.length === currentItems.length - itemsToHide.length) {
              updateButtons();
            }
          }, { once: true });
        });
      }
      // ==============================================================================

      // ৩. বাটন ম্যানেজ করার ফাংশন (অপরিবর্তিত)
      function updateButtons() {
        loadMoreContainer.innerHTML = '';
        let buttonsHTML = '';
        if (hiddenLinksContainer.children.length > 0) {
          buttonsHTML += `<button id="load-more-btn" class="bg-green-700 text-white px-8 py-3 rounded-lg hover:bg-green-800 transition transform hover:scale-105">আরও ছবি দেখুন</button>`;
        }
        if (galleryContainer.children.length > imagesPerLoad) {
          buttonsHTML += `<button id="show-less-btn" class="ml-4 bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition">কম দেখুন</button>`;
        }
        loadMoreContainer.innerHTML = buttonsHTML;
        attachButtonListeners();
      }

      // ৪. বাটন লিসেনার (অপরিবর্তিত)
      function attachButtonListeners() {
        document.getElementById('load-more-btn')?.addEventListener('click', loadImages);
        document.getElementById('show-less-btn')?.addEventListener('click', hideImages);
      }

      // ৫. লাইটবক্স অ্যানিমেশন (অপরিবর্তিত)
      function applyLightboxAnimation(imageElement) {
        if (!imageElement) return;
        let randomAnimation;
        do {
          randomAnimation = animationClasses[Math.floor(Math.random() * animationClasses.length)];
        } while (randomAnimation === lastAnimation && animationClasses.length > 1);
        lastAnimation = randomAnimation;
        imageElement.className = 'lb-image carousel-item';
        setTimeout(() => {
          imageElement.classList.add(randomAnimation);
          requestAnimationFrame(() => {
            imageElement.classList.add('active');
          });
        }, 50);
      }

      // ৬. লাইটবক্স সেটআপ (অপরিবর্তিত)
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

      // ---- মূল ডেটা ফেচিং এবং শুরু ---- (অপরিবর্তিত)
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