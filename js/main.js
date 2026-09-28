// Set current year in footer (runs after partials load)
function setYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

// Navigation handler for file:// protocol - resolves relative links from project root
function initNavigation() {
  const isFileProtocol = location.protocol === 'file:';
  if (!isFileProtocol) return;

  // For file:// URLs, location.pathname gives the full file path
  // e.g., /home/sunday/openidea/projects/ServicesMoverAndPackers/services/home-relocation.html
  const fullPath = decodeURIComponent(location.pathname);
  
  // Find the project root directory index
  const projectName = 'ServicesMoverAndPackers';
  const projectIndex = fullPath.indexOf('/' + projectName + '/');
  
  if (projectIndex === -1) {
    console.warn('Could not find project root in path:', fullPath);
    return;
  }
  
  // Project root path (directory containing the project)
  const projectRootPath = fullPath.substring(0, projectIndex + projectName.length + 1);
  
  document.addEventListener('click', function(e) {
    const link = e.target.closest('nav a[href]');
    if (!link) return;
    
    const href = link.getAttribute('href');
    // Skip external links
    if (href.startsWith('tel:') || href.startsWith('http') || href.startsWith('mailto:')) return;
    
    e.preventDefault();
    
    // Build absolute file:// URL from project root
    // Remove leading ./ if present
    const cleanHref = href.replace(/^\.\//, '');
    const targetUrl = 'file://' + projectRootPath + '/' + cleanHref;
    
    location.href = targetUrl;
  });
}

// Sticky header shadow on scroll
(function() {
  const header = document.querySelector('header');
  if (!header) return;
  let lastScroll = 0;
  window.addEventListener('scroll', function() {
    const currentScroll = window.pageYOffset;
    if (currentScroll > 10) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
  }, { passive: true });
})();

// Load partials (header, footer) client-side
(async function loadPartials() {
  const isFileProtocol = location.protocol === 'file:';
  const partials = document.querySelectorAll('[data-partial]');
  
  // Get current page's directory path for resolving relative URLs
  const currentPath = location.pathname;
  const currentDir = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
  
  for (const el of partials) {
    let url = el.dataset.partial;
    
    // Skip fetch entirely for file:// protocol - use fallback directly
    if (isFileProtocol) {
      console.log('file:// protocol detected, using fallback for:', url);
      if (url.includes('header')) {
        el.outerHTML = getFallbackHeader();
      } else if (url.includes('footer')) {
        el.outerHTML = getFallbackFooter();
      }
      continue;
    }
    
    // Resolve relative URL from current page's directory
    if (!url.startsWith('/') && !url.startsWith('http')) {
      // Handle ../ and ./ properly
      let resolvedUrl = currentDir + url;
      // Normalize path: remove ./ and resolve ../
      const parts = resolvedUrl.split('/');
      const normalized = [];
      for (const part of parts) {
        if (part === '..') {
          normalized.pop();
        } else if (part !== '.' && part !== '') {
          normalized.push(part);
        }
      }
      url = '/' + normalized.join('/');
    }
    
    try {
      const res = await fetch(url);
      if (res.ok) {
        el.outerHTML = await res.text();
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (e) {
      console.warn('Partial load failed:', url, e);
      // Fallback: inline minimal header/footer
      if (url.includes('header')) {
        el.outerHTML = getFallbackHeader();
      } else if (url.includes('footer')) {
        el.outerHTML = getFallbackFooter();
      }
    }
  }
  // Set year after partials injected
  setYear();
  // Re-run header scroll handler after header injected
  initStickyHeader();
  // Init navigation handler for file://
  initNavigation();
})();

function getFallbackHeader() {
  return `<header>
  <nav class="navbar">
    <a href="index.html" class="logo">Services Mover & Packers</a>
  </nav>
  <nav class="nav-links" aria-label="Main navigation">
    <a href="index.html">Home</a>    
    <a href="/services/index.html">Services</a>
    <a href="/locations/index.html">Locations</a>
    <div class="nav-actions">
      <a href="tel:+919293120124" class="phone-link">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
        <span>Call Now</span>
      </a>
      <a href="https://wa.me/919293120124?text=Hi%2C%20I%20need%20a%20quote%20for%20Packers%20and%20Movers%20services" class="whatsapp-link">
        <svg class="icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378 9.86 9.86 0 0 1-1.379-5.031c-.084-.526-.084-1.078-.084-1.63 0-.553.084-1.105.084-1.658a9.87 9.87 0 0 1 1.379-5.03 9.87 9.87 0 0 1 5.03-1.38c.527.085 1.08.084 1.633.084.552 0 1.105-.085 1.657-.084a9.86 9.86 0 0 1 5.03 1.38 9.86 9.86 0 0 1 1.38 5.03c.084.526.084 1.08.084 1.63 0 .552-.084 1.105-.085 1.657a9.87 9.87 0 0 1-1.38 5.03 9.87 9.87 0 0 1-5.03 1.38c-.552 0-1.105-.085-1.657-.084z"/></svg>
        <span>WhatsApp</span>
      </a>
    </div>
  </nav>
</header>

<!-- Floating WhatsApp Button (right) -->
<a href="https://wa.me/919293120124?text=Hi%2C%20I%20need%20a%20quote%20for%20Packers%20and%20Movers%20services" 
   class="whatsapp-float" 
   target="_blank" 
   rel="noopener noreferrer"
   aria-label="Chat on WhatsApp">
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378 9.86 9.86 0 0 1-1.379-5.031c-.084-.526-.084-1.078-.084-1.63 0-.553.084-1.105.084-1.658a9.87 9.87 0 0 1 1.379-5.03 9.87 9.87 0 0 1 5.03-1.38c.527.085 1.08.084 1.633.084.552 0 1.105-.085 1.657-.084a9.86 9.86 0 0 1 5.03 1.38 9.86 9.86 0 0 1 1.38 5.03c.084.526.084 1.08.084 1.63 0 .552-.084 1.105-.085 1.657a9.87 9.87 0 0 1-1.38 5.03 9.87 9.87 0 0 1-5.03 1.38c-.552 0-1.105-.085-1.657-.084z"/></svg>
</a>

<!-- Floating Call Button (left) -->
<a href="tel:+919293120124" 
   class="call-float" 
   aria-label="Call us">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
</a>`;
}

function getFallbackFooter() {
  return `<footer>
  <nav class="footer-nav" aria-label="Footer navigation">
    <a href="index.html">Home</a>
    <a href="services/index.html">Services</a>
    <a href="locations/index.html">Areas We Serve</a>
    <a href="blog/index.html">Blog</a>
    <a href="tel:+919293120124">Contact</a>
  </nav>
  
  <p>&copy; <span id="year"></span> Services Mover & Packers. All rights reserved.</p>
</footer>`;
}

// Sticky header shadow on scroll
function initStickyHeader() {
  const header = document.querySelector('header');
  if (!header) return;
  window.addEventListener('scroll', function() {
    if (window.pageYOffset > 10) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });
}

// Image fallback icons
(function addImageFallbacks() {
  const iconMap = {
    'home-relocation': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    'office-shifting': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
    'packing-services': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
    'moving-checklist': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
    'packing-tips': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
    'banjara-hills': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>',
    'jubilee-hills': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>',
    'gachibowli': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>',
    'banner': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>',
  };

  document.querySelectorAll('img[data-fallback]').forEach(img => {
    img.addEventListener('error', function() {
      const key = this.dataset.fallback;
      const svg = iconMap[key] || iconMap['banner'];
      this.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 24 24">' + svg + '</svg>'
      );
      this.alt = this.alt || 'Image';
      this.classList.add('fallback-icon');
    });
  });
})();

// Initialize AOS if included
if (typeof AOS !== 'undefined') {
  AOS.init({ duration: 700, once: true });
}
