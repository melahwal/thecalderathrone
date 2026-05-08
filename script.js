const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const year = document.querySelector("[data-year]");

function syncActiveNavLink() {
  const currentPath = window.location.pathname.split("/").pop() || "index.html";

  document.querySelectorAll(".site-nav a").forEach((link) => {
    const linkPath = link.getAttribute("href");

    if (linkPath === currentPath) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function syncHeader() {
  if (!header) {
    return;
  }

  header.classList.toggle("scrolled", window.scrollY > 20);
}

syncActiveNavLink();

if (navToggle && nav) {
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
}

if (year) {
  year.textContent = new Date().getFullYear();
}

syncHeader();
window.addEventListener("scroll", syncHeader, { passive: true });

/* === Image lightbox === */

const lightboxImages = document.querySelectorAll("[data-lightbox-image]");

if (lightboxImages.length) {
  const lightbox = document.createElement("div");
  lightbox.className = "image-lightbox";
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");
  lightbox.innerHTML = `
    <button class="lightbox-close" type="button" aria-label="Close image">&times;</button>
    <button class="lightbox-nav lightbox-prev" type="button" aria-label="Previous image">&#10094;</button>
    <img alt="">
    <button class="lightbox-nav lightbox-next" type="button" aria-label="Next image">&#10095;</button>
  `;

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
    lightboxImage.alt = image.alt || "";
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

/* === Contact form === */

const contactForm = document.querySelector("[data-contact-form]");

if (contactForm) {
  const contactStatus = contactForm.querySelector("[data-contact-status]");
  const submitButton = contactForm.querySelector('button[type="submit"]');

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!contactStatus || !submitButton) {
      return;
    }

    contactStatus.textContent = "Sending your inquiry...";
    contactStatus.className = "form-status full";
    submitButton.disabled = true;

    try {
      const response = await fetch(contactForm.action, {
        method: "POST",
        body: new FormData(contactForm),
        headers: {
          Accept: "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Form submission failed.");
      }

      contactForm.reset();
      contactStatus.textContent = "Thank you. Your inquiry has been sent successfully.";
      contactStatus.classList.add("success");
    } catch (error) {
      contactStatus.textContent = "Sorry, your message could not be sent. Please email melahwal@hotmail.com directly.";
      contactStatus.classList.add("error");
    } finally {
      submitButton.disabled = false;
    }
  });
}

/* === Visitor counters === */
/*
  Static-site counter rules:
  - Unique Visitors starts at 1,200 and counts a visitor once per browser/device.
  - Total Visits uses the existing total counter, but it increases only on the home page.
  - Moving between internal pages does not increase Total Visits.
  - True IP-based unique counting requires a backend/analytics service; frontend JavaScript cannot securely count by IP address.
*/

const visitorCounter = (() => {
  const uniqueVisitors = document.querySelector("[data-unique-visitors]");
  const totalVisits = document.querySelector("[data-total-visits]");

  if (!uniqueVisitors || !totalVisits) {
    return null;
  }

  const counterNamespace = "thecalderathrone";
  const counterBaseUrl = `https://api.counterapi.dev/v1/${counterNamespace}`;

  const uniqueBase = 1200;
  const totalBase = 2500;

  const uniqueCounterName = "unique-visitors-v20260508d";
  const totalCounterName = "total-visits";
  const uniqueStorageKey = "calderaThroneUniqueVisitorCounted_v20260508d";
  const sessionVisitKey = "calderaThroneHomeVisitCountedThisSession_v20260508d";

  const isLocalPreview = ["localhost", "127.0.0.1", ""].includes(window.location.hostname);

  function isHomePage() {
    const path = window.location.pathname.replace(/\/+$/, "");
    const file = path.split("/").pop();

    return (
      path === "" ||
      path === "/" ||
      file === "" ||
      file === "index.html"
    );
  }

  function formatCount(value) {
    return Number(value).toLocaleString("en-US");
  }

  function setFallbackValues() {
    uniqueVisitors.textContent = `${formatCount(uniqueBase)}+`;
    totalVisits.textContent = `${formatCount(totalBase)}+`;
  }

  function counterValue(data) {
    const rawValue = data && (data.count ?? data.value);
    const value = Number(rawValue);

    if (!Number.isFinite(value)) {
      throw new Error("Counter response did not include a numeric value.");
    }

    return value;
  }

  async function requestCounter(name, action = "") {
    const endpoint = action
      ? `${counterBaseUrl}/${name}/${action}`
      : `${counterBaseUrl}/${name}`;

    const response = await fetch(endpoint, {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Counter request failed: ${response.status}`);
    }

    const data = await response.json();
    return counterValue(data);
  }

  async function readTotalVisits() {
    try {
      const totalCount = await requestCounter(totalCounterName);
      totalVisits.textContent = formatCount(totalBase + totalCount);
    } catch (error) {
      totalVisits.textContent = `${formatCount(totalBase)}+`;
    }
  }

  async function updateTotalVisits() {
    try {
      if (!isHomePage()) {
        await readTotalVisits();
        return;
      }

      let alreadyCountedThisSession = false;

      try {
        alreadyCountedThisSession = sessionStorage.getItem(sessionVisitKey) === "true";
      } catch (error) {
        alreadyCountedThisSession = false;
      }

      if (alreadyCountedThisSession) {
        await readTotalVisits();
        return;
      }

      const totalCount = await requestCounter(totalCounterName, "up");
      totalVisits.textContent = formatCount(totalBase + totalCount);

      try {
        sessionStorage.setItem(sessionVisitKey, "true");
      } catch (error) {
        /* sessionStorage unavailable; total was still updated. */
      }
    } catch (error) {
      totalVisits.textContent = `${formatCount(totalBase)}+`;
    }
  }

  async function updateUniqueVisitors() {
    try {
      let alreadyCounted = false;

      try {
        alreadyCounted = localStorage.getItem(uniqueStorageKey) === "true";
      } catch (error) {
        alreadyCounted = false;
      }

      let uniqueCount;

      if (alreadyCounted) {
        uniqueCount = await requestCounter(uniqueCounterName);
      } else {
        uniqueCount = await requestCounter(uniqueCounterName, "up");

        try {
          localStorage.setItem(uniqueStorageKey, "true");
        } catch (error) {
          /* localStorage unavailable; the displayed count is still updated. */
        }
      }

      uniqueVisitors.textContent = formatCount(uniqueBase + uniqueCount);
    } catch (error) {
      uniqueVisitors.textContent = `${formatCount(uniqueBase)}+`;
    }
  }

  function init() {
    setFallbackValues();

    if (isLocalPreview) {
      return;
    }

    updateTotalVisits();
    updateUniqueVisitors();
  }

  init();

  return {
    init
  };
})();
