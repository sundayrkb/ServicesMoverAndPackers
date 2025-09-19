// Set current year in footer
document.getElementById('year').textContent = new Date().getFullYear();

// Initialize AOS if included
if (typeof AOS !== 'undefined') {
  AOS.init({ duration: 700, once: true });
}
