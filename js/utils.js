/**
 * Opportunity Finder - Utility Functions
 */

// Storage utilities
const Storage = {
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      return false;
    }
  },

  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (e) {
      return false;
    }
  }
};

// DOM utilities
const DOM = {
  $(selector, context = document) {
    return context.querySelector(selector);
  },

  $$(selector, context = document) {
    return Array.from(context.querySelectorAll(selector));
  },

  create(tag, options = {}) {
    const element = document.createElement(tag);
    
    if (options.className) {
      element.className = options.className;
    }
    
    if (options.text) {
      element.textContent = options.text;
    }
    
    if (options.html) {
      element.innerHTML = options.html;
    }
    
    if (options.attributes) {
      Object.entries(options.attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
      });
    }
    
    if (options.styles) {
      Object.assign(element.style, options.styles);
    }
    
    if (options.parent) {
      options.parent.appendChild(element);
    }
    
    return element;
  },

  on(element, event, handler, options = {}) {
    element.addEventListener(event, handler, options);
    return () => element.removeEventListener(event, handler, options);
  }
};

// Animation utilities
const Animation = {
  fadeIn(element, duration = 300) {
    element.style.opacity = '0';
    element.style.display = 'block';
    
    const start = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);
      
      element.style.opacity = progress;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  },

  fadeOut(element, duration = 300) {
    const start = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);
      
      element.style.opacity = 1 - progress;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        element.style.display = 'none';
      }
    };
    
    requestAnimationFrame(animate);
  },

  slideUp(element, duration = 300) {
    element.style.transform = 'translateY(20px)';
    element.style.opacity = '0';
    element.style.display = 'block';
    
    const start = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      element.style.transform = `translateY(${20 * (1 - easeProgress)}px)`;
      element.style.opacity = easeProgress;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }
};

// Toast notifications
const Toast = {
  container: null,

  init() {
    if (!this.container) {
      this.container = DOM.create('div', {
        className: 'toast-container',
        parent: document.body
      });
    }
  },

  show(message, type = 'info', title = '', duration = 4000) {
    this.init();

    const icons = {
      info: '💡',
      success: '✅',
      error: '❌',
      warning: '⚠️'
    };

    const toast = DOM.create('div', {
      className: `toast toast-${type}`,
      html: `
        <span class="toast-icon">${icons[type]}</span>
        <div class="toast-content">
          ${title ? `<div class="toast-title">${title}</div>` : ''}
          <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close">✕</button>
      `
    });

    const closeBtn = DOM.$('.toast-close', toast);
    closeBtn.addEventListener('click', () => this.remove(toast));

    this.container.appendChild(toast);

    if (duration > 0) {
      setTimeout(() => this.remove(toast), duration);
    }

    return toast;
  },

  remove(toast) {
    toast.style.animation = 'slideIn 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  },

  success(message, title = 'Success') {
    return this.show(message, 'success', title);
  },

  error(message, title = 'Error') {
    return this.show(message, 'error', title);
  },

  warning(message, title = 'Warning') {
    return this.show(message, 'warning', title);
  },

  info(message, title = '') {
    return this.show(message, 'info', title);
  }
};

// Form validation
const Validation = {
  email(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  minLength(value, min) {
    return value.length >= min;
  },

  maxLength(value, max) {
    return value.length <= max;
  },

  d(value) {
    return value.trim().length > 0;
  }
};

// Date formatting
const DateFormat = {
  format(date, format = 'short') {
    const d = new Date(date);
    
    if (format === 'short') {
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
    
    if (format === 'long') {
      return d.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    }
    
    if (format === 'relative') {
      const now = new Date();
      const diff = now - d;
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (seconds < 60) return 'Just now';
      if (minutes < 60) return `${minutes}m ago`;
      if (hours < 24) return `${hours}h ago`;
      if (days < 7) return `${days}d ago`;
      
      return this.format(date, 'short');
    }
    
    return d.toISOString();
  }
};

// Random utilities
const Random = {
  int(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  float(min, max) {
    return Math.random() * (max - min) + min;
  },

  choice(array) {
    return array[Math.floor(Math.random() * array.length)];
  },

  id(prefix = '') {
    return `${prefix}${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
};

// Export utilities
typeof module !== 'undefined' && (module.exports = {
  Storage, DOM, Animation, Toast, Validation, DateFormat, Random
});
