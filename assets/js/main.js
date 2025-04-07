document.addEventListener("DOMContentLoaded", () => {
  const config = {
    images: {
      initialDelay: 10000, // 10 seconds before starting auto-rotation
      rotationInterval: 5000, // 5 seconds between image changes
      containerSelector: "#image-section",
      linkSelector: "#text-section a[data-image]",
      basePath: "/assets/images/"
    },
    email: {
      linkId: "hello-link",
      messageId: "hello-message",
      clickId: "hello-click",
      address: {
        user: "hello",
        domain: "cjmart",
        tld: "in"
      }
    },
    theme: {
      toggleId: "theme-toggle",
      darkClass: "dark-mode",
      storageKey: "theme"
    }
  };

  // Initialize all modules
  const imageRotator = createImageRotator(config.images);
  initEmailHandler(config.email);
  initThemeToggle(config.theme);
  
  // Initialize from URL hash if present
  const hash = window.location.hash.substring(1);
  if (hash) {
    const link = document.querySelector(`#text-section a[href="#${hash}"]`);
    link && imageRotator.setImage(link);
  }

  // Start image auto-rotation after the initial delay
  setTimeout(() => imageRotator.startAutoRotation(), config.images.initialDelay);
});

/**
 * Image rotation module
 */
function createImageRotator(config) {
  const imageSection = document.getElementById(config.containerSelector.substring(1));
  const preloadedImages = {};
  let autoRotationTimer = null;
  let userInteracted = false;

  // Image handling functions
  function setImage(activeLink) {
    if (!activeLink) return;
    
    const imageName = activeLink.getAttribute("data-image");
    const imagePosition = activeLink.getAttribute("data-image-position") || "";
    
    if (!imageName) return;

    // Add loading indication
    imageSection.classList.add("loading");
    
    // Set up callback for after image loads
    const callback = () => {
      // Apply the new image and position
      imageSection.style.backgroundImage = `url('${config.basePath}${imageName}')`;
      imageSection.style.backgroundPosition = imagePosition;
      imageSection.classList.remove("loading");

      // Update active link styling
      document.querySelectorAll(config.linkSelector).forEach(link => {
        link.classList.remove("active");
      });
      activeLink.classList.add("active");
    };

    preloadImage(imageName, callback);
  }

  function preloadImage(imageName, callback) {
    if (!imageName) {
      callback?.();
      return;
    }

    if (preloadedImages[imageName]) {
      callback?.();
      return;
    }

    const img = new Image();
    img.onload = () => {
      preloadedImages[imageName] = img;
      callback?.();
    };

    img.onerror = () => {
      console.error(`Failed to load image: ${imageName}`);
      callback?.();
    };

    img.src = `${config.basePath}${imageName}`;
  }

  function startAutoRotation() {
    if (userInteracted) return;

    const imageLinks = Array.from(document.querySelectorAll(config.linkSelector));
    if (imageLinks.length <= 1) return;

    let currentIndex = 0;
    let nextIndex = 1;

    // Find current active image index
    const activeLink = document.querySelector(`${config.linkSelector}.active`);
    if (activeLink) {
      const activeIndex = imageLinks.indexOf(activeLink);
      if (activeIndex !== -1) {
        currentIndex = (activeIndex + 1) % imageLinks.length;
        nextIndex = (currentIndex + 1) % imageLinks.length;
      }
    }

    // Preload the next image
    const nextImageName = imageLinks[nextIndex]?.getAttribute("data-image");
    nextImageName && preloadImage(nextImageName);

    autoRotationTimer = setInterval(() => {
      if (userInteracted) {
        clearInterval(autoRotationTimer);
        return;
      }

      // Move to next image
      setImage(imageLinks[currentIndex]);

      // Update indices for next cycle
      currentIndex = (currentIndex + 1) % imageLinks.length;
      nextIndex = (currentIndex + 1) % imageLinks.length;

      // Preload the image for the next cycle
      const nextImageName = imageLinks[nextIndex]?.getAttribute("data-image");
      nextImageName && preloadImage(nextImageName);
    }, config.rotationInterval);
  }

  // Set up event delegation for image link clicks
  document.addEventListener("click", (event) => {
    const link = event.target.closest(config.linkSelector);
    if (!link) return;
    
    event.preventDefault();
    userInteracted = true;
    
    // Stop auto-rotation
    if (autoRotationTimer) {
      clearInterval(autoRotationTimer);
    }

    setImage(link);
    history.replaceState(null, null, link.getAttribute("href"));
  });

  return {
    setImage,
    startAutoRotation,
    preloadImage
  };
}

/**
 * Email handler module
 */
function initEmailHandler({ linkId, messageId, clickId, address }) {
  const hello = document.getElementById(linkId);
  if (!hello) return;

  const realEmail = `${address.user}@${address.domain}.${address.tld}`;

  hello.addEventListener("click", (event) => {
    event.preventDefault();

    navigator.clipboard.writeText(realEmail)
      .then(() => {
        // Update UI elements
        hello.textContent = realEmail;
        
        const messageEl = document.getElementById(messageId);
        if (messageEl) {
          messageEl.textContent = "has been copied to your clipboard. Talk to you soon!";
        }
        
        const clickEl = document.getElementById(clickId);
        if (clickEl) {
          clickEl.style.display = "none";
        }
      })
      .catch((err) => {
        console.error("Failed to copy email:", err);
      });
  });
}

/**
 * Theme toggle module
 */
function initThemeToggle({ toggleId, darkClass, storageKey }) {
  const toggleButton = document.getElementById(toggleId);
  if (!toggleButton) return;

  const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
  const currentTheme = localStorage.getItem(storageKey);

  function updateTheme(isDark) {
    if (isDark) {
      document.body.classList.add(darkClass);
      toggleButton.textContent = "🌞"; // Sun for dark mode
    } else {
      document.body.classList.remove(darkClass);
      toggleButton.textContent = "🌛"; // Moon for light mode
    }
  }

  // Set initial theme
  if (currentTheme === "dark" || (!currentTheme && prefersDarkScheme.matches)) {
    updateTheme(true);
  } else {
    updateTheme(false);
  }

  // Handle toggle clicks
  toggleButton.addEventListener("click", () => {
    const isDarkMode = !document.body.classList.contains(darkClass);
    updateTheme(isDarkMode);
    localStorage.setItem(storageKey, isDarkMode ? "dark" : "light");
  });
  
  // Listen for system preference changes
  prefersDarkScheme.addEventListener("change", (e) => {
    if (!localStorage.getItem(storageKey)) {
      updateTheme(e.matches);
    }
  });
}