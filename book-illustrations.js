(() => {
  const bookReader = document.querySelector("[data-book-reader]");

  if (!bookReader) {
    return;
  }

  const imagePage = (src, caption) => ({ type: "image", src, caption });
  const characterSpread = (left, right, caption) => ({ type: "spread", left, right, caption });

  function range(start, end, formatter) {
    return Array.from({ length: end - start + 1 }, (_, index) => formatter(start + index));
  }

  function imageExists(src) {
    return new Promise((resolve) => {
      const image = new Image();
      let finished = false;

      const done = (result) => {
        if (finished) return;
        finished = true;
        resolve(result);
      };

      image.onload = () => done(true);
      image.onerror = () => done(false);
      window.setTimeout(() => done(false), 1800);
      image.src = encodeURI(src);
    });
  }

  async function discoverSequentialPages({ start = 1, max = 200, makeSrcCandidates, makeCaption }) {
    const pages = [];

    for (let number = start; number <= max; number += 1) {
      const candidates = makeSrcCandidates(number);
      let foundSrc = null;

      for (const src of candidates) {
        if (await imageExists(src)) {
          foundSrc = src;
          break;
        }
      }

      if (!foundSrc) {
        break;
      }

      pages.push(imagePage(foundSrc, makeCaption(number)));
    }

    return pages;
  }

  const book1CharacterSpread = characterSpread(
    "images/characters/book1-spread/final/book1-characters-left-page.png",
    "images/characters/book1-spread/final/book1-characters-right-page.png",
    "Book 1 Character Spread"
  );

  const book2CharacterSpread = characterSpread(
    "images/characters/book2-spread/final/book2-characters-left-page.png",
    "images/characters/book2-spread/final/book2-characters-right-page.png",
    "Book 2 Character Spread"
  );

  const book3CharacterSpread = characterSpread(
    "images/characters/book3-spread/final/book3-characters-left-page.png",
    "images/characters/book3-spread/final/book3-characters-right-page.png",
    "Book 3 Character Spread"
  );

  function fallbackBook1Pages() {
    return [
      imagePage("images/book 1/book1-001-title-page.png", "Title Page"),
      imagePage("images/book 1/book1-002-opening-scene.png", "Opening Scene"),
      ...range(3, 44, (number) => imagePage(
        `images/book 1/book1-${String(number).padStart(3, "0")}-scene-${String(number).padStart(2, "0")}.png`,
        `Book 1 Illustration ${String(number).padStart(2, "0")}`
      )),
      imagePage("images/book 1/book1-045-last-illustration.png", "Last Illustration"),
      book1CharacterSpread
    ];
  }

  function fallbackBook2Pages() {
    return [
      ...range(1, 35, (number) => imagePage(
        `images/book 2/b2_${String(number).padStart(2, "0")}.png`,
        `Book 2 Illustration ${String(number).padStart(2, "0")}`
      )),
      book2CharacterSpread
    ];
  }

  function fallbackBook3Pages() {
    return [
      ...range(1, 15, (number) => imagePage(
        `images/book 3/b3_${String(number).padStart(2, "0")}.png`,
        `Book 3 Illustration ${String(number).padStart(2, "0")}`
      )),
      book3CharacterSpread
    ];
  }

  function fallbackBook4Pages() {
    return range(1, 10, (number) => imagePage(
      `images/Book 4/b4_${String(number).padStart(2, "0")}.png`,
      `Book 4 Illustration ${String(number).padStart(2, "0")}`
    ));
  }

  async function discoverBook1Pages() {
    const pages = await discoverSequentialPages({
      start: 1,
      max: 200,
      makeSrcCandidates: (number) => {
        const n3 = String(number).padStart(3, "0");
        const n2 = String(number).padStart(2, "0");

        if (number === 1) {
          return [
            "images/book 1/book1-001-title-page.png",
            `images/book 1/book1-${n3}.png`
          ];
        }

        if (number === 2) {
          return [
            "images/book 1/book1-002-opening-scene.png",
            `images/book 1/book1-${n3}.png`
          ];
        }

        return [
          `images/book 1/book1-${n3}-scene-${n2}.png`,
          `images/book 1/book1-${n3}-last-illustration.png`,
          `images/book 1/book1-${n3}.png`
        ];
      },
      makeCaption: (number) => {
        if (number === 1) return "Title Page";
        if (number === 2) return "Opening Scene";
        if (number === 45) return "Last Illustration";
        return `Book 1 Illustration ${String(number).padStart(2, "0")}`;
      }
    });

    return pages.length ? [...pages, book1CharacterSpread] : fallbackBook1Pages();
  }

  async function discoverBook2Pages() {
    const pages = await discoverSequentialPages({
      start: 1,
      max: 200,
      makeSrcCandidates: (number) => [
        `images/book 2/b2_${String(number).padStart(2, "0")}.png`
      ],
      makeCaption: (number) => `Book 2 Illustration ${String(number).padStart(2, "0")}`
    });

    return pages.length ? [...pages, book2CharacterSpread] : fallbackBook2Pages();
  }

  async function discoverBook3Pages() {
    const pages = await discoverSequentialPages({
      start: 1,
      max: 200,
      makeSrcCandidates: (number) => [
        `images/book 3/b3_${String(number).padStart(2, "0")}.png`
      ],
      makeCaption: (number) => `Book 3 Illustration ${String(number).padStart(2, "0")}`
    });

    return pages.length ? [...pages, book3CharacterSpread] : fallbackBook3Pages();
  }

  async function discoverBook4Pages() {
    const pages = await discoverSequentialPages({
      start: 1,
      max: 200,
      makeSrcCandidates: (number) => [
        `images/Book 4/b4_${String(number).padStart(2, "0")}.png`
      ],
      makeCaption: (number) => `Book 4 Illustration ${String(number).padStart(2, "0")}`
    });

    return pages.length ? pages : fallbackBook4Pages();
  }

  const books = [
    {
      id: "book-1",
      kicker: "Book 1",
      title: "The Still and the Burning",
      entryImage: "images/book 1/book1-001-title-page.png",
      repeat: "Repeat Book 1",
      next: "Go to Book 2",
      nextBook: "book-2",
      pages: fallbackBook1Pages(),
      discoverPages: discoverBook1Pages
    },
    {
      id: "book-2",
      kicker: "Book 2",
      title: "The Empire of Ledgers",
      entryImage: "images/book 2/b2_main_01.png",
      repeat: "Repeat Book 2",
      next: "Go to Book 3",
      nextBook: "book-3",
      pages: fallbackBook2Pages(),
      discoverPages: discoverBook2Pages
    },
    {
      id: "book-3",
      kicker: "Book 3",
      title: "What the Mountain Kept",
      entryImage: "images/book 3/b3_main.png",
      repeat: "Repeat Book 3",
      next: "Go to Book 4",
      nextBook: "book-4",
      pages: fallbackBook3Pages(),
      discoverPages: discoverBook3Pages
    },
    {
      id: "book-4",
      kicker: "Book 4",
      title: "The Imperial Capital",
      entryImage: "images/Book 4/b4_main_01.png",
      repeat: "Repeat Book 4",
      next: "Return to Book Selection",
      nextBook: null,
      pages: fallbackBook4Pages(),
      discoverPages: discoverBook4Pages
    }
  ];

  const els = {
    selection: bookReader.querySelector("[data-book-selection]"),
    viewer: bookReader.querySelector("[data-book-viewer]"),
    kicker: bookReader.querySelector("[data-book-kicker]"),
    title: bookReader.querySelector("[data-book-title]"),
    left: bookReader.querySelector("[data-book-left]"),
    right: bookReader.querySelector("[data-book-right]"),
    turning: bookReader.querySelector("[data-turning-page]"),
    progress: bookReader.querySelector("[data-book-progress]"),
    status: bookReader.querySelector("[data-book-status]"),
    returnButtons: [...bookReader.querySelectorAll("[data-return-selection]")],
    prev: [...bookReader.querySelectorAll("[data-book-prev], [data-book-prev-button]")],
    next: [...bookReader.querySelectorAll("[data-book-next], [data-book-next-button]")]
  };

  let bookIndex = 0;
  let spreadIndex = 0;
  let mobilePageIndex = 0;
  let isTurning = false;
  let lastMobileMode = window.matchMedia("(max-width: 768px)").matches;

  const spreadCache = new Map();
  const mobilePageCache = new Map();

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);
  }

  function titleLine(book) {
    return book.title ? `${book.kicker} - ${book.title}` : book.kicker;
  }

  function endPage(book) {
    return { type: "end", repeat: book.repeat, next: book.next, nextBook: book.nextBook };
  }

  function blankPage() {
    return { type: "blank" };
  }

  function isMobileView() {
    return window.matchMedia("(max-width: 768px)").matches;
  }

  function invalidateCaches(bookId) {
    spreadCache.delete(bookId);
    mobilePageCache.delete(bookId);
  }

  function mobilePagesFor(book) {
    if (mobilePageCache.has(book.id)) {
      return mobilePageCache.get(book.id);
    }

    const pages = [];

    book.pages.forEach((page) => {
      if (page.type !== "spread") {
        pages.push(page);
        return;
      }

      pages.push(imagePage(page.left, `${page.caption} Left Page`));
      pages.push(imagePage(page.right, `${page.caption} Right Page`));
    });

    pages.push(endPage(book));
    mobilePageCache.set(book.id, pages);
    return pages;
  }

  function spreadsFor(book) {
    if (spreadCache.has(book.id)) {
      return spreadCache.get(book.id);
    }

    const pages = [];

    book.pages.forEach((page) => {
      if (page.type !== "spread") {
        pages.push(page);
        return;
      }

      if (pages.length % 2 !== 0) {
        pages.push(blankPage());
      }

      pages.push(imagePage(page.left, `${page.caption} Left Page`));
      pages.push(imagePage(page.right, `${page.caption} Right Page`));
    });

    if (pages.length % 2 !== 0) {
      pages.push(blankPage());
    }

    pages.push(endPage(book), blankPage());

    const spreads = [];
    for (let index = 0; index < pages.length; index += 2) {
      spreads.push([pages[index], pages[index + 1] || blankPage()]);
    }

    spreadCache.set(book.id, spreads);
    return spreads;
  }

  function renderPage(page, side) {
    if (!page || page.type === "blank") {
      return '<div class="book-blank-page" aria-hidden="true"></div>';
    }

    if (page.type === "end") {
      const book = books[bookIndex];

      return `
        <div class="book-end-panel">
          <p class="book-end-kicker">End of Volume</p>
          <h3>${escapeHtml(titleLine(book))}</h3>
          <div class="book-end-actions">
            <button type="button" class="book-control primary" data-repeat-book>${escapeHtml(page.repeat)}</button>
            <button type="button" class="book-control" data-next-book>${escapeHtml(page.next)}</button>
          </div>
        </div>
      `;
    }

    return `
      <figure class="book-illustration book-illustration-${side}">
        <img src="${encodeURI(page.src)}" alt="${escapeHtml(page.caption)} illustration from The Caldera Throne." loading="eager" decoding="async">
        <figcaption>${escapeHtml(page.caption)}</figcaption>
      </figure>
    `;
  }

  function renderSelection() {
    els.selection.innerHTML = books.map((book, index) => `
      <button class="book-select-card" type="button" data-select-book="${index}">
        <span class="book-select-image">
          <img src="${encodeURI(book.entryImage)}" alt="${escapeHtml(titleLine(book))} entry image" loading="eager" decoding="async">
        </span>
        <span class="book-select-kicker">${escapeHtml(book.kicker)}</span>
        ${book.title ? `<strong>${escapeHtml(book.title)}</strong>` : ""}
      </button>
    `).join("");
  }

  function syncIndexesForModeChange() {
    const mobile = isMobileView();

    if (mobile === lastMobileMode) {
      return;
    }

    const book = books[bookIndex];
    if (!book) {
      lastMobileMode = mobile;
      return;
    }

    if (mobile) {
      const pages = mobilePagesFor(book);
      mobilePageIndex = Math.min(spreadIndex * 2, pages.length - 1);
    } else {
      const spreads = spreadsFor(book);
      spreadIndex = Math.min(Math.floor(mobilePageIndex / 2), spreads.length - 1);
    }

    lastMobileMode = mobile;
  }

  function renderCurrent() {
    const book = books[bookIndex];
    const mobile = isMobileView();

    syncIndexesForModeChange();

    els.kicker.textContent = book.title ? `${book.kicker} —` : book.kicker;
    els.title.textContent = book.title;
    els.title.toggleAttribute("hidden", !book.title);

    if (mobile) {
      const pages = mobilePagesFor(book);
      mobilePageIndex = Math.max(0, Math.min(mobilePageIndex, pages.length - 1));
      const page = pages[mobilePageIndex];

      els.left.innerHTML = renderPage(page, "left");
      els.right.innerHTML = "";
      els.right.hidden = true;

      els.progress.textContent = `Page ${mobilePageIndex + 1} of ${pages.length}`;
      els.status.textContent = `${titleLine(book)}, page ${mobilePageIndex + 1} of ${pages.length}`;
      els.prev.forEach((button) => { button.disabled = mobilePageIndex === 0; });
      els.next.forEach((button) => { button.disabled = mobilePageIndex === pages.length - 1; });
      return;
    }

    els.right.hidden = false;

    const spreads = spreadsFor(book);
    spreadIndex = Math.max(0, Math.min(spreadIndex, spreads.length - 1));
    const [left, right] = spreads[spreadIndex];

    els.left.innerHTML = renderPage(left, "left");
    els.right.innerHTML = renderPage(right, "right");
    els.progress.textContent = `Spread ${spreadIndex + 1} of ${spreads.length}`;
    els.status.textContent = `${titleLine(book)}, spread ${spreadIndex + 1} of ${spreads.length}`;
    els.prev.forEach((button) => { button.disabled = spreadIndex === 0; });
    els.next.forEach((button) => { button.disabled = spreadIndex === spreads.length - 1; });
  }

  function showSelection() {
    els.viewer.hidden = true;
    els.selection.hidden = false;
    els.selection.focus({ preventScroll: true });
  }

  function openBook(index) {
    bookIndex = index;
    spreadIndex = 0;
    mobilePageIndex = 0;
    lastMobileMode = isMobileView();

    els.selection.hidden = true;
    els.viewer.hidden = false;
    renderCurrent();
    els.viewer.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function flip(direction, afterTurn) {
    if (isTurning || els.viewer.hidden) {
      return;
    }

    isTurning = true;
    els.turning.className = `turning-page turn-${direction}`;

    window.setTimeout(() => {
      afterTurn();
      renderCurrent();
      els.turning.className = "turning-page";
      isTurning = false;
    }, isMobileView() ? 260 : 820);
  }

  function nextView() {
    const book = books[bookIndex];

    if (isMobileView()) {
      const pages = mobilePagesFor(book);

      if (mobilePageIndex >= pages.length - 1) {
        return;
      }

      flip("forward", () => {
        mobilePageIndex += 1;
      });
      return;
    }

    const spreads = spreadsFor(book);

    if (spreadIndex >= spreads.length - 1) {
      return;
    }

    flip("forward", () => {
      spreadIndex += 1;
    });
  }

  function previousView() {
    if (isMobileView()) {
      if (mobilePageIndex <= 0) {
        return;
      }

      flip("backward", () => {
        mobilePageIndex -= 1;
      });
      return;
    }

    if (spreadIndex <= 0) {
      return;
    }

    flip("backward", () => {
      spreadIndex -= 1;
    });
  }

  async function refreshBookPages(index) {
    const book = books[index];

    try {
      const pages = await book.discoverPages();

      if (pages && pages.length) {
        book.pages = pages;
        invalidateCaches(book.id);

        if (!els.viewer.hidden && bookIndex === index) {
          renderCurrent();
        }
      }
    } catch (error) {
      console.warn(`Could not refresh ${book.kicker} pages`, error);
    }
  }

  function refreshAllBooksInBackground() {
    books.forEach((book, index) => {
      refreshBookPages(index);
    });
  }

  bookReader.addEventListener("click", (event) => {
    const select = event.target.closest("[data-select-book]");

    if (select) {
      openBook(Number(select.dataset.selectBook));
      return;
    }

    if (event.target.closest("[data-repeat-book]")) {
      openBook(bookIndex);
      return;
    }

    if (event.target.closest("[data-next-book]")) {
      const nextBook = books[bookIndex].nextBook;

      if (!nextBook) {
        showSelection();
        return;
      }

      const nextIndex = books.findIndex((book) => book.id === nextBook);

      if (nextIndex >= 0) {
        openBook(nextIndex);
      }
    }
  });

  els.prev.forEach((button) => button.addEventListener("click", previousView));
  els.next.forEach((button) => button.addEventListener("click", nextView));
  els.returnButtons.forEach((button) => button.addEventListener("click", showSelection));

  document.addEventListener("keydown", (event) => {
    if (els.viewer.hidden) {
      return;
    }

    if (event.key === "ArrowRight") {
      nextView();
    }

    if (event.key === "ArrowLeft") {
      previousView();
    }

    if (event.key === "Escape") {
      showSelection();
    }
  });

  window.addEventListener("resize", () => {
    if (els.viewer.hidden) {
      lastMobileMode = isMobileView();
      return;
    }

    renderCurrent();
  });

  window.calderaBookIllustrations = {
    books,
    spreadsFor,
    mobilePagesFor,
    openBook,
    showSelection,
    refreshBookPages,
    refreshAllBooksInBackground
  };

  renderSelection();
  showSelection();
  refreshAllBooksInBackground();
})();