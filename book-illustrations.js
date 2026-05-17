(() => {
  const bookReader = document.querySelector("[data-book-reader]");

  if (!bookReader) {
    return;
  }

  const imagePage = (src, caption) => ({ src, caption });
  const pad2 = (n) => String(n).padStart(2, "0");
  const pad3 = (n) => String(n).padStart(3, "0");

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

  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);

  const titleLine = (book) => `${book.kicker} \u2014 ${book.title}`;

  const isMobileView = () => window.matchMedia("(max-width: 740px)").matches;
  const currentSpreadSize = () => (isMobileView() ? 1 : 2);

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

    return `
      <figure class="book-illustration book-illustration-${side}">
        <img src="${encodeURI(page.src)}" alt="${escapeHtml(page.caption)} illustration from The Caldera Throne." loading="eager" decoding="async">
        <figcaption>${escapeHtml(page.caption)}</figcaption>
      </figure>
    `;
  };

  const renderSelection = () => {
    els.selection.innerHTML = books.map((book, index) => `
      <button class="book-select-card" type="button" data-select-book="${index}">
        <span class="book-select-image">
          <img src="${encodeURI(book.entryImage)}" alt="${escapeHtml(titleLine(book))} entry image" loading="eager" decoding="async">
        </span>
        <span class="book-select-kicker">${escapeHtml(book.kicker)}</span>
        <strong>${protectedTitleMarkup(book.title)}</strong>
      </button>
    `).join("");
  };

  const renderCurrent = () => {
    const book = books[bookIndex];
    const total = book.pages.length;

    pageIndex = normalizePageIndex(pageIndex, total);

    els.displayTitle.innerHTML = `${escapeHtml(book.kicker)} &mdash; ${protectedTitleMarkup(book.title)}`;

    const left = book.pages[pageIndex];
    const right = isMobileView() ? null : (book.pages[pageIndex + 1] || null);

    els.left.innerHTML = renderPage(left, "left");
    els.right.hidden = isMobileView();
    els.right.innerHTML = right ? renderPage(right, "right") : '<div class="book-blank-page" aria-hidden="true"></div>';

    const leftNumber = pageIndex + 1;
    const rightNumber = right ? pageIndex + 2 : null;

    els.progress.textContent = rightNumber ? `${leftNumber}\u2013${rightNumber} of ${total}` : `${leftNumber} of ${total}`;
    if (els.status) {
      els.status.textContent = rightNumber
        ? `${titleLine(book)}, images ${leftNumber} to ${rightNumber} of ${total}`
        : `${titleLine(book)}, image ${leftNumber} of ${total}`;
    }

    const atStart = pageIndex === 0;
    const atEnd = pageIndex >= lastSpreadIndex(total);

    els.first.forEach((button) => { button.disabled = atStart; });
    els.prev.forEach((button) => { button.disabled = atStart; });
    els.next.forEach((button) => { button.disabled = atEnd; });
    els.last.forEach((button) => { button.disabled = atEnd; });
  };

  const showSelection = () => {
    els.viewer.hidden = true;
    els.selection.hidden = false;
  };

  const openBook = (index) => {
    bookIndex = index;
    pageIndex = 0;
    els.selection.hidden = true;
    els.viewer.hidden = false;
    renderCurrent();
  };

  const flip = (direction, afterTurn) => {
    if (isTurning || els.viewer.hidden) return;

    isTurning = true;
    if (els.turning) {
      els.turning.className = `turning-page turn-${direction}`;
    }

    window.setTimeout(() => {
      afterTurn();
      renderCurrent();
      if (els.turning) {
        els.turning.className = "turning-page";
      }
      isTurning = false;
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
    const select = event.target.closest("[data-select-book]");
    if (select) {
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
