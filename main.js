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

// Form submission handling
document.getElementById('contactForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const message = document.getElementById('message').value;
  
  // Here you would typically send this data to a server
  console.log('Form submitted:', { name, email, message });
  
  // Clear form
  this.reset();
  alert(currentLang === 'en' 
    ? 'Thank you for your message! I will get back to you soon.'
    : 'Merci pour votre message ! Je vous répondrai bientôt.');
});

// Add animation to project cards when they come into view
const observerOptions = {
  threshold: 0.2
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

document.querySelectorAll('.project-card').forEach(card => {
  card.style.opacity = '0';
  card.style.transform = 'translateY(20px)';
  card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(card);
});