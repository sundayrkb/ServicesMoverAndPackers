// basic startup: AOS (animate on scroll)
document.getElementById('year').textContent = new Date().getFullYear();
AOS.init({ duration: 700, once: true });

// (optional) hook to change contact info easily
// document.getElementById('contact-phone').textContent = "+91-90000-00000";
