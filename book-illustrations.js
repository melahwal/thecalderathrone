(() => {
  const bookReader = document.querySelector("[data-book-reader]");

  if (!bookReader) {
    return;
  }

  const imagePage = (src, caption) => ({ src, caption });
  const pad2 = (n) => String(n).padStart(2, "0");
  const pad3 = (n) => String(n).padStart(3, "0");
  const arabicBookKickers = {
    "Book 1": "الكتاب الأول",
    "Book 2": "الكتاب الثاني",
    "Book 3": "الكتاب الثالث",
    "Book 4": "الكتاب الرابع"
  };
  const arabicBookOrdinals = {
    1: "الأول",
    2: "الثاني",
    3: "الثالث",
    4: "الرابع"
  };

  const books = [
    {
      id: "book-1",
      kicker: "Book 1",
      title: "The Still and the Burning",
      entryImage: "images/book 1/book1-001-title-page.png",
      pages: [
        imagePage("images/book 1/book1-001-title-page.png", "Title Page"),
        imagePage("images/book 1/book1-002-opening-scene.png", "Opening Scene"),
        ...Array.from({ length: 44 }, (_, i) => {
          const n = i + 3;
          return imagePage(
            `images/book 1/book1-${pad3(n)}-scene-${pad2(n)}.png`,
            `Book 1 Illustration ${pad2(n)}`
          );
        }),
        imagePage("images/book 1/book1-047-last-illustration.png", "Last Illustration")
      ]
    },
    {
      id: "book-2",
      kicker: "Book 2",
      title: "The Empire of Ledgers",
      entryImage: "images/book 2/b2_main_01.png",
      pages: [
        imagePage("images/book 2/b2_main_02.png", "Book 2 Main Illustration"),
        ...Array.from({ length: 33 }, (_, i) => {
          const n = i + 1;
          return imagePage(
            `images/book 2/b2_${pad2(n)}.png`,
            `Book 2 Illustration ${pad2(n)}`
          );
        })
      ]
    },
    {
      id: "book-3",
      kicker: "Book 3",
      title: "What the Mountain Kept",
      entryImage: "images/book 3/b3_main.png",
      pages: [
        imagePage("images/book 3/b3_main.png", "Book 3 Main Illustration"),
        ...Array.from({ length: 35 }, (_, i) => {
          const n = i + 1;
          return imagePage(
            `images/book 3/b3_${pad2(n)}.png`,
            `Book 3 Illustration ${pad2(n)}`
          );
        })
      ]
    },
    {
      id: "book-4",
      kicker: "Book 4",
      title: "The Imperial Capital",
      entryImage: "images/Book 4/b4_main_01.png",
      pages: [
        imagePage("images/Book 4/b4_main_01.png", "Book 4 Main Illustration"),
        ...Array.from({ length: 10 }, (_, i) => {
          const n = i + 1;
          return imagePage(
            `images/Book 4/b4_${pad2(n)}.png`,
            `Book 4 Illustration ${pad2(n)}`
          );
        })
      ]
    }
  ];

  const els = {
    selection: bookReader.querySelector("[data-book-selection]"),
    viewer: bookReader.querySelector("[data-book-viewer]"),
    displayTitle: bookReader.querySelector("[data-book-display-title]"),
    left: bookReader.querySelector("[data-book-left]"),
    right: bookReader.querySelector("[data-book-right]"),
    turning: bookReader.querySelector("[data-turning-page]"),
    progress: bookReader.querySelector("[data-book-progress]"),
    status: bookReader.querySelector("[data-book-status]"),
    first: [...bookReader.querySelectorAll("[data-book-first]")],
    prev: [...bookReader.querySelectorAll("[data-book-prev-button]")],
    next: [...bookReader.querySelectorAll("[data-book-next-button]")],
    last: [...bookReader.querySelectorAll("[data-book-last]")],
    returns: [...bookReader.querySelectorAll("[data-return-selection]")]
  };

  const protectedTitleMarkup = (title) =>
    `<span class="notranslate skiptranslate protected-inline-term protected-title" translate="no" data-protected-name="${escapeHtml(title)}">${escapeHtml(title)}</span>`;

  if (!els.selection || !els.viewer || !els.displayTitle || !els.left || !els.right || !els.progress) {
    return;
  }

  let bookIndex = 0;
  let pageIndex = 0;
  let isTurning = false;
  let openFrame = 0;
  let resizeFrame = 0;
  let turnTimer = 0;

  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);

  const isMobileView = () => window.matchMedia("(max-width: 820px)").matches;
  const isArabicView = () => document.body.classList.contains("lang-ar") || document.documentElement.classList.contains("lang-ar");
  const localizedBookKicker = (book) => (isArabicView() ? arabicBookKickers[book.kicker] || book.kicker : book.kicker);
  const titleLine = (book) => `${localizedBookKicker(book)} \u2014 ${book.title}`;
  const localizedProgress = (leftNumber, rightNumber, total) => {
    if (!isArabicView()) {
      return rightNumber ? `${leftNumber}\u2013${rightNumber} of ${total}` : `${leftNumber} of ${total}`;
    }

    return rightNumber ? `${leftNumber}\u2013${rightNumber} من ${total}` : `${leftNumber} من ${total}`;
  };
  const localizedCaption = (caption) => {
    if (!isArabicView()) {
      return caption;
    }

    if (caption === "Title Page") return "صفحة العنوان";
    if (caption === "Opening Scene") return "المشهد الافتتاحي";
    if (caption === "Last Illustration") return "الرسم الأخير";

    const mainMatch = caption.match(/^Book (\d+) Main Illustration$/);
    if (mainMatch) {
      return `الرسم الرئيسي للكتاب ${arabicBookOrdinals[mainMatch[1]] || mainMatch[1]}`;
    }

    const illustrationMatch = caption.match(/^Book (\d+) Illustration (\d+)$/);
    if (illustrationMatch) {
      return `رسم الكتاب ${arabicBookOrdinals[illustrationMatch[1]] || illustrationMatch[1]} رقم ${illustrationMatch[2]}`;
    }

    return caption;
  };
  const currentSpreadSize = () => (isMobileView() ? 1 : 2);
  const openBookElement = bookReader.querySelector(".open-book");
  let fitFrame = 0;

  const fitOpenBookToViewport = () => {
    if (!openBookElement || els.viewer.hidden) {
      return;
    }

    if (isMobileView()) {
      els.viewer.style.setProperty("--book-fit-scale", "1");
      els.viewer.style.removeProperty("--book-fit-height");
      return;
    }

    const header = document.querySelector("[data-header]");
    const headerHeight = header ? header.getBoundingClientRect().height : 0;
    const naturalWidth = openBookElement.offsetWidth || 1;
    const naturalHeight = openBookElement.offsetHeight || 1;
    const top = openBookElement.getBoundingClientRect().top;
    const horizontalAllowance = Math.max(360, window.innerWidth - 36);
    const verticalAllowance = Math.max(420, window.innerHeight - Math.max(top, headerHeight + 12) - 14);
    const scale = Math.min(1, horizontalAllowance / naturalWidth, verticalAllowance / naturalHeight);
    const roundedScale = Math.max(0.62, Math.floor(scale * 1000) / 1000);

    els.viewer.style.setProperty("--book-fit-scale", String(roundedScale));
    els.viewer.style.setProperty("--book-fit-height", `${Math.ceil(naturalHeight * roundedScale)}px`);
  };

  const queueOpenBookFit = () => {
    window.cancelAnimationFrame(fitFrame);
    fitFrame = window.requestAnimationFrame(fitOpenBookToViewport);
  };

  const scrollViewerIntoPlace = () => {
    const section = bookReader.closest(".book-illustrations-section") || bookReader;
    const header = document.querySelector("[data-header]");
    const headerHeight = header ? header.getBoundingClientRect().height : 0;
    const targetTop = section.getBoundingClientRect().top + window.scrollY - headerHeight - 10;

    window.scrollTo({
      top: Math.max(0, targetTop),
      left: 0,
      behavior: "auto"
    });
  };

  const watchCurrentImagesForFit = () => {
    if (!els.viewer || els.viewer.hidden) {
      return;
    }

    els.viewer.querySelectorAll(".book-illustration img").forEach((image) => {
      if (!image.complete) {
        image.addEventListener("load", queueOpenBookFit, { once: true });
        image.addEventListener("error", queueOpenBookFit, { once: true });
      }
    });
  };

  const lastSpreadIndex = (total) => {
    if (total <= 1) return 0;
    if (isMobileView()) return total - 1;
    return total % 2 === 0 ? total - 2 : total - 1;
  };

  const normalizePageIndex = (index, total) => {
    const safeIndex = Math.max(0, Math.min(index, total - 1));

    if (isMobileView()) {
      return safeIndex;
    }

    const lastIndex = lastSpreadIndex(total);
    if (safeIndex >= lastIndex) {
      return lastIndex;
    }

    return safeIndex - (safeIndex % 2);
  };

  const renderPage = (page, side) => {
    if (!page) {
      return '<div class="book-blank-page" aria-hidden="true"></div>';
    }

    const caption = localizedCaption(page.caption);

    return `
      <figure class="book-illustration book-illustration-${side}">
        <img src="${encodeURI(page.src)}" alt="${escapeHtml(caption)} illustration from The Caldera Throne." loading="eager" decoding="async">
        <figcaption>${escapeHtml(caption)}</figcaption>
      </figure>
    `;
  };

  const renderSelection = () => {
    els.selection.innerHTML = books.map((book, index) => `
      <button class="book-select-card" type="button" data-select-book="${index}">
        <span class="book-select-image">
          <img src="${encodeURI(book.entryImage)}" alt="${escapeHtml(titleLine(book))} entry image" loading="eager" decoding="async">
        </span>
        <span class="book-select-kicker">${escapeHtml(localizedBookKicker(book))}</span>
        <strong>${protectedTitleMarkup(book.title)}</strong>
      </button>
    `).join("");
  };

  const renderCurrent = () => {
    const book = books[bookIndex];
    const total = book.pages.length;

    pageIndex = normalizePageIndex(pageIndex, total);

    els.displayTitle.innerHTML = `${escapeHtml(localizedBookKicker(book))} &mdash; ${protectedTitleMarkup(book.title)}`;

    const left = book.pages[pageIndex];
    const right = isMobileView() ? null : (book.pages[pageIndex + 1] || null);

    els.left.innerHTML = renderPage(left, "left");
    els.right.hidden = isMobileView();
    els.right.innerHTML = right ? renderPage(right, "right") : '<div class="book-blank-page" aria-hidden="true"></div>';

    const leftNumber = pageIndex + 1;
    const rightNumber = right ? pageIndex + 2 : null;

    els.progress.textContent = localizedProgress(leftNumber, rightNumber, total);
    if (els.status) {
      els.status.textContent = rightNumber
        ? (isArabicView()
          ? `${titleLine(book)}، الصور ${leftNumber} إلى ${rightNumber} من ${total}`
          : `${titleLine(book)}, images ${leftNumber} to ${rightNumber} of ${total}`)
        : (isArabicView()
          ? `${titleLine(book)}، الصورة ${leftNumber} من ${total}`
          : `${titleLine(book)}, image ${leftNumber} of ${total}`);
    }

    const atStart = pageIndex === 0;
    const atEnd = pageIndex >= lastSpreadIndex(total);

    els.first.forEach((button) => { button.disabled = atStart; });
    els.prev.forEach((button) => { button.disabled = atStart; });
    els.next.forEach((button) => { button.disabled = atEnd; });
    els.last.forEach((button) => { button.disabled = atEnd; });
    watchCurrentImagesForFit();
    queueOpenBookFit();
  };

  const showSelection = () => {
    window.cancelAnimationFrame(openFrame);
    window.cancelAnimationFrame(resizeFrame);
    window.clearTimeout(turnTimer);
    isTurning = false;
    els.viewer.hidden = true;
    els.selection.hidden = false;
    els.viewer.style.removeProperty("--book-fit-scale");
    els.viewer.style.removeProperty("--book-fit-height");
    if (els.turning) {
      els.turning.className = "turning-page";
    }
  };

  const openBook = (index) => {
    const nextBookIndex = Number(index);

    if (!Number.isInteger(nextBookIndex) || !books[nextBookIndex]) {
      return;
    }

    window.cancelAnimationFrame(openFrame);
    window.clearTimeout(turnTimer);
    isTurning = false;
    bookIndex = nextBookIndex;
    pageIndex = 0;
    els.selection.hidden = true;
    els.viewer.hidden = false;

    openFrame = window.requestAnimationFrame(() => {
      renderCurrent();
      window.requestAnimationFrame(() => {
        scrollViewerIntoPlace();
        queueOpenBookFit();
      });
    });
  };

  const flip = (direction, afterTurn) => {
    if (isTurning || els.viewer.hidden) return;

    isTurning = true;
    window.clearTimeout(turnTimer);
    if (els.turning) {
      els.turning.className = `turning-page turn-${direction}`;
    }

    turnTimer = window.setTimeout(() => {
      if (!els.viewer.hidden) {
        afterTurn();
        renderCurrent();
      }

      if (els.turning) {
        els.turning.className = "turning-page";
      }

      isTurning = false;
      turnTimer = 0;
    }, isMobileView() ? 260 : 820);
  };

  const firstView = () => {
    if (pageIndex <= 0) return;
    flip("backward", () => { pageIndex = 0; });
  };

  const previousView = () => {
    if (pageIndex <= 0) return;
    flip("backward", () => {
      pageIndex = Math.max(0, pageIndex - currentSpreadSize());
    });
  };

  const nextView = () => {
    const total = books[bookIndex].pages.length;
    const last = lastSpreadIndex(total);
    if (pageIndex >= last) return;
    flip("forward", () => {
      pageIndex = Math.min(last, pageIndex + currentSpreadSize());
    });
  };

  const lastView = () => {
    const last = lastSpreadIndex(books[bookIndex].pages.length);
    if (pageIndex >= last) return;
    flip("forward", () => { pageIndex = last; });
  };

  bookReader.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : event.target?.parentElement;
    const select = target?.closest("[data-select-book]");
    if (select) {
      event.preventDefault();
      openBook(Number(select.dataset.selectBook));
    }
  });

  els.first.forEach((button) => button.addEventListener("click", firstView));
  els.prev.forEach((button) => button.addEventListener("click", previousView));
  els.next.forEach((button) => button.addEventListener("click", nextView));
  els.last.forEach((button) => button.addEventListener("click", lastView));
  els.returns.forEach((button) => button.addEventListener("click", showSelection));

  document.addEventListener("keydown", (event) => {
    if (els.viewer.hidden) return;

    if (event.key === "ArrowRight") nextView();
    if (event.key === "ArrowLeft") previousView();
    if (event.key === "Home") firstView();
    if (event.key === "End") lastView();
    if (event.key === "Escape") showSelection();
  });

  window.addEventListener("resize", () => {
    if (!els.viewer.hidden) {
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(() => {
        renderCurrent();
        queueOpenBookFit();
      });
    }
  });

  window.calderaBookIllustrations = {
    books,
    openBook,
    showSelection
  };

  renderSelection();
  showSelection();
})();
