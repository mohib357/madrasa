// js/slider.js    
    document.addEventListener('DOMContentLoaded', async function () {
      async function getSlideData() {
        try {
          const response = await fetch('slides.json');
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return await response.json();
        } catch (error) {
          console.error("Could not fetch slide data:", error);
          return [];
        }
      }
      const slideData = await getSlideData();
      const wrapper = document.querySelector('.carousel-wrapper');
      const dotsContainer = document.getElementById('carousel-dots');
      if (!slideData || slideData.length === 0) {
        wrapper.innerHTML = '<p class="text-center text-gray-500 p-8">No slides to display.</p>';
        return;
      }
      slideData.forEach(data => {
        const item = document.createElement('div');
        item.className = 'carousel-item w-full h-full absolute top-0 left-0';
        item.innerHTML = `
        <img src="${data.image}" alt="${data.caption}" class="w-full h-full object-cover" loading="lazy" />
        <div class="absolute top-3 left-3 p-3 bg-green-800/50 rounded-2xl">
          <h1 class="text-white text-xl font-semibold drop-shadow-[3px_3px_0_black]">${data.caption}</h1>
        </div>
        `;
        wrapper.appendChild(item);
      });
      const items = document.querySelectorAll('.carousel-item');
      const totalItems = items.length;
      let currentIndex = 0;
      let slideInterval;
      const slideDuration = 5000;
      const effects = [
        { enter: 'enter-from-right', exit: 'exit-to-left' },
        { enter: 'enter-from-left', exit: 'exit-to-right' },
        { enter: 'enter-from-bottom', exit: 'exit-to-top' },
        { enter: 'enter-from-top', exit: 'exit-to-bottom' },
        { enter: 'enter-zoom-in', exit: 'exit-zoom-out' },
        { enter: 'enter-fade', exit: 'exit-fade' },
        { enter: 'enter-rotate-scale', exit: 'exit-rotate-scale' },
        { enter: 'enter-flip-right', exit: 'exit-flip-left' },
        { enter: 'enter-flip-down', exit: 'exit-flip-up' },
        { enter: 'enter-from-top-left', exit: 'exit-to-bottom-right' },
        { enter: 'enter-from-bottom-right', exit: 'exit-to-top-left' },
        { enter: 'enter-skew', exit: 'exit-skew' },
        { enter: 'enter-soft-zoom', exit: 'exit-soft-zoom' },
        { enter: 'enter-newspaper', exit: 'exit-newspaper' },
        { enter: 'enter-bounce-right', exit: 'exit-bounce-left' },
      ];
      let shuffledEffects = [];

      // Fisher-Yates Shuffle Algorithm দিয়ে অ্যারে এলোমেলো করার ফাংশন
      function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]]; // Swap elements
        }
      }
      function getNextEffect() {
        if (shuffledEffects.length === 0) {
          shuffledEffects = [...effects];
          shuffleArray(shuffledEffects);
        }
        return shuffledEffects.pop();
      }
      const rootStyles = getComputedStyle(document.documentElement);
      const transitionDuration = parseFloat(rootStyles.getPropertyValue('--carousel-transition-duration')) || 1000;
      for (let i = 0; i < totalItems; i++) {
        const dot = document.createElement('button');
        dot.className = 'w-3 h-3 rounded-full transition-colors duration-300';
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dotsContainer.appendChild(dot);
      }
      const dots = dotsContainer.querySelectorAll('#carousel-dots button');
      function updateDots() {
        const activeColor = rootStyles.getPropertyValue('--dot-active-color').trim();
        const inactiveColor = rootStyles.getPropertyValue('--dot-inactive-color').trim();
        dots.forEach((dot, index) => {
          dot.style.backgroundColor = index === currentIndex ? activeColor : inactiveColor;
        });
      }
      function goToSlide(newIndex) {
        if (currentIndex === newIndex) return;
        const oldIndex = currentIndex;
        const effect = getNextEffect();
        const currentItem = items[oldIndex];
        const newItem = items[newIndex];
        newItem.classList.add(effect.enter);
        requestAnimationFrame(() => {
          currentItem.classList.add(effect.exit);
          currentItem.classList.remove('active');
          newItem.classList.add('active');
          newItem.classList.remove(effect.enter);
        });
        setTimeout(() => {
          currentItem.classList.remove(effect.exit);
        }, transitionDuration);
        currentIndex = newIndex;
        updateDots();
      }
      function nextSlide() {
        let nextIndex;
        do {
          nextIndex = Math.floor(Math.random() * totalItems);
        } while (totalItems > 1 && nextIndex === currentIndex);
        if (totalItems <= 1) return;
        goToSlide(nextIndex);
      }
      function startInterval() {
        slideInterval = setInterval(nextSlide, slideDuration);
        dots.forEach((dot, index) => dot.addEventListener('click', () => {
          goToSlide(index);
          clearInterval(slideInterval);
          startInterval();
        }));
      }
      items[0].classList.add('active');
      updateDots();
      startInterval();
    });