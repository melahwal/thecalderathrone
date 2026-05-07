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

  const book1Pages = [
    imagePage("images/book 1/book1-001-title-page.png", "Title Page"),
    imagePage("images/book 1/book1-002-opening-scene.png", "Opening Scene"),
    ...range(3, 44, (number) => imagePage(
      `images/book 1/book1-${String(number).padStart(3, "0")}-scene-${String(number).padStart(2, "0")}.png`,
      `Scene ${String(number).padStart(2, "0")}`
    )),
    imagePage("images/book 1/book1-045-last-illustration.png", "Last Illustration"),
    characterSpread(
      "images/characters/book1-spread/final/book1-characters-left-page.png",
      "images/characters/book1-spread/final/book1-characters-right-page.png",
      "Book I Character Spread"
    )
  ];

  const book2Pages = [
    ...range(1, 28, (number) => imagePage(
      `images/book 2/b2_${String(number).padStart(2, "0")}.png`,
      `Book II Illustration ${String(number).padStart(2, "0")}`
    )),
    characterSpread(
      "images/characters/book2-spread/final/book2-characters-left-page.png",
      "images/characters/book2-spread/final/book2-characters-right-page.png",
      "Book II Character Spread"
    )
  ];

  const book3Pages = [
    ...range(1, 15, (number) => imagePage(
      `images/book 3/b3_${String(number).padStart(2, "0")}.png`,
      `Book III Illustration ${String(number).padStart(2, "0")}`
    )),
    characterSpread(
      "images/characters/book3-spread/final/book3-characters-left-page.png",
      "images/characters/book3-spread/final/book3-characters-right-page.png",
      "Book III Character Spread"
    )
  ];

  const book4Pages = range(1, 10, (number) => imagePage(
    `images/Book 4/b4_${String(number).padStart(2, "0")}.png`,
    `Book IV Illustration ${String(number).padStart(2, "0")}`
  ));

  const books = [
    {
      id: "book-1",
      kicker: "Book I",
      title: "The Still and the Burning",
      entryImage: "images/book 1/book1-001-title-page.png",
      repeat: "Repeat Book 1",
      next: "Go to Book 2",
      nextBook: "book-2",
      pages: book1Pages
    },
    {
      id: "book-2",
      kicker: "Book II",
      title: "The Empire of Ledgers",
      entryImage: "images/book 2/b2_main_01.png",
      repeat: "Repeat Book 2",
      next: "Go to Book 3",
      nextBook: "book-3",
      pages: book2Pages
    },
    {
      id: "book-3",
      kicker: "Book III",
      title: "What the Mountain Kept",
      entryImage: "images/book 3/b3_main.png",
      repeat: "Repeat Book 3",
      next: "Go to Book 4",
      nextBook: "book-4",
      pages: book3Pages
    },
    {
      id: "book-4",
      kicker: "Book IV",
      title: "",
      entryImage: "images/Book 4/b4_main_01.png",
      repeat: "Repeat Book 4",
      next: "Return to Book Selection",
      nextBook: null,
      pages: book4Pages
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
  let isTurning = false;
  const spreadCache = new Map();

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

  function flatPages(book) {
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
    return pages;
  }

  function spreadsFor(book) {
    if (spreadCache.has(book.id)) {
      return spreadCache.get(book.id);
    }

    const pages = flatPages(book);
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
        <span class="book-select-image"><img src="${encodeURI(book.entryImage)}" alt="${escapeHtml(titleLine(book))} entry image" loading="eager" decoding="async"></span>
        <span class="book-select-kicker">${escapeHtml(book.kicker)}</span>
        ${book.title ? `<strong>${escapeHtml(book.title)}</strong>` : ""}
      </button>
    `).join("");
  }

  function renderSpread() {
    const book = books[bookIndex];
    const spreads = spreadsFor(book);
    spreadIndex = Math.max(0, Math.min(spreadIndex, spreads.length - 1));
    const [left, right] = spreads[spreadIndex];

    els.kicker.textContent = book.title ? `${book.kicker} —` : book.kicker;
    els.title.textContent = book.title;
    els.title.toggleAttribute("hidden", !book.title);
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
    els.selection.hidden = true;
    els.viewer.hidden = false;
    renderSpread();
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
      renderSpread();
      els.turning.className = "turning-page";
      isTurning = false;
    }, 820);
  }

  function nextSpread() {
    const spreads = spreadsFor(books[bookIndex]);
    if (spreadIndex >= spreads.length - 1) {
      return;
    }

    flip("forward", () => {
      spreadIndex += 1;
    });
  }

  function previousSpread() {
    if (spreadIndex <= 0) {
      return;
    }

    flip("backward", () => {
      spreadIndex -= 1;
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

  els.prev.forEach((button) => button.addEventListener("click", previousSpread));
  els.next.forEach((button) => button.addEventListener("click", nextSpread));
  els.returnButtons.forEach((button) => button.addEventListener("click", showSelection));

  document.addEventListener("keydown", (event) => {
    if (els.viewer.hidden) {
      return;
    }

    if (event.key === "ArrowRight") {
      nextSpread();
    }

    if (event.key === "ArrowLeft") {
      previousSpread();
    }

    if (event.key === "Escape") {
      showSelection();
    }
  });

  window.calderaBookIllustrations = {
    books,
    spreadsFor,
    openBook,
    showSelection
  };

  renderSelection();
  showSelection();
})();
