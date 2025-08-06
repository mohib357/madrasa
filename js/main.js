// js/main.js


// Mobile menu toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
mobileMenuBtn.addEventListener('click', () => {
  mobileMenu.classList.toggle('hidden');
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });

      // Close mobile menu if open
      mobileMenu.classList.add('hidden');
    }
  });
});

// Add active class to navigation items on scroll
window.addEventListener('scroll', () => {
  let current = '';
  const sections = document.querySelectorAll('section');
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;

    // The offset (-200) makes the link active slightly before the section top hits the viewport top.
    if (scrollY >= (sectionTop - 200)) {
      current = section.getAttribute('id');
    }
  });
  document.querySelectorAll('nav a').forEach(link => {
    link.classList.remove('text-green-300');
    if (link.getAttribute('href').slice(1) === current) {
      link.classList.add('text-green-300');
    }
  });
});