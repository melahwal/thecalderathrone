(() => {
  const bookReader = document.querySelector("[data-book-reader]");

  if (!bookReader) {
    return;
  }

  const imagePage = (src, caption) => ({ type: "image", src, caption });

  const books = [
    {
      id: "book-1",
      kicker: "Book 1",
      title: "The Still and the Burning",
      entryImage: "images/book 1/book1-001-title-page.png",
      pages: [
        ...Array.from({ length: 47 }, (_, index) => {
          const number = index + 1;
          const n3 = String(number).padStart(3, "0");

          if (number === 1) return imagePage("images/book 1/book1-001-title-page.png", "Title Page");
          if (number === 2) return imagePage("images/book 1/book1-002-opening-scene.png", "Opening Scene");
          if (number === 47) return imagePage("images/book 1/book1-047-last-illustration.png", "Last Illustration");

          return imagePage(
            `images/book 1/book1-${n3}-scene-${String(number).padStart(2, "0")}.png`,
            `Book 1 Illustration ${String(number).padStart(2, "0")}`
          );
        })
      ]
    },
    {
      id: "book-2",
      kicker: "Book 2",
      title: "The Empire of Ledgers",
      entryImage: "images/book 2/b2_main_01.png",
      pages: [
        imagePage("images/book 2/b2_main_02.png", "Book 2 Main Illustration"),
        ...Array.from({ length: 33 }, (_, index) => {
          const number = index + 1;
          return imagePage(
            `images/book 2/b2_${String(number).padStart(2, "0")}.png`,
            `Book 2 Illustration ${String(number).padStart(2, "0")}`
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
        ...Array.from({ length: 35 }, (_, index) => {
          const number = index + 1;
          return imagePage(
            `images/book 3/b3_${String(number).padStart(2, "0")}.png`,
            `Book 3 Illustration ${String(number).padStart(2, "0")}`
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
        ...Array.from({ length: 10 }, (_, index) => {
          const number = index + 1;
          return imagePage(
            `images/Book 4/b4_${String(number).padStart(2, "0")}.png`,
            `Book 4 Illustration ${String(number).padStart(2, "0")}`
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
    returnButtons: [...bookReader.querySelectorAll("[data-return-selection]")],
    first: [...bookReader.querySelectorAll("[data-book-first]")],
    prev: [...bookReader.querySelectorAll("[data-book-prev-button]")],
    next: [...bookReader.querySelectorAll("[data-book-next-button]")],
    last: [...bookReader.querySelectorAll("[data-book-last]")]
  };

  let bookIndex = 0;
  let pageIndex = 0;
  let isTurning = false;

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
    return `${book.kicker} — ${book.title}`;
  }

  function isMobileView() {
    return window.matchMedia("(max-width: 740px)").matches;
  }

  function renderPage(page, side, pageNumber) {
    if (!page) {
      return '<div class="book-blank-page" aria-hidden="true"></div>';
    }

    return `
      <figure class="book-illustration book-illustration-${side}">
        <span class="book-image-number book-image-number-${side}" aria-label="Illustration number ${pageNumber}">${pageNumber}</span>
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
        <strong>${escapeHtml(book.title)}</strong>
      </button>
    `).join("");
  }

  function renderCurrent() {
    const book = books[bookIndex];
    const total = book.pages.length;

    pageIndex = Math.max(0, Math.min(pageIndex, total - 1));

    els.displayTitle.textContent = titleLine(book);

    const left = book.pages[pageIndex];
    const right = isMobileView() ? null : book.pages[pageIndex + 1] || null;
    const leftNumber = pageIndex + 1;
    const rightNumber = pageIndex + 2;

    els.left.innerHTML = renderPage(left, "left", leftNumber);
    els.right.innerHTML = right ? renderPage(right, "right", rightNumber) : '<div class="book-blank-page" aria-hidden="true"></div>';
    els.right.hidden = isMobileView();

    els.progress.textContent = `${pageIndex + 1} OF ${total}`;
    els.status.textContent = `${titleLine(book)}, image ${pageIndex + 1} of ${total}`;

    const atStart = pageIndex === 0;
    const atEnd = pageIndex >= total - 1;

    els.first.forEach((button) => { button.disabled = atStart; });
    els.prev.forEach((button) => { button.disabled = atStart; });
    els.next.forEach((button) => { button.disabled = atEnd; });
    els.last.forEach((button) => { button.disabled = atEnd; });
  }

  function showSelection() {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    els.viewer.hidden = true;
    els.selection.hidden = false;
  }

  function openBook(index) {
    bookIndex = index;
    pageIndex = 0;

    els.selection.hidden = true;
    els.viewer.hidden = false;
    renderCurrent();
    els.viewer.scrollIntoView({ behavior: "smooth", block: "center" });
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

  function firstView() {
    if (pageIndex <= 0) return;
    flip("backward", () => { pageIndex = 0; });
  }

  function previousView() {
    if (pageIndex <= 0) return;
    flip("backward", () => { pageIndex -= 1; });
  }

  function nextView() {
    if (pageIndex >= books[bookIndex].pages.length - 1) return;
    flip("forward", () => { pageIndex += 1; });
  }

  function lastView() {
    const last = books[bookIndex].pages.length - 1;
    if (pageIndex >= last) return;
    flip("forward", () => { pageIndex = last; });
  }

  bookReader.addEventListener("click", (event) => {
    const select = event.target.closest("[data-select-book]");

    if (select) {
      openBook(Number(select.dataset.selectBook));
    }
  });

  els.first.forEach((button) => button.addEventListener("click", firstView));
  els.prev.forEach((button) => button.addEventListener("click", previousView));
  els.next.forEach((button) => button.addEventListener("click", nextView));
  els.last.forEach((button) => button.addEventListener("click", lastView));
  els.returnButtons.forEach((button) => button.addEventListener("click", showSelection));

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
      renderCurrent();
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
