const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const year = document.querySelector("[data-year]");

function syncIllustrationsNavLabel() {
  document.querySelectorAll('a[href="world.html"]').forEach((link) => {
    if (link.textContent.trim().toLowerCase() === "world") {
      link.textContent = "Illustrations";
    }
  });
}

function syncHeader() {
  header.classList.toggle("scrolled", window.scrollY > 20);
}

syncIllustrationsNavLabel();

navToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

nav.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    nav.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  }
});

year.textContent = new Date().getFullYear();
syncHeader();
window.addEventListener("scroll", syncHeader, { passive: true });

const lightboxImages = document.querySelectorAll("[data-lightbox-image]");

if (lightboxImages.length) {
  const lightbox = document.createElement("div");
  lightbox.className = "image-lightbox";
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");
  lightbox.innerHTML = '<button class="lightbox-close" type="button" aria-label="Close image">&times;</button><button class="lightbox-nav lightbox-prev" type="button" aria-label="Previous image">&#10094;</button><img alt=""><button class="lightbox-nav lightbox-next" type="button" aria-label="Next image">&#10095;</button>';
  document.body.appendChild(lightbox);

  const lightboxImage = lightbox.querySelector("img");
  const closeButton = lightbox.querySelector(".lightbox-close");
  const previousButton = lightbox.querySelector(".lightbox-prev");
  const nextButton = lightbox.querySelector(".lightbox-next");
  let activeImageIndex = 0;

  function showLightboxImage(index) {
    activeImageIndex = (index + lightboxImages.length) % lightboxImages.length;
    const image = lightboxImages[activeImageIndex];
    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt;
  }

  function closeLightbox() {
    lightbox.classList.remove("open");
    lightboxImage.removeAttribute("src");
    lightboxImage.alt = "";
  }

  lightboxImages.forEach((image, index) => {
    image.addEventListener("click", () => {
      showLightboxImage(index);
      lightbox.classList.add("open");
    });
  });

  previousButton.addEventListener("click", () => {
    showLightboxImage(activeImageIndex - 1);
  });

  nextButton.addEventListener("click", () => {
    showLightboxImage(activeImageIndex + 1);
  });

  closeButton.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (!lightbox.classList.contains("open")) {
      return;
    }
    if (event.key === "Escape") {
      closeLightbox();
    }
    if (event.key === "ArrowLeft") {
      showLightboxImage(activeImageIndex - 1);
    }
    if (event.key === "ArrowRight") {
      showLightboxImage(activeImageIndex + 1);
    }
  });
}
