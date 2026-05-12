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

/* === Translation UX, RTL, and protected-name repairs === */

(() => {
  const publicSiteOrigin = "https://thecalderathrone.com";
  const translateProxyOrigin = "https://thecalderathrone-com.translate.goog";
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
  const latinAuthorName = "Mustafa El Ahwal";
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

  function getSourcePageUrl(urlValue = window.location.href) {
    const parsedUrl = getUrl(urlValue);

    if (!parsedUrl) {
      return getUrl(publicSiteOrigin);
    }

    const sourceUrl = parsedUrl.searchParams.get("u") || parsedUrl.searchParams.get("_x_tr_url");

    if (sourceUrl) {
      return getSourcePageUrl(sourceUrl);
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

    return `${publicSiteOrigin}${mapping.public}`;
  }

  function getTranslatedPageUrl(languageCode, pageKey = getCurrentPageKey()) {
    const mapping = pagePathMappings[pageKey] || pagePathMappings.index;
    const targetPath = mapping.public === "/" ? "/" : mapping.public;

    return `${translateProxyOrigin}${targetPath}?_x_tr_sl=auto&_x_tr_tl=${encodeURIComponent(languageCode)}&_x_tr_hl=en-US`;
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
    wrapTextMatches(document.body, /Mustafa(?:\s+M\.?|\s+M)?\s+(?:El|EL|el|Al)\s+Ahwal|Mustafa\s+M\.\s+Ahwal|Mustafa\s+Ahwal/g, () => {
      const span = document.createElement("span");
      span.className = "notranslate protected-author-name";
      span.setAttribute("translate", "no");
      span.setAttribute("data-author-name", "true");
      span.textContent = latinAuthorName;
      return span;
    });
  }

  function protectCharacterNameHeadings() {
    document.querySelectorAll(".character-card h3").forEach((heading) => {
      const protectedName = heading.getAttribute("data-protected-name") || heading.textContent.trim();

      heading.classList.add("notranslate");
      heading.setAttribute("translate", "no");
      heading.setAttribute("data-protected-name", protectedName);
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

    if (!isArabic) {
      nextText = nextText.replace(/Mustafa(?:\s+M\.?|\s+M)?\s+(?:El|EL|el|Al)\s+Ahwal|Mustafa\s+M\.\s+Ahwal|Mustafa\s+Ahwal/g, latinAuthorName);
    }

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
    });

    document.querySelectorAll("[data-protected-name]:not([data-author-name])").forEach((element) => {
      const protectedName = element.getAttribute("data-protected-name");

      if (protectedName && element.textContent !== protectedName) {
        element.textContent = protectedName;
      }

      markNoTranslate(element);
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

  function createFloatingLanguageSwitcher() {
    const existingSwitcher = document.getElementById("persistent-language-switcher");

    if (existingSwitcher) {
      const currentLanguage = getCurrentLanguage();

      existingSwitcher.querySelectorAll("[data-translate-lang]").forEach((link) => {
        const languageCode = normalizeLanguageCode(link.getAttribute("data-translate-lang"));
        link.href = getLanguageUrl(languageCode);
        link.classList.toggle("current", languageCode === currentLanguage);
      });

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
    button.type = "button";
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-haspopup", "true");
    button.textContent = "\uD83C\uDF10 LANG";

    menu.className = "translate-floating-menu";

    languageChoices.forEach((language) => {
      const link = document.createElement("a");
      link.href = getLanguageUrl(language.code);
      link.textContent = language.label;
      link.className = language.code === currentLanguage ? "current" : "";
      link.setAttribute("data-translate-lang", language.code);
      link.rel = "nofollow noopener";
      menu.append(link);
    });

    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const isOpen = switcher.classList.toggle("open");
      button.setAttribute("aria-expanded", String(isOpen));
    });

    document.addEventListener("click", (event) => {
      if (!switcher.contains(event.target)) {
        switcher.classList.remove("open");
        button.setAttribute("aria-expanded", "false");
      }
    });

    switcher.append(button, menu);
    document.body.append(switcher);
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
    applyArabicNavLabels(isArabic);
    updateExistingLanguageLinks();
    createFloatingLanguageSwitcher();
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
