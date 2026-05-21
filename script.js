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

function setMobileNavOpenState(isOpen) {
  if (!nav || !navToggle) {
    return;
  }

  nav.classList.toggle("open", Boolean(isOpen));
  navToggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
  document.body.classList.toggle("mobile-nav-open", Boolean(isOpen));
  window.requestAnimationFrame(syncHeaderMetrics);
}

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    const shouldOpen = !nav.classList.contains("open");
    setMobileNavOpenState(shouldOpen);
  });

  nav.addEventListener("click", (event) => {
    if (event.target.matches("a")) {
      setMobileNavOpenState(false);
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 768 && nav.classList.contains("open")) {
      setMobileNavOpenState(false);
    }
  }, { passive: true });
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
  const placeholderEndpointToken = "REPLACE_WITH_MY_FORMSPREE_ID";
  const contactLanguageUrl = (() => {
    try {
      return new URL(window.location.href);
    } catch {
      return null;
    }
  })();
  const contactLanguage = (
    contactLanguageUrl?.searchParams.get("_x_tr_tl") ||
    contactLanguageUrl?.searchParams.get("tl") ||
    document.documentElement.lang ||
    "en"
  ).toLowerCase().split("-")[0];
  const contactCopy = contactLanguage === "ar"
    ? {
        sending: "جارٍ إرسال الاستفسار...",
        fallback: "تم فتح تطبيق البريد الإلكتروني متضمناً تفاصيل الاستفسار. إذا لم يفتح تلقائياً، يُرجى مراسلة melahwal@hotmail.com مباشرة.",
        success: "شكراً لك. تم إرسال الاستفسار بنجاح.",
        error: "تعذّر إرسال الرسالة. يُرجى مراسلة melahwal@hotmail.com مباشرة."
      }
    : {
        sending: "Sending your inquiry...",
        fallback: "Your email app has been opened with the inquiry details. If it does not open, please email melahwal@hotmail.com directly.",
        success: "Thank you. Your inquiry has been sent successfully.",
        error: "Sorry, your message could not be sent. Please email melahwal@hotmail.com directly."
      };

  function buildFallbackEmailUrl(formData) {
    const subject = formData.get("_subject") || "The Caldera Throne - Rights / Contact Inquiry";
    const lines = [
      `Name: ${formData.get("name") || ""}`,
      `Email: ${formData.get("email") || ""}`,
      `Organization: ${formData.get("organization") || ""}`,
      `Inquiry Type: ${formData.get("inquiryType") || ""}`,
      "",
      formData.get("message") || ""
    ];

    return `mailto:melahwal@hotmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
  }

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!contactStatus || !submitButton) {
      return;
    }

    contactStatus.textContent = contactCopy.sending;
    contactStatus.className = "form-status full";
    submitButton.disabled = true;

    const formData = new FormData(contactForm);

    if (contactForm.action.includes(placeholderEndpointToken)) {
      window.location.href = buildFallbackEmailUrl(formData);
      contactStatus.textContent = contactCopy.fallback;
      contactStatus.classList.add("success");
      submitButton.disabled = false;
      return;
    }

    try {
      const response = await fetch(contactForm.action, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Form submission failed.");
      }

      contactForm.reset();
      contactStatus.textContent = contactCopy.success;
      contactStatus.classList.add("success");
    } catch (error) {
      contactStatus.textContent = contactCopy.error;
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
  - Every page renders the same shared counter snapshot, then refreshes from the same remote source when available.
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
  const fallbackUniqueCounterValue = 34;
  const fallbackTotalCounterValue = 47;
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
  const shouldUseCounterProxy = !localCounterApiBaseUrl && (isLivePrimaryOrigin || isTranslateProxy || hasTranslateQuery);
  const counterProxyEndpoint = isLivePrimaryOrigin
    ? "/counter"
    : "https://thecalderathrone.com/counter";
  const counterApiBaseUrl = localCounterApiBaseUrl || (shouldUseCounterProxy ? counterProxyEndpoint : productionCounterApiBaseUrl);

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
    return Boolean(localCounterApiBaseUrl || shouldUseCounterProxy);
  }

  function formatCount(value) {
    return Number(value).toLocaleString("en-US");
  }

  function formatDisplayCount(value, baseValue) {
    const formatted = formatCount(value);
    return value <= baseValue ? `${formatted}+` : formatted;
  }

  function normalizeCounterValue(value, fallbackValue) {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) && numericValue >= 0 ? numericValue : fallbackValue;
  }

  function renderCounts(uniqueCounterValue = fallbackUniqueCounterValue, totalCounterValue = fallbackTotalCounterValue) {
    const uniqueCount = uniqueBase + normalizeCounterValue(uniqueCounterValue, fallbackUniqueCounterValue);
    const totalCount = totalBase + normalizeCounterValue(totalCounterValue, fallbackTotalCounterValue);

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
    const requestUrl = buildCounterUrl(counterName, shouldIncrement);
    let response = await fetch(requestUrl, {
      cache: "no-store"
    });

    if (shouldIncrement && (response.status === 400 || response.status === 404)) {
      await new Promise((resolve) => {
        window.setTimeout(resolve, 200);
      });

      response = await fetch(requestUrl, {
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

  function buildCounterUrl(counterName, shouldIncrement = false) {
    if (shouldUseCounterProxy) {
      const proxyUrl = new URL(counterApiBaseUrl, window.location.origin);
      proxyUrl.searchParams.set("name", counterName);

      if (shouldIncrement) {
        proxyUrl.searchParams.set("action", "up");
      }

      return proxyUrl.toString();
    }

    const encodedName = encodeURIComponent(counterName);
    const action = shouldIncrement ? "/up" : "/";

    return `${counterApiBaseUrl}/${encodedName}${action}`;
  }

  function rememberRemoteCounts(uniqueCounterValue, totalCounterValue) {
    writeStoredCounter(uniqueValueStorageKey, uniqueCounterValue);
    writeStoredCounter(totalValueStorageKey, totalCounterValue);
  }

  function syncLocalCounts() {
    if (!isEligibleLiveHomepageCounterHit()) {
      return;
    }

    if (hasLocalStorage() && !hasStoredUniqueHit()) {
      markUniqueVisitorCounted();
    }

    if (hasSessionStorage() && !hasCountedSessionVisit()) {
      markSessionVisitCounted();
    }
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
      renderCounts();
    }
  }

  function init() {
    renderCounts();

    if (canReadRemoteCounter()) {
      syncRemoteCounts();
      return;
    }

    syncLocalCounts();
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
    world: { local: "/world.html", public: "/world" },
  };
  const arabicAuthorName = "\u0645\u0635\u0637\u0641\u0649 \u0645\u062d\u0645\u062f \u0627\u0644\u0623\u062d\u0648\u0644";
  const latinAuthorName = "Mustafa EL Ahwal";
  const arabicSeriesTitle = "مملكة فوهة البركان";
  const englishSeriesTitleVariants = new Set(["the caldera throne"]);
  const arabicTitleReplacements = [
    ["عرش الكالديرا", arabicSeriesTitle],
    ["عرش كالديرا", arabicSeriesTitle],
    ["عرش الفوهة", arabicSeriesTitle],
    ["عرش البركان", arabicSeriesTitle],
    ["العرش كالديرا", arabicSeriesTitle],
    ["THE CALDERA THRONE", arabicSeriesTitle],
    ["The Caldera Throne", arabicSeriesTitle],
    ["حقوق البث التلفزيوني والعرض على الشاشة", "حقوق الاقتباس التلفزيوني والسينمائي"],
    ["حقوق التلفزيون والشاشة", "حقوق الاقتباس التلفزيوني والسينمائي"],
    ["حقوق التلفزيون والعرض على الشاشة", "حقوق الاقتباس التلفزيوني والسينمائي"],
    ["معرضٌ للحكام والناجين والخبراء الاستراتيجيين والأدوات الهادئة للتغيير.", "معرضٌ للحكام والناجين والمخططين الاستراتيجيين وصنّاع التغيير في الظل."],
    ["معرض للحكام والناجين والخبراء الاستراتيجيين والأدوات الهادئة للتغيير.", "معرضٌ للحكام والناجين والمخططين الاستراتيجيين وصنّاع التغيير في الظل."]
  ];
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
    "THE CALDERA THRONE",
    "THE STILL AND THE BURNING",
    "THE EMPIRE OF LEDGERS",
    "WHAT THE MOUNTAIN KEPT",
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
    novels: "\u0627\u0644\u0631\u0648\u0627\u064a\u0627\u062a",
    characters: "\u0627\u0644\u0634\u062e\u0635\u064a\u0627\u062a",
    illustrations: "\u0627\u0644\u0631\u0633\u0648\u0645",
    adaptation: "\u0627\u0644\u0627\u0642\u062a\u0628\u0627\u0633",
    author: "\u0627\u0644\u0645\u0624\u0644\u0641",
    rights: "\u0627\u0644\u062d\u0642\u0648\u0642 \u0648\u0627\u0644\u062a\u0648\u0627\u0635\u0644",
  };
  const arabicCharacterDescriptions = {
    Adrian: "حدّاد من دمٍ ملكي واستراتيجي ينجذب إلى سلطةٍ لم يسعَ إليها.",
    Mai: "أميرة ماريّا وقائدة منضبطة تحمل حزن مملكةٍ كاملة نحو العودة.",
    Elyanna: "جسرٌ حي بين البرّ الرئيسي والجزيرة بعد ثلاثين عاماً من الصمت.",
    Marcus: "حاكم ذكي ومدمّر يخلط بين الطاعة والشرعية.",
    Helena: "الملكة الأم، ذاكرة القصر، وحارسة خطرة لحقائق مدفونة.",
    "King Aurelius": "ملك شرعي آفل، تفتح سرقته الصامتة شقاً في مستقبل الجزيرة.",
    Tomas: "جزّار وأب وثقل أخلاقي للمقاومة العادية.",
    Greger: "خبّاز قزم، صديق وفيّ، شاهد حاد، ومرآة صادقة للحكاية.",
    Livia: "قارئة للأنماط تحوّل السجلات والمسارات والشذوذ إلى استخبارات.",
    Rorik: "قائد حرس يتحوّل قسمه المكسور إلى تصدّع أخلاقي داخل القصر.",
    Rhia: "قائدة غريهوك؛ عملية، منضبطة، وصافية البصيرة تحت الضغط.",
    Cassandra: "أخت هيلينا، ضحّية الثقة وسلاح ماركوس بعد الموت.",
    Azadeh: "أميرة داريانية عالقة داخل نظام تفهمه أكثر ممن يستخدمونه.",
    "King Shen": "ملك مارياني يتحول حزنه إلى سياسة، وذاكرته إلى أسطول يُعاد بناؤه.",
    "King Bahram": "ملك دارياني يقرأ الهوامش والسجلات والديون القديمة أفضل من الخطب.",
    Jian: "ناجٍ من الأسطول الغارق وملاحٌ للمياه والحقيقة والصمت.",
    Rustom: "أمير دارياني شاب وجسر عملي بين البرّ الرئيسي والجزيرة.",
    Ashbourne: "مشغّل سياسي أنيق يحوّل الوصول والسجلات والخدمة إلى نفوذ.",
    Draven: "زعيم فاركاني يحكم بالخوف والدَّين والغضب المضبوط.",
    Varric: "مهندس فاركاني وعقل استخباراتي يحرس أسرار الجبل المدفونة.",
    Kaito: "جنرال مارياني تحوّل عقيدته الهجوم إلى واجب.",
    Akira: "سلاح اجتماعي نبيل المولد يجرح ماي بالتوقيت والنبرة والإجراء.",
    Arvand: "صانع انقلاب إداري يسيطر على الواقع بالسجلات والأختام والتأخير.",
    Babak: "أداة أرفاند في الممرات؛ خطره يتجلى في الغرف الصغيرة والعتبات الهادئة.",
    "Prince Kael": "ابن درافن، يائس لإثبات نفسه، وتسلله يجرح القصر.",
    "Varyn Ironfist": "سيد الحرب؛ جندي صارم وناجٍ من ولاءات متبدلة.",
    Kellus: "سيد المال، يترك بتحذيره الأخير مفتاح اللعبة في يد ليفيا.",
    Giv: "حارس بهرام الصامت؛ وفيّ كالصخر وخطر قبل أن يُرى الخطر.",
    "The Twins â€“ Turgut & Turan": "توأمان منفّذان لا يرحمان، يخشاهما الجميع لعنفهما وولائهما وقوتهما الخام.",
    Arash: "شاهد آزاده الهادئ، يصون السجل قبل أن يُدفن.",
    Ilva: "طفلة فاركانية تقرأ إشارات الجبل قبل أن يستطيع الآخرون تسميتها.",
    Elara: "زوجة توماس، تمسك بالدكان والطفلة ونفسها كي لا يتفكك شيء.",
    Mira: "ابنة توماس، والسبب الإنساني الكامن خلف قوته.",
    Narseh: "كاتب مثقل بالديون يُفسد عبر محادثة ممر قابلة للإنكار.",
    Saburo: "قائد قافلة ماي؛ دقيق، منضبط، ولا يمكن تشتيته.",
    Rellin: "قائد حرس القصر، تنتهي طاعته الباردة تحت نظرة ماركوس.",
    Sorush: "مهندس مراسلات يبني الصمود داخل شبكة الاستخبارات.",
    Drosan: "قائد فاريك الأقدم، منفّذ القرارات وكاتب كلفتها.",
    Namik: "كاتب أرشيف يحفظ البيت الكامل حيث تنسى الذاكرة الرسمية أن تبحث.",
    Oru: "رئيس مرفأ كايشو، يحوّل الحزن إلى عمل ويواصل البناء."
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

  function normalizeProtectedTitle(value = "") {
    return String(value).replace(/\s+/g, " ").trim().toLowerCase();
  }

  function isSeriesTitle(value = "") {
    return englishSeriesTitleVariants.has(normalizeProtectedTitle(value));
  }

  function getProtectedDisplayName(protectedName, isArabic) {
    if (isArabic && isSeriesTitle(protectedName)) {
      return arabicSeriesTitle;
    }

    return protectedName;
  }

  function applyArabicPhraseReplacements(value) {
    return arabicTitleReplacements.reduce(
      (nextValue, [source, replacement]) => nextValue.split(source).join(replacement),
      value
    );
  }

  function normalizeLanguageCode(languageCode) {
    if (!languageCode) {
      return "en";
    }

    const normalized = languageCode.toLowerCase().replace(/_/g, "-").trim();
    const baseLanguage = normalized.split("-")[0];

    if (baseLanguage === "zh") {
      if (normalized.startsWith("zh-cn") || normalized.startsWith("zh-hans")) return "zh-cn";
      if (normalized.startsWith("zh-tw") || normalized.startsWith("zh-hant")) return "zh-tw";
      return "zh";
    }

    return baseLanguage || "en";
  }

  function isRtlLanguageCode(languageCode) {
    return ["ar", "fa", "he", "ur"].includes(normalizeLanguageCode(languageCode));
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
    if (path.endsWith("/world") || path.endsWith("/world.html")) return "/world";

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
    if (path.endsWith("/world") || path.endsWith("/world.html")) return "world";

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
      span.className = "notranslate skiptranslate protected-author-name protected-inline-term";
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

  function ensureProtectedInlineSpacing() {
    document.querySelectorAll("[data-author-name], .protected-author-name, [data-protected-name]").forEach((element) => {
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

  function ensureProtectedAuthorNameSpacing() {
    ensureProtectedInlineSpacing();
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
          span.className = "notranslate skiptranslate protected-inline-term protected-title";
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

    protectedTerms.forEach((term) => {
      const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      nextText = nextText
        .replace(new RegExp(`([A-Za-z0-9À-ž\\u0600-\\u06FF,;:])(${escapedTerm})`, "g"), "$1 $2")
        .replace(new RegExp(`(${escapedTerm})(?=[A-Za-z0-9À-ž\\u0600-\\u06FF])`, "g"), "$1 ");
    });

    if (isArabic) {
      nextText = applyArabicPhraseReplacements(nextText);
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
      element.classList.add("protected-inline-term");
      element.setAttribute("data-author-name", "true");
      setProtectedLanguageAttributes(element, isArabic ? "ar" : "en");
    });

    ensureProtectedAuthorNameSpacing();

    document.querySelectorAll("[data-protected-name]:not([data-author-name])").forEach((element) => {
      const protectedName = element.getAttribute("data-protected-name");
      const targetName = getProtectedDisplayName(protectedName, isArabic);

      if (targetName && element.textContent !== targetName) {
        element.textContent = targetName;
      }

      markNoTranslate(element);
      element.classList.add("protected-inline-term");
      setProtectedLanguageAttributes(element, isArabic && isSeriesTitle(protectedName) ? "ar" : "en");
    });

    ensureProtectedInlineSpacing();
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

  function localizedAuthorMarkup() {
    return `<span class="notranslate skiptranslate protected-author-name protected-inline-term" translate="no" data-author-name="true" lang="ar" dir="rtl">${arabicAuthorName}</span>`;
  }

  function localizedProtectedTitleMarkup(protectedName, displayName = getProtectedDisplayName(protectedName, true)) {
    const language = isSeriesTitle(protectedName) ? "ar" : "en";
    const direction = language === "ar" ? "rtl" : "ltr";

    return `<span class="notranslate skiptranslate protected-inline-term protected-title" translate="no" data-protected-name="${protectedName}" lang="${language}" dir="${direction}">${displayName}</span>`;
  }

  function setArabicText(selector, value, root = document) {
    root.querySelectorAll(selector).forEach((element) => {
      if (element.textContent.trim() !== value) {
        element.textContent = value;
      }

      element.setAttribute("lang", "ar");
      element.setAttribute("dir", "rtl");
    });
  }

  function setArabicHtml(selector, value, root = document) {
    root.querySelectorAll(selector).forEach((element) => {
      if (element.innerHTML.trim() !== value.trim()) {
        element.innerHTML = value;
      }

      element.setAttribute("lang", "ar");
      element.setAttribute("dir", "rtl");
    });
  }

  function setArabicLabelForControl(selector, labelText) {
    const control = document.querySelector(selector);
    const label = control?.closest("label");

    if (!label) {
      return;
    }

    const directTextNode = Array.from(label.childNodes).find((node) => node.nodeType === Node.TEXT_NODE && node.nodeValue.trim());

    if (directTextNode) {
      directTextNode.nodeValue = `\n          ${labelText}\n          `;
    } else {
      label.insertBefore(document.createTextNode(`\n          ${labelText}\n          `), label.firstChild);
    }

    label.setAttribute("lang", "ar");
    label.setAttribute("dir", "rtl");
  }

  function setSelectOptionsArabic(selector, labels) {
    const select = document.querySelector(selector);

    if (!select) {
      return;
    }

    Array.from(select.options).forEach((option, index) => {
      if (labels[index]) {
        option.textContent = labels[index];
      }
    });
  }

  function localizeArabicFooter() {
    setArabicHtml(".site-footer-copy", `&copy; 2026 ${localizedAuthorMarkup()}. جميع الحقوق محفوظة.`);
    document.querySelectorAll(".footer-stat").forEach((stat, index) => {
      const label = stat.querySelector(".footer-stat-label");

      if (label) {
        label.textContent = index === 0 ? "زوار فريدون" : "إجمالي الزيارات";
        label.setAttribute("lang", "ar");
        label.setAttribute("dir", "rtl");
      }
    });
    setArabicText(".site-footer-top", "العودة إلى الأعلى");
  }

  function localizeArabicIllustrationReader() {
    const bookKickers = ["الكتاب الأول", "الكتاب الثاني", "الكتاب الثالث", "الكتاب الرابع"];

    document.querySelectorAll("[data-select-book]").forEach((card) => {
      const index = Number(card.getAttribute("data-select-book"));
      const kicker = card.querySelector(".book-select-kicker");

      if (kicker && bookKickers[index]) {
        kicker.textContent = bookKickers[index];
        kicker.setAttribute("lang", "ar");
        kicker.setAttribute("dir", "rtl");
      }
    });

    setArabicText("[data-return-selection]", "العودة إلى اختيار الكتب");
    setArabicText("[data-book-first]", "الصفحة الأولى");
    setArabicText(".book-reader-controls [data-book-prev-button]", "السابق");
    setArabicText(".book-reader-controls [data-book-next-button]", "التالي");
    setArabicText("[data-book-last]", "الصفحة الأخيرة");
  }

  function localizeArabicContactForm() {
    setArabicLabelForControl('input[name="name"]', "الاسم");
    setArabicLabelForControl('input[name="email"]', "البريد الإلكتروني");
    setArabicLabelForControl('input[name="organization"]', "الجهة / المؤسسة");
    setArabicLabelForControl('select[name="inquiryType"]', "نوع الاستفسار");
    setArabicLabelForControl('textarea[name="message"]', "الرسالة");
    setSelectOptionsArabic('select[name="inquiryType"]', [
      "اختر نوع الاستفسار",
      "تمثيل أدبي",
      "استفسار نشر",
      "استفسار اقتباس تلفزيوني أو سينمائي",
      "تواصل عام"
    ]);
    setArabicText(".direct-inquiries", "للاستفسارات المباشرة: melahwal@hotmail.com");
    setArabicText(".contact-form .button.primary", "إرسال الاستفسار");
  }

  function localizeArabicCharacterCards() {
    document.querySelectorAll(".character-card").forEach((card) => {
      const protectedName = card.querySelector("[data-protected-name]")?.getAttribute("data-protected-name");
      const description = arabicCharacterDescriptions[protectedName];
      const paragraph = card.querySelector("p");

      if (!description || !paragraph) {
        return;
      }

      paragraph.textContent = description;
      paragraph.setAttribute("lang", "ar");
      paragraph.setAttribute("dir", "rtl");
    });
  }

  function applyArabicLocalizations(isArabic) {
    if (!isArabic) {
      return;
    }

    const pageKey = getCurrentPageKey();

    localizeArabicFooter();
    localizeArabicIllustrationReader();

    switch (pageKey) {
      case "index":
        setArabicText(".home-hero-actions-top .button.primary", "ادخل إلى الروايات");
        setArabicHtml(".home-hero .eyebrow", `${localizedAuthorMarkup()} يقدّم`);
        setArabicText(".home-hero .hero-subtitle", "سلسلة فانتازيا سياسية حربية أصلية بطابع فاخر");
        setArabicText(".home-hero .tagline", "الحرب عبر الأنظمة. والسلطة عبر الصمت.");
        setArabicText(".home-copy-frame > p:not(.hero-hook)", "ملحمة سياسية حربية من خمسة كتب عن الشرعية والذاكرة والغذاء والسجلات والنبوءة وكلفة الحكم؛ حيث تبدأ الحروب في دفاتر الحساب قبل أن تصل إلى السيف.");
        setArabicHtml(".home-copy-frame .hero-hook", `${localizedProtectedTitleMarkup("The Caldera Throne")} سلسلة فانتازيا سياسية ملحمية للبالغين بقلم ${localizedAuthorMarkup()}، تتشكل حول السلطة والشرعية والنبوءة والدفاتر واللوجستيات والخلافة الملكية وانهيار المؤسسات. عبر ${localizedProtectedTitleMarkup("The Still and the Burning", "The Still and the Burning")}، و${localizedProtectedTitleMarkup("The Empire of Ledgers", "The Empire of Ledgers")}، و${localizedProtectedTitleMarkup("What the Mountain Kept", "What the Mountain Kept")}، تستكشف السلسلة كيف تصنع السجلات وخطوط الإمداد والصمت والأنظمة مسار الحروب قبل السيوف والجيوش.`);
        break;

      case "novels":
        setArabicText(".page-title", "الروايات");
        setArabicText(".shared-page-header h2", "ثلاثة كتب من الضغط والإرث والانهيار المؤسسي؛ فانتازيا سياسية حربية راقية تتحرك فيها السلطة عبر المجالس والدفاتر والشرعية المدفونة قبل أن تزحف الجيوش.");
        document.querySelectorAll(".series-label").forEach((label, index) => {
          const names = ["الكتاب الأول من", "الكتاب الثاني من", "الكتاب الثالث من"];
          if (names[index]) {
            label.innerHTML = `${names[index]} ${localizedProtectedTitleMarkup("The Caldera Throne")}`;
            label.setAttribute("lang", "ar");
            label.setAttribute("dir", "rtl");
          }
        });
        document.querySelectorAll(".word-count").forEach((count, index) => {
          const values = ["عدد الكلمات: 115,000 كلمة", "عدد الكلمات: نحو 112,000 كلمة", "عدد الكلمات: 120,000 كلمة"];
          if (values[index]) {
            count.textContent = values[index];
            count.setAttribute("lang", "ar");
            count.setAttribute("dir", "rtl");
          }
        });
        setArabicText(".text-button", "الحقوق والاستفسارات");
        break;

      case "characters":
        setArabicText(".page-title", "الشخصيات");
        setArabicText(".characters-subtitle", "معرضٌ للحكام والناجين والمخططين الاستراتيجيين وصنّاع التغيير في الظل.");
        localizeArabicCharacterCards();
        break;

      case "illustrations":
        setArabicText(".page-title", "التطوير البصري");
        setArabicHtml(".page-disclaimer", `تعرض هذه الصفحة تطويراً بصرياً تصورياً لسلسلة ${localizedProtectedTitleMarkup("The Caldera Throne")}. الروايات أعمال غير منشورة قيد التطوير، ولم يُنتج أو يُكلّف أي اقتباس تلفزيوني أو سينمائي حتى الآن.`);
        break;

      case "world":
        setArabicText(".page-title", "الرسوم");
        setArabicHtml(".shared-page-header h2", `رسوم الكتب من ${localizedProtectedTitleMarkup("The Caldera Throne")}.`);
        document.querySelectorAll(".series-label").forEach((label, index) => {
          const names = ["الكتاب الأول", "الكتاب الثاني", "الكتاب الثالث"];
          if (names[index]) {
            label.textContent = names[index];
            label.setAttribute("lang", "ar");
            label.setAttribute("dir", "rtl");
          }
        });
        break;

      case "adaptation":
        setArabicText(".page-title", "حقوق الاقتباس التلفزيوني والسينمائي");
        setArabicText(".adaptation-hero h2", "فانتازيا سياسية حربية فاخرة متعددة المواسم، مبنية حول السلطة والشرعية والنبوءة واللوجستيات وكلفة الحكم.");
        setArabicHtml(".adaptation-hero p", `${localizedProtectedTitleMarkup("THE CALDERA THRONE")} مصممة لتلفزيون طويل النفس بطابع فاخر: عمل للبالغين، سياسي، سينمائي، ومحكوم بعواقب القرارات. تتحرك دراماه عبر المجالس والسجلات وأنظمة الغذاء والضغط العسكري والشرعية المدفونة والكلفة الأخلاقية للحكم. تكوّن الكتب الثلاثة الأولى قوساً أساسياً مكتملاً، بينما توسع الكتب الرابعة والخامسة الملحمة نحو إعادة البناء والضغط الإمبراطوري والخلافة.`);
        setArabicText(".screen-grid .pitch-card:nth-child(1) h3", "محرك سياسي");
        setArabicText(".screen-grid .pitch-card:nth-child(1) p", "تتحرك السلطة عبر المجالس والسجلات وأنظمة الغذاء وادعاءات الخلافة والسرديات المضبوطة قبل أن تتحرك الجيوش.");
        setArabicText(".screen-grid .pitch-card:nth-child(2) h3", "عوالم بصرية متمايزة");
        setArabicText(".screen-grid .pitch-card:nth-child(2) p", "جزيرة بركانية، عاصمة داخل فوهة، حصون ساحلية، قاعات سجلات في البر الرئيسي، مرافئ ملكية، وضغط إمبراطوري من ساركاثر.");
        setArabicText(".screen-grid .pitch-card:nth-child(3) h3", "طاقم جماعي واسع");
        setArabicText(".screen-grid .pitch-card:nth-child(3) p", "شخصيات بالغة متعددة الطبقات، صالحة للولاء والخيانة والتصدع الأخلاقي وتراكم العائد الدرامي عبر المواسم.");
        setArabicText(".screen-grid .pitch-card:nth-child(4) h3", "تصاعد موسمي");
        setArabicText(".screen-grid .pitch-card:nth-child(4) p", "كل موسم يدفع الملكية السردية إلى مرحلة جديدة: الانهيار، حرب الحبر، العودة، إعادة البناء، ثم الحساب الأخير.");
        setArabicText(".saga-overview h2", "محرك السلسلة");
        setArabicHtml(".saga-overview p", `${localizedProtectedTitleMarkup("THE CALDERA THRONE")} فانتازيا سياسية حربية للبالغين من خمسة كتب، عن الشرعية والذاكرة وكلفة إعادة بناء عالم مكسور. تصل الحرب عبر الدفاتر قبل السيوف. وتعمل النبوءة كأداة ضبط للدولة قبل أن تعمل كشيء غيبي. تقدم الثلاثية المكتملة الانهيار والتقارب، بينما تنفتح الكتب الرابعة والخامسة على إعادة البناء والضغط الإمبراطوري والخلافة والحساب الأخير.`);
        setArabicText("#season-structure-title", "بنية المواسم");
        document.querySelectorAll(".season-format").forEach((paragraph, index) => {
          const values = [
            "يُتصور كل موسم في 8 حلقات تتراوح مدة الواحدة منها بين 50 و60 دقيقة تقريباً.",
            "تُبنى السلسلة لاقتباس من خمسة مواسم، يتمحور كل موسم حول محرك درامي واضح: الانهيار، حرب الحبر، العودة، إعادة البناء، والحساب."
          ];
          if (values[index]) {
            paragraph.textContent = values[index];
            paragraph.setAttribute("lang", "ar");
            paragraph.setAttribute("dir", "rtl");
          }
        });
        document.querySelectorAll(".season-timeline article").forEach((item, index) => {
          const seasonLabels = ["الموسم الأول — الانهيار", "الموسم الثاني — حرب الحبر", "الموسم الثالث — العودة", "الموسم الرابع — إعادة البناء", "الموسم الخامس — الحساب"];
          const bookLabels = [
            `الكتاب الأول: ${localizedProtectedTitleMarkup("The Still and the Burning", "The Still and the Burning")}`,
            `الكتاب الثاني: ${localizedProtectedTitleMarkup("The Empire of Ledgers", "The Empire of Ledgers")}`,
            `الكتاب الثالث: ${localizedProtectedTitleMarkup("What the Mountain Kept", "What the Mountain Kept")}`,
            "قوس التوسّع",
            "قوس التوسّع"
          ];
          const span = item.querySelector("span");
          const strong = item.querySelector("strong");
          if (span && seasonLabels[index]) span.textContent = seasonLabels[index];
          if (strong && bookLabels[index]) strong.innerHTML = bookLabels[index];
          item.setAttribute("lang", "ar");
          item.setAttribute("dir", "rtl");
        });
        setArabicText(".rights-positioning h2", "تموضع حقوق الاقتباس");
        setArabicText(".rights-positioning p", "تُبنى السلسلة لتلفزيون متسلسل فاخر: كثيف سياسياً، متميز بصرياً، جماعي الشخصيات، ومؤسس على العواقب لا على الاستعراض وحده. تشكّل الكتب الثلاثة الأولى قوساً أساسياً مكتملاً، وتمدد الكتب الرابعة والخامسة العالم نحو إعادة البناء والضغط الإمبراطوري والخلافة.");
        document.querySelectorAll(".series-status span").forEach((item, index) => {
          item.textContent = index === 0 ? "الثلاثية الأساسية: الكتب 1–3 مكتملة" : "قوس التوسّع: الكتابان 4–5 قيد التطوير";
          item.setAttribute("lang", "ar");
          item.setAttribute("dir", "rtl");
        });
        break;

      case "author":
        setArabicText(".author-final-title", "عن المؤلف");
        setArabicHtml(".author-final-name", localizedAuthorMarkup());
        setArabicHtml(".author-final-bio p:nth-child(1)", `نهاراً، يعمل ${localizedAuthorMarkup()} في عالم المال شديد التعقيد؛ مهنة علّمته كيف تدور العجلات الهادئة للسلطة والحوكمة بالفعل. لكنه في جوهره بنّاء عوالم.`);
        setArabicHtml(".author-final-bio p:nth-child(2)", `في ساعاته الهادئة، يصنع مصطفى بيوتاً مصغّرة دقيقة، ويجد سلامه في الصبر اللازم لنسج التفاصيل الصغيرة داخل عالم حي. هذه العناية نفسها تمنح الحياة لـ <em>${localizedProtectedTitleMarkup("The Caldera Throne")}</em>. إنه يبني قصته طبقة بعد طبقة، من الاتساع الهائل للممالك إلى ثقل اختيار خاص واحد.`);
        setArabicText(".author-final-bio p:nth-child(3)", "وُلد كثير من عمله في صمت الصحراء العميق. وبوصفه محباً للتخييم الفردي، كثيراً ما يكتب مصطفى تحت سماء الليل المفتوحة، حيث تساعده رحابة الأرض ووحدتها على تشكيل الروح المناخية لرواياته.");
        setArabicText(".author-miniatures-heading", "عوالم مصغّرة وحِرفية");
        setArabicHtml(".author-miniatures-copy", `بيوت وداخلات مصغّرة دقيقة صُنعت بالصبر نفسه والحس نفسه بالمقياس والجو الذي يشكل ${localizedProtectedTitleMarkup("The Caldera Throne")}.`);
        break;

      case "rights":
        setArabicText(".page-title", "استفسارات الحقوق والتواصل");
        setArabicText(".shared-page-header h2", "للوكلاء الأدبيين، والنشر، والاقتباس التلفزيوني أو السينمائي، والتواصل العام.");
        localizeArabicContactForm();
        break;
    }
  }

  function applyDocumentLanguageMode(languageCode = getCurrentLanguage()) {
    const normalizedLanguageCode = normalizeLanguageCode(languageCode);
    const isArabic = normalizedLanguageCode === "ar";
    const isRtlLanguage = isRtlLanguageCode(normalizedLanguageCode);
    const translated = isTranslatedPage() || normalizedLanguageCode !== "en";
    const currentUrl = getUrl(window.location.href);

    document.documentElement.classList.toggle("translated-ltr", translated && !isRtlLanguage);
    document.documentElement.classList.toggle("translated-rtl", translated && isRtlLanguage);
    document.documentElement.classList.toggle("is-arabic-translation", isArabic);
    document.documentElement.classList.toggle("is-google-translated", translated);
    document.body.classList.toggle("translated-ltr", translated && !isRtlLanguage);
    document.body.classList.toggle("translated-rtl", translated && isRtlLanguage);
    document.body.classList.toggle("google-translated", translated);
    document.body.classList.toggle("is-google-translated", translated);
    document.body.classList.toggle("translated-ar", isArabic);
    document.body.classList.toggle("rtl-lang", isRtlLanguage);
    document.body.classList.toggle("lang-ar", isArabic);
    document.body.classList.toggle("is-arabic-translation", isArabic);
    document.body.classList.toggle("google-proxy-page", Boolean(currentUrl && isTranslateProxyUrl(currentUrl)));
    document.documentElement.classList.remove(...Array.from(document.documentElement.classList).filter((className) => className.startsWith("lang-")));
    document.body.classList.remove(...Array.from(document.body.classList).filter((className) => className.startsWith("lang-")));
    document.documentElement.classList.add(`lang-${normalizedLanguageCode.toLowerCase()}`);
    document.body.classList.add(`lang-${normalizedLanguageCode.toLowerCase()}`);

    if (isRtlLanguage) {
      document.documentElement.setAttribute("lang", normalizedLanguageCode);
      document.documentElement.setAttribute("dir", "ltr");
      document.body.setAttribute("dir", "ltr");
      document.querySelectorAll("main, .hero, .home-hero, .home-frame-stack, .home-gold-frame").forEach((element) => {
        element.style.setProperty("direction", "ltr", "important");
      });
    } else {
      document.documentElement.setAttribute("lang", normalizedLanguageCode === "en" ? "en" : normalizedLanguageCode);
      document.documentElement.setAttribute("dir", "ltr");
      document.body.setAttribute("dir", "ltr");
      document.querySelectorAll("main, .hero, .home-hero, .home-frame-stack, .home-gold-frame").forEach((element) => {
        element.style.removeProperty("direction");
      });
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

    const isArabic = getCurrentLanguage() === "ar";

    button.innerHTML = `
      <span class="translate-floating-globe" aria-hidden="true">\uD83C\uDF10</span>
      <span class="translate-floating-label">${isArabic ? "اللغة" : "LANG"}</span>
    `;
    button.setAttribute("aria-label", isArabic ? "اختيار لغة الموقع" : "Choose site language");
    button.setAttribute("data-language-toggle", "true");
    button.setAttribute("aria-haspopup", "true");
    button.type = "button";
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
    applyArabicLocalizations(isArabic);
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
