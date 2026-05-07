const bookReader = document.querySelector("[data-book-reader]");

if (bookReader) {
  const books = [
  {
    "id": "book-1",
    "label": "Book 1",
    "kicker": "Book I",
    "title": "The Still and the Burning",
    "entryImage": "/images/book 1/book1-001-title-page.png",
    "repeat": "Repeat Book 1",
    "next": "Go to Book 2",
    "nextBook": "book-2",
    "pages": [
      {
        "type": "image",
        "src": "/images/book 1/book1-001-title-page.png",
        "caption": "Title Page"
      },
      {
        "type": "image",
        "src": "/images/book 1/book1-002-opening-scene.png",
        "caption": "Opening Scene"
      },
      {
        "type": "image",
        "src": "/images/book 1/book1-003-scene-03.png",
        "caption": "Scene 03"
      },
      {
        "type": "image",
        "src": "/images/book 1/book1-003-scene-04.png",
        "caption": "Scene 04"
      },
      {
        "type": "image",
        "src": "/images/book 1/book1-003-scene-05.png",
        "caption": "Scene 05"
      },
      {
        "type": "image",
        "src": "/images/book 1/book1-003-scene-06.png",
        "caption": "Scene 06"
      },
      {
        "type": "image",
        "src": "/images/book 1/book1-003-scene-07.png",
        "caption": "Scene 07"
      },
      {
        "type": "image",
        "src": "/images/book 1/book1-003-scene-08.png",
        "caption": "Scene 08"
      },
      {
        "type": "image",
        "src": "/images/book 1/book1-003-scene-09.png",
        "caption": "Scene 09"
      },
      {
        "type": "image",
        "src": "/images/book 1/book1-003-scene-10.png",
        "caption": "Scene 10"
      },
      {
        "type": "image",
        "src": "/images/book 1/book1-003-scene-11.png",
        "caption": "Scene 11"
      },
      {
        "type": "image",
        "src": "/images/book 1/book1-003-scene-12.png",
        "caption": "Scene 12"
      },
      {
        "type": "image",
        "src": "/images/book 1/book1-003-scene-13.png",
        "caption": "Scene 13"
      },
      {
        "type": "image",
        "src": "/images/book 1/book1-003-scene-14.png",
        "caption": "Scene 14"
      },
      {
        "type": "image",
        "src": "/images/book 1/book1-003-scene-15.png",
        "caption": "Scene 15"
      },
      {
        "type": "image",
        "src": "/images/book 1/book1-003-scene-16.png",
        "caption": "Scene 16"
      },
      {
        "type": "image",
        "src": "/images/book 1/book1-003-scene-17.png",
        "caption": "Scene 17"
      },
      {
        "type": "image",
        "src": "/images/book 1/book1-003-scene-18.png",
        "caption": "Scene 18"
      },
      {
        "type": "image",
        "src": "/images/book 1/book1-003-scene-19.png",
        "caption": "Scene 19"
      },
      {
        "type": "image",
        "src": "/images/book 1/book1-003-scene-20.png",
        "caption": "Scene 20"
      },
      {
        "type": "image",
        "src": "/images/book 1/book1-003-scene-21.png",
        "caption": "Scene 21"
      },
      {
        "type": "image",
        "src": "/images/book 1/book1-003-scene-22.png",
        "caption": "Scene 22"
      },
      {
        "type": "image",
        "src": "/images/book 1/book1-003-scene-23.png",
        "caption": "Scene 23"
      },
      {
        "type": "image",
        "src": "/images/book 1/book1-003-scene-24.png",
        "caption": "Scene 24"
      },
      {
        "type": "image",
        "src": "/images/book 1/book1-003-scene-25.png",
        "caption": "Scene 25"
      },
      {
        "type": "image",
        "src": "/images/book 1/book1-003-scene-26.png",
        "caption": "Scene 26"
      },
      {
        "type": "image",
        "src": "/images/book 1/book1-003-scene-27.png",
        "caption": "Scene 27"
      },
      {
        "type": "image",
        "src": "/images/book 1/book1-003-scene-28.png",
        "caption": "Scene 28"
      },
      {
        "type": "image",
        "src": "/images/book 1/book1-003-scene-29.png",
        "caption": "Scene 29"
      },
      {
        "type": "image",
        "src": "/images/book 1/book1-003-scene-30.png",
        "caption": "Scene 30"
      },
      {
        "type": "image",
        "src": "/images/book 1/book1-003-scene-31.png",
        "caption": "Scene 31"
      },
      {
        "type": "image",
        "src": "/images/book 1/book1-003-scene-32.png",
        "caption": "Scene 32"
      },
      {
        "type": "image",
        "src": "/images/book 1/book1-003-scene-33.png",
        "caption": "Scene 33"
      },
      {
        "type": "image",
        "src": "/images/book 1/book1-003-scene-34.png",
        "caption": "Scene 34"
      },
      {
        "type": "image",
        "src": "/images/book 1/book1-003-scene-35.png",
        "caption": "Scene 35"
      },
      {
        "type": "image",
        "src": "/images/book 1/book1-003-scene-36.png",
        "caption": "Scene 36"
      },
      {
        "type": "image",
        "src": "/images/book 1/book1-003-scene-37.png",
        "caption": "Scene 37"
      },
      {
        "type": "image",
        "src": "/images/book 1/book1-003-scene-38.png",
        "caption": "Scene 38"
      },
      {
        "type": "image",
        "src": "/images/book 1/book1-003-scene-39.png",
        "caption": "Scene 39"
      },
      {
        "type": "image",
        "src": "/images/book 1/book1-003-scene-40.png",
        "caption": "Scene 40"
      },
      {
        "type": "image",
        "src": "/images/book 1/book1-003-scene-41.png",
        "caption": "Scene 41"
      },
      {
        "type": "image",
        "src": "/images/book 1/book1-003-scene-42.png",
        "caption": "Scene 42"
      },
      {
        "type": "image",
        "src": "/images/book 1/book1-003-scene-43.png",
        "caption": "Scene 43"
      },
      {
        "type": "image",
        "src": "/images/book 1/book1-003-scene-44.png",
        "caption": "Scene 44"
      },
      {
        "type": "image",
        "src": "/images/book 1/book1-045-last-illustration.png",
        "caption": "Last Illustration"
      },
      {
        "type": "spread",
        "left": "/images/characters/book1-spread/final/book1-characters-left-page.png",
        "right": "/images/characters/book1-spread/final/book1-characters-right-page.png",
        "caption": "Book 1 Character Spread"
      }
    ]
  },
  {
    "id": "book-2",
    "label": "Book 2",
    "kicker": "Book II",
    "title": "The Empire of Ledgers",
    "entryImage": "/images/book 2/b2_main_01.png",
    "repeat": "Repeat Book 2",
    "next": "Go to Book 3",
    "nextBook": "book-3",
    "pages": [
      {
        "type": "image",
        "src": "/images/book 2/b2_01.png",
        "caption": "b2_01"
      },
      {
        "type": "image",
        "src": "/images/book 2/b2_02.png",
        "caption": "b2_02"
      },
      {
        "type": "image",
        "src": "/images/book 2/b2_03.png",
        "caption": "b2_03"
      },
      {
        "type": "image",
        "src": "/images/book 2/b2_04.png",
        "caption": "b2_04"
      },
      {
        "type": "image",
        "src": "/images/book 2/b2_05.png",
        "caption": "b2_05"
      },
      {
        "type": "image",
        "src": "/images/book 2/b2_06.png",
        "caption": "b2_06"
      },
      {
        "type": "image",
        "src": "/images/book 2/b2_07.png",
        "caption": "b2_07"
      },
      {
        "type": "image",
        "src": "/images/book 2/b2_08.png",
        "caption": "b2_08"
      },
      {
        "type": "image",
        "src": "/images/book 2/b2_09.png",
        "caption": "b2_09"
      },
      {
        "type": "image",
        "src": "/images/book 2/b2_10.png",
        "caption": "b2_10"
      },
      {
        "type": "image",
        "src": "/images/book 2/b2_11.png",
        "caption": "b2_11"
      },
      {
        "type": "image",
        "src": "/images/book 2/b2_12.png",
        "caption": "b2_12"
      },
      {
        "type": "image",
        "src": "/images/book 2/b2_13.png",
        "caption": "b2_13"
      },
      {
        "type": "image",
        "src": "/images/book 2/b2_14.png",
        "caption": "b2_14"
      },
      {
        "type": "image",
        "src": "/images/book 2/b2_15.png",
        "caption": "b2_15"
      },
      {
        "type": "image",
        "src": "/images/book 2/b2_16.png",
        "caption": "b2_16"
      },
      {
        "type": "image",
        "src": "/images/book 2/b2_17.png",
        "caption": "b2_17"
      },
      {
        "type": "image",
        "src": "/images/book 2/b2_18.png",
        "caption": "b2_18"
      },
      {
        "type": "image",
        "src": "/images/book 2/b2_19.png",
        "caption": "b2_19"
      },
      {
        "type": "image",
        "src": "/images/book 2/b2_20.png",
        "caption": "b2_20"
      },
      {
        "type": "image",
        "src": "/images/book 2/b2_21.png",
        "caption": "b2_21"
      },
      {
        "type": "image",
        "src": "/images/book 2/b2_22.png",
        "caption": "b2_22"
      },
      {
        "type": "image",
        "src": "/images/book 2/b2_23.png",
        "caption": "b2_23"
      },
      {
        "type": "image",
        "src": "/images/book 2/b2_24.png",
        "caption": "b2_24"
      },
      {
        "type": "image",
        "src": "/images/book 2/b2_25.png",
        "caption": "b2_25"
      },
      {
        "type": "image",
        "src": "/images/book 2/b2_26.png",
        "caption": "b2_26"
      },
      {
        "type": "image",
        "src": "/images/book 2/b2_27.png",
        "caption": "b2_27"
      },
      {
        "type": "image",
        "src": "/images/book 2/b2_28.png",
        "caption": "b2_28"
      },
      {
        "type": "spread",
        "left": "/images/characters/book2-spread/final/book2-characters-left-page.png",
        "right": "/images/characters/book2-spread/final/book2-characters-right-page.png",
        "caption": "Book 2 Character Spread"
      }
    ]
  },
  {
    "id": "book-3",
    "label": "Book 3",
    "kicker": "Book III",
    "title": "What the Mountain Kept",
    "entryImage": "/images/book 3/b3_main.png",
    "repeat": "Repeat Book 3",
    "next": "Go to Book 4",
    "nextBook": "book-4",
    "pages": [
      {
        "type": "image",
        "src": "/images/book 3/b3_01.png",
        "caption": "b3_01"
      },
      {
        "type": "image",
        "src": "/images/book 3/b3_02.png",
        "caption": "b3_02"
      },
      {
        "type": "image",
        "src": "/images/book 3/b3_03.png",
        "caption": "b3_03"
      },
      {
        "type": "image",
        "src": "/images/book 3/b3_04.png",
        "caption": "b3_04"
      },
      {
        "type": "image",
        "src": "/images/book 3/b3_05.png",
        "caption": "b3_05"
      },
      {
        "type": "image",
        "src": "/images/book 3/b3_06.png",
        "caption": "b3_06"
      },
      {
        "type": "image",
        "src": "/images/book 3/b3_07.png",
        "caption": "b3_07"
      },
      {
        "type": "image",
        "src": "/images/book 3/b3_08.png",
        "caption": "b3_08"
      },
      {
        "type": "image",
        "src": "/images/book 3/b3_09.png",
        "caption": "b3_09"
      },
      {
        "type": "image",
        "src": "/images/book 3/b3_10.png",
        "caption": "b3_10"
      },
      {
        "type": "image",
        "src": "/images/book 3/b3_11.png",
        "caption": "b3_11"
      },
      {
        "type": "image",
        "src": "/images/book 3/b3_12.png",
        "caption": "b3_12"
      },
      {
        "type": "image",
        "src": "/images/book 3/b3_13.png",
        "caption": "b3_13"
      },
      {
        "type": "image",
        "src": "/images/book 3/b3_14.png",
        "caption": "b3_14"
      },
      {
        "type": "image",
        "src": "/images/book 3/b3_15.png",
        "caption": "b3_15"
      },
      {
        "type": "spread",
        "left": "/images/characters/book3-spread/final/book3-characters-left-page.png",
        "right": "/images/characters/book3-spread/final/book3-characters-right-page.png",
        "caption": "Book 3 Character Spread"
      }
    ]
  },
  {
    "id": "book-4",
    "label": "Book 4",
    "kicker": "Book IV",
    "title": "",
    "entryImage": "/images/Book 4/b4_main_01.png",
    "repeat": "Repeat Book 4",
    "next": "Return to Book Selection",
    "nextBook": null,
    "pages": [
      {
        "type": "image",
        "src": "/images/Book 4/b4_01.png",
        "caption": "b4_01"
      },
      {
        "type": "image",
        "src": "/images/Book 4/b4_02.png",
        "caption": "b4_02"
      },
      {
        "type": "image",
        "src": "/images/Book 4/b4_03.png",
        "caption": "b4_03"
      },
      {
        "type": "image",
        "src": "/images/Book 4/b4_main_01.png",
        "caption": "B4 Main 01"
      },
      {
        "type": "image",
        "src": "/images/Book 4/b4_main_01a.png",
        "caption": "B4 Main 01a"
      },
      {
        "type": "image",
        "src": "/images/Book 4/b4_main_01b.png",
        "caption": "B4 Main 01b"
      },
      {
        "type": "image",
        "src": "/images/Book 4/b4_main_02.png",
        "caption": "B4 Main 02"
      },
      {
        "type": "image",
        "src": "/images/Book 4/b4_main_03.png",
        "caption": "B4 Main 03"
      },
      {
        "type": "image",
        "src": "/images/Book 4/b4_main_04.png",
        "caption": "B4 Main 04"
      },
      {
        "type": "image",
        "src": "/images/Book 4/b4_main_05.png",
        "caption": "B4 Main 05"
      },
      {
        "type": "image",
        "src": "/images/Book 4/b4_main_06.png",
        "caption": "B4 Main 06"
      }
    ]
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

  function titleLine(book) {
    return book.title ? `${book.kicker} — ${book.title}` : book.kicker;
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
      if (page.type === "spread") {
        if (pages.length % 2 !== 0) {
          pages.push(blankPage());
        }
        pages.push({ type: "image", src: page.left, caption: page.caption });
        pages.push({ type: "image", src: page.right, caption: page.caption });
        return;
      }
      pages.push(page);
    });
    if (pages.length % 2 !== 0) {
      pages.push(blankPage());
    }
    pages.push(endPage(book));
    return pages;
  }

  function spreadsFor(book) {
    const pages = flatPages(book);
    const spreads = [];
    for (let index = 0; index < pages.length; index += 2) {
      spreads.push([pages[index], pages[index + 1] || blankPage()]);
    }
    return spreads;
  }

  function renderPage(page, side) {
    if (!page || page.type === "blank") {
      return '<div class="book-blank-page" aria-hidden="true"></div>';
    }
    if (page.type === "end") {
      return `
        <div class="book-end-panel">
          <p class="book-end-kicker">End of Volume</p>
          <h3>${titleLine(books[bookIndex])}</h3>
          <div class="book-end-actions">
            <button type="button" class="book-control primary" data-repeat-book>${page.repeat}</button>
            <button type="button" class="book-control" data-next-book>${page.next}</button>
          </div>
        </div>
      `;
    }
    return `
      <figure class="book-illustration book-illustration-${side}">
        <img src="${page.src}" alt="${page.caption} illustration from The Caldera Throne." loading="eager">
        <figcaption>${page.caption}</figcaption>
      </figure>
    `;
  }

  function renderSelection() {
    els.selection.innerHTML = books.map((book, index) => `
      <button class="book-select-card" type="button" data-select-book="${index}">
        <span class="book-select-image"><img src="${book.entryImage}" alt="${titleLine(book)} entry image"></span>
        <span class="book-select-kicker">${book.kicker}</span>
        <strong>${book.title || "Illustrations"}</strong>
      </button>
    `).join("");
  }

  function renderSpread() {
    const book = books[bookIndex];
    const spreads = spreadsFor(book);
    spreadIndex = Math.max(0, Math.min(spreadIndex, spreads.length - 1));
    const [left, right] = spreads[spreadIndex];
    els.kicker.textContent = book.kicker;
    els.title.textContent = book.title;
    els.title.toggleAttribute("hidden", !book.title);
    els.left.innerHTML = renderPage(left, "left");
    els.right.innerHTML = renderPage(right, "right");
    els.progress.textContent = `Spread ${spreadIndex + 1} of ${spreads.length}`;
    els.status.textContent = `${titleLine(book)}, spread ${spreadIndex + 1} of ${spreads.length}`;
  }

  function showSelection() {
    els.viewer.hidden = true;
    els.selection.hidden = false;
  }

  function openBook(index) {
    bookIndex = index;
    spreadIndex = 0;
    els.selection.hidden = true;
    els.viewer.hidden = false;
    renderSpread();
  }

  function flip(direction, afterTurn) {
    if (isTurning || els.viewer.hidden) return;
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
    if (spreadIndex >= spreads.length - 1) return;
    flip("forward", () => {
      spreadIndex += 1;
    });
  }

  function previousSpread() {
    if (spreadIndex <= 0) return;
    flip("backward", () => {
      spreadIndex -= 1;
    });
  }

  bookReader.addEventListener("click", (event) => {
    const select = event.target.closest("[data-select-book]");
    if (select) openBook(Number(select.dataset.selectBook));
    if (event.target.closest("[data-repeat-book]")) openBook(bookIndex);
    if (event.target.closest("[data-next-book]")) {
      const nextBook = books[bookIndex].nextBook;
      if (!nextBook) {
        showSelection();
        return;
      }
      const nextIndex = books.findIndex((book) => book.id === nextBook);
      if (nextIndex >= 0) openBook(nextIndex);
    }
  });

  els.prev.forEach((button) => button.addEventListener("click", previousSpread));
  els.next.forEach((button) => button.addEventListener("click", nextSpread));
  els.returnButtons.forEach((button) => button.addEventListener("click", showSelection));

  document.addEventListener("keydown", (event) => {
    if (els.viewer.hidden) return;
    if (event.key === "ArrowRight") nextSpread();
    if (event.key === "ArrowLeft") previousSpread();
    if (event.key === "Escape") showSelection();
  });

  renderSelection();
  showSelection();
}
