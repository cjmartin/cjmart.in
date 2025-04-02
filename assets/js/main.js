document.addEventListener("DOMContentLoaded", function () {
  const imageSection = document.getElementById("image-section");

  function setImage(activeLink) {
    if (activeLink) {
      console.log(activeLink);
      const imageName = activeLink.getAttribute("data-image");
      const imagePosition = activeLink.getAttribute("data-image-position");
      if (!imageName) return;

      // Create a new image element to preload the image
      const img = new Image();

      // Add loading indication
      imageSection.classList.add("loading");

      // Set up the onload handler before setting the src
      img.onload = function () {
        // Apply the new image and position only after it's loaded
        imageSection.style.backgroundImage = `url('/assets/images/${imageName}')`;
        imageSection.style.backgroundPosition = imagePosition
          ? imagePosition
          : "";
        imageSection.classList.remove("loading");

        // Remove "active" class from all image-changing links
        document
          .querySelectorAll("#text-section a[data-image]")
          .forEach((link) => {
            link.classList.remove("active");
          });

        // Add "active" class to the clicked link
        activeLink.classList.add("active");
      };

      // Start loading the image
      img.src = `/assets/images/${imageName}`;
    }
  }

  // Check if the page is loaded with a hash (e.g., #dad)
  const hash = window.location.hash.substring(1);
  if (hash) {
    const link = document.querySelector(`#text-section a[href="#${hash}"]`);
    if (link) {
      setImage(link);
    }
  }

  // Handle click events on image-changing links
  document.querySelectorAll("#text-section a[data-image]").forEach((item) => {
    item.addEventListener("click", function (event) {
      event.preventDefault();
      setImage(this);
      history.replaceState(null, null, this.getAttribute("href"));
    });
  });

  // Email link
  const hello = document.getElementById("hello-link");

  if (hello) {
    const hi = "hello";
    const at = "cjmart";
    const tld = "in";
    const realEmail = hi + "@" + at + "." + tld;

    hello.addEventListener("click", function (event) {
      event.preventDefault(); // Prevent default mailto action

      // Copy email to clipboard
      navigator.clipboard
        .writeText(realEmail)
        .then(() => {
          // Update link text with the real email
          hello.textContent = realEmail;
          // Update message to say email has been copied
          document.getElementById("hello-message").textContent =
            "has been copied to your clipboard. Talk to you soon!";
          document.getElementById("hello-click").style.display = "none";
        })
        .catch((err) => {
          console.error("Failed to copy email:", err);
        });
    });
  }

  // Dark/Light mode toggle
  const toggleButton = document.getElementById("theme-toggle");
  const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

  // Load theme from localStorage
  const currentTheme = localStorage.getItem("theme");

  function updateIcon() {
    if (document.body.classList.contains("dark-mode")) {
      toggleButton.textContent = "🌞"; // Sun for dark mode
    } else {
      toggleButton.textContent = "🌛"; // Moon for light mode
    }
  }

  if (currentTheme === "dark" || (!currentTheme && prefersDarkScheme.matches)) {
    document.body.classList.add("dark-mode");
  }

  updateIcon(); // Set initial icon

  toggleButton.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
      localStorage.setItem("theme", "dark");
    } else {
      localStorage.setItem("theme", "light");
    }

    updateIcon(); // Update icon after toggle
  });
});
