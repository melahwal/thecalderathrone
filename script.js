const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const year = document.querySelector("[data-year]");
const footerTopLinks = document.querySelectorAll(".site-footer-top");

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

function syncHeaderMetrics() {
  if (!header) {
    return;
  }

  const measuredHeight = Math.max(header.offsetHeight, Math.ceil(header.getBoundingClientRect().height));
  document.documentElement.style.setProperty("--runtime-header-height", `${measuredHeight}px`);
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
    window.requestAnimationFrame(syncHeaderMetrics);
  });

  nav.addEventListener("click", (event) => {
    if (event.target.matches("a")) {
      nav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
      window.requestAnimationFrame(syncHeaderMetrics);
    }
  });
}

if (year) {
  year.textContent = new Date().getFullYear();
}

if (footerTopLinks.length) {
  footerTopLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  });
}

syncHeaderMetrics();
syncHeader();
window.addEventListener("load", syncHeaderMetrics);
window.addEventListener("resize", syncHeaderMetrics, { passive: true });
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
  Counter rules:
  - Unique Visitors starts at 1,200 and counts once per browser/device, but only from the live homepage.
  - Total Visits starts from the last visible live total and increases once per browser session, but only from the live homepage.
  - Internal pages only read and display the latest saved totals.
  - No raw visitor identifiers are stored by this script.
*/

const visitorCounter = (() => {
  const uniqueVisitors = document.querySelector("[data-unique-visitors]");
  const totalVisits = document.querySelector("[data-total-visits]");

  if (!uniqueVisitors || !totalVisits) {
    return null;
  }

  const uniqueBase = 1200;
  const totalBase = 2634;
  const productionCounterApiBaseUrl = "https://api.counterapi.dev/v1/thecalderathrone.com";
  const uniqueCounterKey = "unique-homepage-visitors";
  const totalCounterKey = "homepage-session-visits";

  const uniqueFlagStorageKey = "calderaThroneRemoteUniqueVisitorCounted_v20260517";
  const uniqueValueStorageKey = "calderaThroneRemoteUniqueVisitorsValue_v20260517";
  const totalValueStorageKey = "calderaThroneRemoteTotalVisitsValue_v20260517";
  const sessionVisitKey = "calderaThroneRemoteHomeVisitCountedThisSession_v20260517";

  const isLocalPreview = ["localhost", "127.0.0.1", ""].includes(window.location.hostname);
  const isTranslateProxy = window.location.hostname.includes("translate.goog");
  const searchParams = new URLSearchParams(window.location.search);
  const hasTranslateQuery = [...searchParams.keys()].some((key) => key.startsWith("_x_tr_"));
  const isLivePrimaryOrigin = window.location.origin === "https://thecalderathrone.com";
  const localCounterApiBaseUrl = isLocalPreview ? searchParams.get("counterApiBaseUrl") : "";
  const counterApiBaseUrl = localCounterApiBaseUrl || productionCounterApiBaseUrl;

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

  function isEligibleLiveHomepageCounterHit() {
    return isLivePrimaryOrigin && isHomePage() && !isTranslateProxy && !hasTranslateQuery;
  }

  function canReadRemoteCounter() {
    return isLivePrimaryOrigin || isTranslateProxy || Boolean(localCounterApiBaseUrl);
  }

  function formatCount(value) {
    return Number(value).toLocaleString("en-US");
  }

  function formatDisplayCount(value, baseValue) {
    const formatted = formatCount(value);
    return value <= baseValue ? `${formatted}+` : formatted;
  }

  function renderCounts(uniqueCounterValue, totalCounterValue) {
    const uniqueCount = uniqueBase + uniqueCounterValue;
    const totalCount = totalBase + totalCounterValue;

    uniqueVisitors.textContent = formatDisplayCount(uniqueCount, uniqueBase);
    totalVisits.textContent = formatDisplayCount(totalCount, totalBase);
  }

  function readStoredCounter(storageKey) {
    try {
      const rawValue = localStorage.getItem(storageKey);
      const value = Number(rawValue);
      return Number.isFinite(value) && value >= 0 ? value : 0;
    } catch (error) {
      return 0;
    }
  }

  function writeStoredCounter(storageKey, value) {
    try {
      localStorage.setItem(storageKey, String(value));
    } catch (error) {
      /* localStorage unavailable; keep the in-memory display only. */
    }
  }

  function hasStoredUniqueHit() {
    try {
      return localStorage.getItem(uniqueFlagStorageKey) === "true";
    } catch (error) {
      return false;
    }
  }

  function hasCountedSessionVisit() {
    try {
      return sessionStorage.getItem(sessionVisitKey) === "true";
    } catch (error) {
      return false;
    }
  }

  function markSessionVisitCounted() {
    try {
      sessionStorage.setItem(sessionVisitKey, "true");
    } catch (error) {
      /* sessionStorage unavailable; counter display still updates for the current view. */
    }
  }

  function markUniqueVisitorCounted() {
    try {
      localStorage.setItem(uniqueFlagStorageKey, "true");
    } catch (error) {
      /* localStorage unavailable; counter display still updates for the current view. */
    }
  }

  function hasLocalStorage() {
    try {
      const testKey = "calderaThroneStorageTest";
      localStorage.setItem(testKey, "1");
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  }

  function hasSessionStorage() {
    try {
      const testKey = "calderaThroneSessionStorageTest";
      sessionStorage.setItem(testKey, "1");
      sessionStorage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  }

  async function fetchCounter(counterName, shouldIncrement = false) {
    const encodedName = encodeURIComponent(counterName);
    const action = shouldIncrement ? "/up" : "/";
    let response = await fetch(`${counterApiBaseUrl}/${encodedName}${action}`, {
      cache: "no-store"
    });

    if (shouldIncrement && (response.status === 400 || response.status === 404)) {
      await new Promise((resolve) => {
        window.setTimeout(resolve, 200);
      });

      response = await fetch(`${counterApiBaseUrl}/${encodedName}${action}`, {
        cache: "no-store"
      });
    }

    if (response.status === 400 || response.status === 404) {
      return 0;
    }

    if (!response.ok) {
      throw new Error(`Counter request failed with ${response.status}`);
    }

    const payload = await response.json();
    const value = Number(payload && payload.count);

    return Number.isFinite(value) && value >= 0 ? value : 0;
  }

  function rememberRemoteCounts(uniqueCounterValue, totalCounterValue) {
    writeStoredCounter(uniqueValueStorageKey, uniqueCounterValue);
    writeStoredCounter(totalValueStorageKey, totalCounterValue);
  }

  async function syncRemoteCounts() {
    if (!canReadRemoteCounter()) {
      return;
    }

    const shouldIncrementCounters = isEligibleLiveHomepageCounterHit() || Boolean(localCounterApiBaseUrl && isHomePage());
    const shouldIncrementUnique = shouldIncrementCounters && hasLocalStorage() && !hasStoredUniqueHit();
    const shouldIncrementTotal = shouldIncrementCounters && hasSessionStorage() && !hasCountedSessionVisit();

    try {
      const [remoteUnique, remoteTotal] = await Promise.all([
        fetchCounter(uniqueCounterKey, shouldIncrementUnique),
        fetchCounter(totalCounterKey, shouldIncrementTotal)
      ]);

      if (shouldIncrementUnique && remoteUnique > 0) {
        markUniqueVisitorCounted();
      }

      if (shouldIncrementTotal && remoteTotal > 0) {
        markSessionVisitCounted();
      }

      rememberRemoteCounts(remoteUnique, remoteTotal);
      renderCounts(remoteUnique, remoteTotal);
    } catch (error) {
      renderCounts(readStoredCounter(uniqueValueStorageKey), readStoredCounter(totalValueStorageKey));
    }
  }

  function init() {
    const startingUnique = readStoredCounter(uniqueValueStorageKey);
    const startingTotal = readStoredCounter(totalValueStorageKey);
    renderCounts(startingUnique, startingTotal);

    if (isLocalPreview) {
      syncRemoteCounts();
      return;
    }

    if (!canReadRemoteCounter()) {
      return;
    }

    syncRemoteCounts();
  }

  init();

  return {
    init
  };
})();

/* === Translation UX, RTL, and protected-name repairs === */

(() => {
  const publicSiteOrigin = "https://thecalderathrone.com";
  const translateEntryUrl = "https://translate.google.com/translate";
  const languageChoices = [
    { code: "en", label: "English" },
    { code: "ar", label: "\u0627\u0644\u0639\u0631\u0628\u064a\u0629" },
    { code: "fr", label: "French" },
    { code: "es", label: "Spanish" },
    { code: "de", label: "German" },
    { code: "it", label: "Italian" },
    { code: "pt", label: "Portuguese" },
    { code: "tr", label: "Turkish" },
    { code: "ja", label: "Japanese" },
    { code: "zh-CN", label: "Chinese" },
    { code: "hi", label: "Hindi" },
  ];
  const pagePathMappings = {
    index: { local: "/index.html", public: "/" },
    novels: { local: "/novels.html", public: "/novels" },
    characters: { local: "/characters.html", public: "/characters" },
    illustrations: { local: "/illustrations.html", public: "/illustrations" },
    adaptation: { local: "/adaptation.html", public: "/adaptation" },
    author: { local: "/author.html", public: "/author" },
    rights: { local: "/rights.html", public: "/rights" },
  };
  const arabicAuthorName = "\u0645\u0635\u0637\u0641\u0649 \u0645\u062d\u0645\u062f \u0627\u0644\u0623\u062d\u0648\u0644";
  const latinAuthorName = "Mustafa EL Ahwal";
  const authorNamePattern = /Mustafa(?:\s+M\.?|\s+M)?\s+(?:El|EL|el|Al)\s+Ahwal|Mustafa\s+M\.\s+Ahwal|Mustafa\s+Ahwal/g;
  const incorrectArabicAuthorVariants = [
    "\u0645\u0635\u0637\u0641\u0649 \u0645. \u0627\u0644\u0623\u0647\u0648\u0627\u0644",
    "\u0645\u0635\u0637\u0641\u0649 \u0645\u062d\u0645\u062f \u0627\u0644\u0623\u0647\u0648\u0627\u0644",
    "\u0645\u0635\u0637\u0641\u0649 \u0645. \u0627\u0644\u0623\u062d\u0648\u0644",
    "\u0645\u0635\u0637\u0641\u0649 \u0627\u0644\u0623\u062d\u0648\u0644",
    "\u0645\u0635\u0637\u0641\u0649 \u0625\u0645. \u0627\u0644\u0623\u0647\u0648\u0627\u0644",
    "\u0645\u0635\u0637\u0641\u0649 \u0645. \u0622\u0644 \u0623\u0647\u0648\u0644",
    "\u0645\u0635\u0637\u0641\u0649 \u0645. \u0627\u0644\u0623\u062d\u0648\u0627\u0644",
    "\u0645\u0635\u0637\u0641\u0649 \u0645\u062d\u0645\u062f \u0627\u0644\u0623\u062d\u0648\u0627\u0644",
    "\u0627\u0644\u0623\u0647\u0648\u0627\u0644",
  ];
  const protectedTerms = [
    "The Still and the Burning",
    "The Empire of Ledgers",
    "What the Mountain Kept",
    "The Caldera Throne",
    "Mor Vallas",
    "Greyhook",
    "Tyrellos",
    "Varren",
    "Sea Bay",
    "Varkans",
    "Varkan",
    "Varka",
    "Aurelians",
    "Aurelian",
    "Maryana",
    "Maryans",
    "Maryan",
    "Marya",
    "Daryanas",
    "Daryans",
    "Daryan",
    "Darya",
    "Kaish\u014d",
    "Kaisho",
    "Mehrakan",
    "Sarkathar",
    "Sarkath",
    "Varyn Ironfist",
    "Turqut Turan",
    "Turgut",
    "Turan",
    "Ashbourne",
    "Aurelius",
    "Cassandra",
    "Elyanna",
    "Marcus",
    "Helena",
    "Draven",
    "Varric",
    "Rorik",
    "Kaito",
    "Akira",
    "Azadeh",
    "Arvand",
    "Babak",
    "Livia",
    "Kellus",
    "Varyn",
    "Greger",
    "Tomas",
    "Rustom",
    "Rellin",
    "Adrian",
    "Narseh",
    "Saburo",
    "Sorush",
    "Drosan",
    "Namik",
    "Arash",
    "Elara",
    "Mira",
    "Oru",
    "Rhia",
    "Shen",
    "Kael",
    "Jian",
    "Giv",
    "Mai",
  ];
  const arabicNavLabels = {
    novels: "\u0631\u0648\u0627\u064a\u0627\u062a",
    characters: "\u0627\u0644\u0634\u062e\u0635\u064a\u0627\u062a",
    illustrations: "\u0627\u0644\u0631\u0633\u0648\u0645\u0627\u062a \u0627\u0644\u062a\u0648\u0636\u064a\u062d\u064a\u0629",
    adaptation: "\u0627\u0644\u0627\u0642\u062a\u0628\u0627\u0633 \u0627\u0644\u062a\u0644\u0641\u0632\u064a\u0648\u0646\u064a",
    author: "\u0627\u0644\u0645\u0624\u0644\u0641",
    rights: "\u0627\u0644\u062d\u0642\u0648\u0642",
  };

  let repairQueued = false;
  let languageSwitcherEventsInstalled = false;

  function getFloatingLanguageSwitcher() {
    return document.getElementById("persistent-language-switcher");
  }

  function syncFloatingLanguageSwitcherState(isOpen) {
    const switcher = getFloatingLanguageSwitcher();

    if (!switcher) {
      return;
    }

    const button = switcher.querySelector(".translate-floating-button");
    switcher.classList.toggle("open", Boolean(isOpen));

    if (button) {
      button.setAttribute("aria-expanded", String(Boolean(isOpen)));
    }
  }

  function getEventElement(event) {
    if (event.target instanceof Element) {
      return event.target;
    }

    const path = typeof event.composedPath === "function" ? event.composedPath() : [];
    return path.find((entry) => entry instanceof Element) || null;
  }

  function getLanguageToggleFromEvent(event, switcher = getFloatingLanguageSwitcher()) {
    if (!switcher) {
      return null;
    }

    const path = typeof event.composedPath === "function" ? event.composedPath() : [];
    const pathToggle = path.find((entry) => entry instanceof Element && entry.matches?.("[data-language-toggle], .translate-floating-button"));

    if (pathToggle && switcher.contains(pathToggle)) {
      return pathToggle;
    }

    const target = getEventElement(event);
    const toggle = target?.closest?.("[data-language-toggle], .translate-floating-button");

    return toggle && switcher.contains(toggle) ? toggle : null;
  }

  function toggleFloatingLanguageSwitcher(event) {
    const switcher = getFloatingLanguageSwitcher();

    if (!switcher) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    syncFloatingLanguageSwitcherState(!switcher.classList.contains("open"));
  }

  function installFloatingLanguageSwitcherEvents() {
    if (languageSwitcherEventsInstalled) {
      return;
    }

    languageSwitcherEventsInstalled = true;

    document.addEventListener("click", (event) => {
      const switcher = getFloatingLanguageSwitcher();

      if (!switcher) {
        return;
      }

      const target = getEventElement(event);
      const toggle = getLanguageToggleFromEvent(event, switcher);
      const menu = switcher.querySelector("[data-language-menu], .translate-floating-menu");

      if (toggle) {
        toggleFloatingLanguageSwitcher(event);
        return;
      }

      if (target && menu && menu.contains(target)) {
        return;
      }

      syncFloatingLanguageSwitcherState(false);
    }, true);

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") {
        return;
      }

      syncFloatingLanguageSwitcherState(false);
    });
  }

  function setProtectedLanguageAttributes(element, languageCode = "en") {
    if (!element) {
      return;
    }

    if (languageCode === "ar") {
      element.setAttribute("lang", "ar");
      element.setAttribute("dir", "rtl");
      return;
    }

    element.setAttribute("lang", "en");
    element.setAttribute("dir", "ltr");
  }

  function normalizeLanguageCode(languageCode) {
    if (!languageCode) {
      return "en";
    }

    const normalized = languageCode.toLowerCase();

    if (normalized.startsWith("ar")) return "ar";
    if (normalized.startsWith("fr")) return "fr";
    if (normalized.startsWith("es")) return "es";
    if (normalized.startsWith("de")) return "de";
    if (normalized.startsWith("it")) return "it";
    if (normalized.startsWith("pt")) return "pt";
    if (normalized.startsWith("tr")) return "tr";
    if (normalized.startsWith("ja")) return "ja";
    if (normalized === "zh" || normalized.startsWith("zh-cn")) return "zh-CN";
    if (normalized.startsWith("hi")) return "hi";

    return "en";
  }

  function getUrl(urlValue) {
    try {
      return new URL(urlValue, window.location.href);
    } catch {
      return null;
    }
  }

  function isLocalHostName(hostName) {
    return hostName === "localhost" || hostName === "127.0.0.1" || hostName === "0.0.0.0";
  }

  function isTranslateProxyUrl(urlObject) {
    return Boolean(urlObject && urlObject.hostname.includes("translate.goog"));
  }

  function isTranslateEntryUrl(urlObject) {
    return Boolean(urlObject && urlObject.hostname === "translate.google.com" && urlObject.pathname.includes("/translate"));
  }

  function normalizePublicPath(pathName = "/") {
    const path = pathName || "/";

    if (path === "/" || path.endsWith("/index") || path.endsWith("/index.html")) return "/";
    if (path.endsWith("/novels") || path.endsWith("/novels.html")) return "/novels";
    if (path.endsWith("/characters") || path.endsWith("/characters.html")) return "/characters";
    if (
      path.endsWith("/illustrations") ||
      path.endsWith("/illustrations.html") ||
      path.endsWith("/book-illustrations") ||
      path.endsWith("/book-illustrations.html")
    ) {
      return "/illustrations";
    }
    if (path.endsWith("/adaptation") || path.endsWith("/adaptation.html")) return "/adaptation";
    if (path.endsWith("/author") || path.endsWith("/author.html")) return "/author";
    if (path.endsWith("/rights") || path.endsWith("/rights.html")) return "/rights";

    return path.startsWith("/") ? path : `/${path}`;
  }

  function getSourcePageUrl(urlValue = window.location.href) {
    const parsedUrl = getUrl(urlValue);

    if (!parsedUrl) {
      return getUrl(publicSiteOrigin);
    }

    const sourceUrl = parsedUrl.searchParams.get("u") || parsedUrl.searchParams.get("_x_tr_url");

    if (sourceUrl && (isTranslateEntryUrl(parsedUrl) || isTranslateProxyUrl(parsedUrl) || parsedUrl.searchParams.has("_x_tr_url"))) {
      return getSourcePageUrl(sourceUrl);
    }

    if (isTranslateProxyUrl(parsedUrl)) {
      return getUrl(`${publicSiteOrigin}${normalizePublicPath(parsedUrl.pathname)}`);
    }

    return parsedUrl;
  }

  function getCurrentPageKey() {
    const sourceUrl = getSourcePageUrl();
    const path = (sourceUrl && sourceUrl.pathname.toLowerCase()) || "/";

    if (path === "/" || path.endsWith("/index") || path.endsWith("/index.html")) return "index";
    if (path.endsWith("/novels") || path.endsWith("/novels.html")) return "novels";
    if (path.endsWith("/characters") || path.endsWith("/characters.html")) return "characters";
    if (
      path.endsWith("/illustrations") ||
      path.endsWith("/illustrations.html") ||
      path.endsWith("/book-illustrations") ||
      path.endsWith("/book-illustrations.html")
    ) {
      return "illustrations";
    }
    if (path.endsWith("/adaptation") || path.endsWith("/adaptation.html")) return "adaptation";
    if (path.endsWith("/author") || path.endsWith("/author.html")) return "author";
    if (path.endsWith("/rights") || path.endsWith("/rights.html")) return "rights";

    return "index";
  }

  function getCleanOriginalPageUrl() {
    const sourceUrl = getSourcePageUrl();

    if (!sourceUrl) {
      return `${publicSiteOrigin}/`;
    }

    if (isLocalHostName(sourceUrl.hostname) && !isTranslateProxyUrl(getUrl(window.location.href))) {
      const pageKey = getCurrentPageKey();
      const mapping = pagePathMappings[pageKey] || pagePathMappings.index;

      return `${sourceUrl.origin}${mapping.local}`;
    }

    return `${publicSiteOrigin}${normalizePublicPath(sourceUrl.pathname)}`;
  }

  function getCurrentLanguage() {
    const currentUrl = getUrl(window.location.href);
    const explicitLanguage =
      currentUrl?.searchParams.get("_x_tr_tl") ||
      currentUrl?.searchParams.get("tl") ||
      document.documentElement.lang;

    return normalizeLanguageCode(explicitLanguage);
  }

  function isTranslatedPage() {
    const currentUrl = getUrl(window.location.href);

    return Boolean(
      currentUrl &&
        (isTranslateProxyUrl(currentUrl) ||
          currentUrl.searchParams.has("_x_tr_tl") ||
          currentUrl.searchParams.has("tl"))
    );
  }

  function getCleanPageUrl(pageKey = getCurrentPageKey()) {
    const mapping = pagePathMappings[pageKey] || pagePathMappings.index;
    const sourceUrl = getSourcePageUrl();

    if (sourceUrl && isLocalHostName(sourceUrl.hostname) && !isTranslateProxyUrl(getUrl(window.location.href))) {
      return `${sourceUrl.origin}${mapping.local}`;
    }

    return getCleanOriginalPageUrl();
  }

  function getTranslatedPageUrl(languageCode) {
    const translateUrl = new URL(translateEntryUrl);

    translateUrl.searchParams.set("sl", "auto");
    translateUrl.searchParams.set("tl", languageCode);
    translateUrl.searchParams.set("u", getCleanOriginalPageUrl());

    return translateUrl.toString();
  }

  function getLanguageUrl(languageCode) {
    if (languageCode === "en") {
      return getCleanPageUrl();
    }

    return getTranslatedPageUrl(languageCode);
  }

  function markNoTranslate(element) {
    if (!element) {
      return;
    }

    element.classList.add("notranslate", "skiptranslate");
    element.setAttribute("translate", "no");
  }

  function protectHeaderTranslation() {
    document.querySelectorAll(".site-header, .brand, .site-nav, .site-nav a, .nav-toggle").forEach(markNoTranslate);
  }

  function shouldSkipTextNode(node) {
    const parent = node.parentElement;

    if (!parent || !node.nodeValue.trim()) {
      return true;
    }

    return Boolean(parent.closest("script, style, noscript, textarea, select, option, .notranslate, .skiptranslate, #persistent-language-switcher"));
  }

  function wrapTextMatches(root, pattern, createElement) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        pattern.lastIndex = 0;
        const hasMatch = pattern.test(node.nodeValue);
        pattern.lastIndex = 0;

        return shouldSkipTextNode(node) || !hasMatch ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      },
    });
    const nodes = [];

    while (walker.nextNode()) {
      nodes.push(walker.currentNode);
    }

    nodes.forEach((node) => {
      const fragment = document.createDocumentFragment();
      const text = node.nodeValue;
      let lastIndex = 0;

      pattern.lastIndex = 0;
      text.replace(pattern, (match, ...args) => {
        const index = args[args.length - 2];

        if (index > lastIndex) {
          fragment.append(document.createTextNode(text.slice(lastIndex, index)));
        }

        fragment.append(createElement(match));
        lastIndex = index + match.length;
        return match;
      });

      if (lastIndex < text.length) {
        fragment.append(document.createTextNode(text.slice(lastIndex)));
      }

      node.parentNode.replaceChild(fragment, node);
    });
  }

  function protectVisibleAuthorNames() {
    wrapTextMatches(document.body, authorNamePattern, () => {
      const span = document.createElement("span");
      span.className = "notranslate protected-author-name";
      span.setAttribute("translate", "no");
      span.setAttribute("data-author-name", "true");
      span.textContent = latinAuthorName;
      setProtectedLanguageAttributes(span, "en");
      return span;
    });
  }

  function startsWithWordLikeCharacter(value) {
    return /^[A-Za-z0-9À-ž\u0600-\u06FF]/.test(value);
  }

  function endsWithWordLikeCharacter(value) {
    return /[A-Za-z0-9À-ž\u0600-\u06FF,;:]$/.test(value);
  }

  function ensureProtectedAuthorNameSpacing() {
    document.querySelectorAll("[data-author-name], .protected-author-name").forEach((element) => {
      const previous = element.previousSibling;
      const next = element.nextSibling;

      if (previous?.nodeType === Node.TEXT_NODE) {
        const value = previous.nodeValue || "";

        if (value && !/\s$/.test(value) && endsWithWordLikeCharacter(value)) {
          previous.nodeValue = `${value} `;
        }
      } else if (previous && previous.nodeType !== Node.TEXT_NODE) {
        const text = previous.textContent || "";

        if (text && endsWithWordLikeCharacter(text)) {
          element.parentNode?.insertBefore(document.createTextNode(" "), element);
        }
      }

      if (next?.nodeType === Node.TEXT_NODE) {
        const value = next.nodeValue || "";

        if (value && !/^\s/.test(value) && startsWithWordLikeCharacter(value)) {
          next.nodeValue = ` ${value}`;
        }
      } else if (next && next.nodeType !== Node.TEXT_NODE) {
        const text = next.textContent || "";

        if (text && startsWithWordLikeCharacter(text)) {
          element.parentNode?.insertBefore(document.createTextNode(" "), next);
        }
      }
    });
  }

  function protectCharacterNameHeadings() {
    document.querySelectorAll(".character-card h3").forEach((heading) => {
      const protectedName = heading.getAttribute("data-protected-name") || heading.textContent.trim();

      heading.classList.add("notranslate");
      heading.setAttribute("translate", "no");
      heading.setAttribute("data-protected-name", protectedName);
      setProtectedLanguageAttributes(heading, "en");
    });
  }

  function protectVisibleTerms() {
    protectedTerms
      .slice()
      .sort((a, b) => b.length - a.length)
      .forEach((term) => {
        const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const pattern = new RegExp(`\\b${escapedTerm}\\b`, "g");

        wrapTextMatches(document.body, pattern, () => {
          const span = document.createElement("span");
          span.className = "notranslate";
          span.setAttribute("translate", "no");
          span.setAttribute("data-protected-name", term);
          span.textContent = term;
          setProtectedLanguageAttributes(span, "en");
          return span;
        });
      });
  }

  function repairTextNodeContent(node, isArabic) {
    if (shouldSkipTextNode(node)) {
      return;
    }

    let nextText = node.nodeValue;

    incorrectArabicAuthorVariants.forEach((variant) => {
      nextText = nextText.split(variant).join(isArabic ? arabicAuthorName : latinAuthorName);
    });

    nextText = nextText.replace(/\u0627\u0639\u0637/g, "Giv");

    nextText = nextText.replace(authorNamePattern, isArabic ? arabicAuthorName : latinAuthorName);
    nextText = nextText
      .replace(/([A-Za-z0-9À-ž\u0600-\u06FF,;:])(Mustafa EL Ahwal)/g, "$1 $2")
      .replace(/(Mustafa EL Ahwal)(?=[A-Za-z0-9À-ž\u0600-\u06FF])/g, "$1 ")
      .replace(/([A-Za-z0-9À-ž\u0600-\u06FF,;:])(\u0645\u0635\u0637\u0641\u0649 \u0645\u062d\u0645\u062f \u0627\u0644\u0623\u062d\u0648\u0644)/g, "$1 $2")
      .replace(/(\u0645\u0635\u0637\u0641\u0649 \u0645\u062d\u0645\u062f \u0627\u0644\u0623\u062d\u0648\u0644)(?=[A-Za-z0-9À-ž\u0600-\u06FF])/g, "$1 ");

    if (nextText !== node.nodeValue) {
      node.nodeValue = nextText;
    }
  }

  function repairLooseText(isArabic) {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];

    while (walker.nextNode()) {
      nodes.push(walker.currentNode);
    }

    nodes.forEach((node) => repairTextNodeContent(node, isArabic));
  }

  function repairProtectedElements(isArabic) {
    document.querySelectorAll("[data-author-name], .protected-author-name").forEach((element) => {
      const targetName = isArabic ? arabicAuthorName : latinAuthorName;

      if (element.textContent !== targetName) {
        element.textContent = targetName;
      }

      markNoTranslate(element);
      element.classList.add("protected-author-name");
      element.setAttribute("data-author-name", "true");
      setProtectedLanguageAttributes(element, isArabic ? "ar" : "en");
    });

    ensureProtectedAuthorNameSpacing();

    document.querySelectorAll("[data-protected-name]:not([data-author-name])").forEach((element) => {
      const protectedName = element.getAttribute("data-protected-name");

      if (protectedName && element.textContent !== protectedName) {
        element.textContent = protectedName;
      }

      markNoTranslate(element);
      setProtectedLanguageAttributes(element, "en");
    });
  }

  function applyArabicNavLabels(isArabic) {
    if (!isArabic) {
      return;
    }

    document.querySelectorAll(".site-nav a").forEach((link) => {
      const href = link.getAttribute("href") || "";
      const key = Object.keys(arabicNavLabels).find((candidate) => href.includes(candidate));

      if (key) {
        link.textContent = arabicNavLabels[key];
      }
    });
  }

  function applyDocumentLanguageMode(languageCode = getCurrentLanguage()) {
    const isArabic = languageCode === "ar";
    const translated = isTranslatedPage() || languageCode !== "en";
    const currentUrl = getUrl(window.location.href);

    document.documentElement.classList.toggle("translated-ltr", translated && !isArabic);
    document.documentElement.classList.toggle("translated-rtl", translated && isArabic);
    document.documentElement.classList.toggle("is-arabic-translation", isArabic);
    document.body.classList.toggle("translated-ltr", translated && !isArabic);
    document.body.classList.toggle("translated-rtl", translated && isArabic);
    document.body.classList.toggle("google-translated", translated);
    document.body.classList.toggle("translated-ar", isArabic);
    document.body.classList.toggle("rtl-lang", isArabic);
    document.body.classList.toggle("lang-ar", isArabic);
    document.body.classList.toggle("is-arabic-translation", isArabic);
    document.body.classList.toggle("google-proxy-page", Boolean(currentUrl && isTranslateProxyUrl(currentUrl)));

    if (isArabic) {
      document.documentElement.setAttribute("lang", "ar");
      document.documentElement.setAttribute("dir", "rtl");
      document.body.setAttribute("dir", "rtl");
    } else {
      document.documentElement.setAttribute("lang", languageCode === "en" ? "en" : languageCode);
      document.documentElement.setAttribute("dir", "ltr");
      document.body.setAttribute("dir", "ltr");
    }

    return isArabic;
  }

  function updateExistingLanguageLinks() {
    document.querySelectorAll("[data-translate-lang]").forEach((link) => {
      const languageCode = normalizeLanguageCode(link.getAttribute("data-translate-lang"));
      link.href = getLanguageUrl(languageCode);
      link.rel = "nofollow noopener";
    });
  }

  function decorateLanguageButton(button) {
    if (!button) {
      return;
    }

    button.innerHTML = `
      <span class="translate-floating-globe" aria-hidden="true">\uD83C\uDF10</span>
      <span class="translate-floating-label">LANG</span>
    `;
    button.setAttribute("aria-label", "Choose site language");
    button.setAttribute("data-language-toggle", "true");
    button.setAttribute("aria-haspopup", "true");
    button.type = "button";

    if (!button.dataset.languageToggleBound) {
      button.addEventListener("click", toggleFloatingLanguageSwitcher);
      button.dataset.languageToggleBound = "true";
    }
  }

  function createFloatingLanguageSwitcher() {
    const existingSwitcher = document.getElementById("persistent-language-switcher");
    installFloatingLanguageSwitcherEvents();

    if (existingSwitcher) {
      const currentLanguage = getCurrentLanguage();
      const existingButton = existingSwitcher.querySelector(".translate-floating-button");
      const existingMenu = existingSwitcher.querySelector(".translate-floating-menu");

      decorateLanguageButton(existingButton);
      existingMenu?.setAttribute("data-language-menu", "true");

      existingSwitcher.querySelectorAll("[data-translate-lang]").forEach((link) => {
        const languageCode = normalizeLanguageCode(link.getAttribute("data-translate-lang"));
        link.href = getLanguageUrl(languageCode);
        link.classList.toggle("current", languageCode === currentLanguage);
      });

      syncFloatingLanguageSwitcherState(existingSwitcher.classList.contains("open"));
      return;
    }

    const currentLanguage = getCurrentLanguage();
    const switcher = document.createElement("div");
    const button = document.createElement("button");
    const menu = document.createElement("div");

    switcher.id = "persistent-language-switcher";
    switcher.className = "translate-floating-control notranslate skiptranslate";
    switcher.setAttribute("translate", "no");

    button.className = "translate-floating-button";
    button.setAttribute("aria-expanded", "false");
    decorateLanguageButton(button);

    menu.className = "translate-floating-menu";
    menu.setAttribute("data-language-menu", "true");

    languageChoices.forEach((language) => {
      const link = document.createElement("a");
      link.href = getLanguageUrl(language.code);
      link.textContent = language.label;
      link.className = language.code === currentLanguage ? "current" : "";
      link.setAttribute("data-translate-lang", language.code);
      link.rel = "nofollow noopener";
      menu.append(link);
    });

    switcher.append(button, menu);
    document.body.append(switcher);
    syncFloatingLanguageSwitcherState(false);
    syncHeaderMetrics();
  }

  function applyTranslationRepairs() {
    const languageCode = getCurrentLanguage();
    const isArabic = applyDocumentLanguageMode(languageCode);

    protectHeaderTranslation();
    protectVisibleAuthorNames();
    protectCharacterNameHeadings();
    protectVisibleTerms();
    repairProtectedElements(isArabic);
    repairLooseText(isArabic);
    ensureProtectedAuthorNameSpacing();
    applyArabicNavLabels(isArabic);
    updateExistingLanguageLinks();
    createFloatingLanguageSwitcher();
    syncHeaderMetrics();
  }

  function queueTranslationRepairs() {
    if (repairQueued) {
      return;
    }

    repairQueued = true;
    window.setTimeout(() => {
      repairQueued = false;
      applyTranslationRepairs();
    }, 80);
  }

  function installTranslationRepairObserver() {
    const observer = new MutationObserver(queueTranslationRepairs);

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  if (document.body) {
    applyTranslationRepairs();
    installTranslationRepairObserver();
  }
})();
