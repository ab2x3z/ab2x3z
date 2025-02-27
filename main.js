// Language switching functionality
let currentLang = 'en';

function toggleLanguage() {
  currentLang = currentLang === 'en' ? 'fr' : 'en';
  const langButton = document.getElementById('langToggle');
  langButton.textContent = currentLang === 'en' ? 'FR' : 'EN';
  
  // Update all elements with data-en and data-fr attributes
  document.querySelectorAll('[data-en]').forEach(element => {
    element.textContent = element.getAttribute(`data-${currentLang}`);
  });

  // Update form placeholders
  document.querySelectorAll('input, textarea').forEach(element => {
    const placeholderAttr = `data-placeholder-${currentLang}`;
    if (element.hasAttribute(placeholderAttr)) {
      element.placeholder = element.getAttribute(placeholderAttr);
    }
  });

  // Update HTML lang attribute
  document.documentElement.lang = currentLang;
}

document.getElementById('langToggle').addEventListener('click', toggleLanguage);

// Smooth scroll for navigation links
document.querySelectorAll('nav a').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    const targetSection = document.querySelector(targetId);
    targetSection.scrollIntoView({ behavior: 'smooth' });
  });
});

// Add animation to project cards when they come into view
const observerOptions = {
  threshold: 0.2
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
    } else {
      entry.target.classList.remove('show');
    }
  });
}, observerOptions);

document.querySelectorAll('.project-card').forEach(card => {
  observer.observe(card);
});

document.querySelectorAll('.skill-category').forEach(category => {
  observer.observe(category);
});