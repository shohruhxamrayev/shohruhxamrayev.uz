document.addEventListener('DOMContentLoaded', function () {
  var grid = document.getElementById('booksGrid');
  var list = document.getElementById('booksList');
  if (!grid || typeof booksData === 'undefined') return;

  function statusLine(book) {
    if (book.status === 'reading') return 'Currently Reading';
    return 'Read: ' + book.readDate + ' &bull; Rating: ' + book.rating;
  }

  function renderGrid() {
    grid.innerHTML = '';
    booksData.forEach(function (book) {
      var card = document.createElement('a');
      card.className = 'book-card';
      card.href = 'books/' + book.slug + '.html';
      card.innerHTML =
        '<img class="book-card-cover" src="' + book.cover + '" alt="' + book.title + ' cover">' +
        '<div class="book-card-title">' + book.title + '</div>' +
        '<div class="book-card-author">' + book.author + '</div>';
      grid.appendChild(card);
    });
  }

  function renderList() {
    if (!list) return;
    list.innerHTML = '';
    booksData.forEach(function (book) {
      var entry = document.createElement('div');
      entry.className = 'entry cover-entry';
      entry.innerHTML =
        '<img src="' + book.cover + '" alt="' + book.title + ' cover">' +
        '<div class="details">' +
          '<h3><a href="books/' + book.slug + '.html">' + book.title + '</a></h3>' +
          '<p class="byline">' + book.author + '</p>' +
          '<p class="stats">' + statusLine(book) + '</p>' +
          '<p class="note">' + book.summary + '</p>' +
        '</div>';
      list.appendChild(entry);
    });
  }

  function enableDragScroll() {
    var isDown = false;
    var startX, scrollLeft, moved;

    grid.addEventListener('mousedown', function (e) {
      isDown = true;
      moved = false;
      grid.classList.add('dragging');
      startX = e.pageX - grid.offsetLeft;
      scrollLeft = grid.scrollLeft;
    });

    window.addEventListener('mouseup', function () {
      isDown = false;
      grid.classList.remove('dragging');
    });

    grid.addEventListener('mouseleave', function () {
      isDown = false;
      grid.classList.remove('dragging');
    });

    grid.addEventListener('mousemove', function (e) {
      if (!isDown) return;
      e.preventDefault();
      var x = e.pageX - grid.offsetLeft;
      var walk = x - startX;
      if (Math.abs(walk) > 5) moved = true;
      grid.scrollLeft = scrollLeft - walk;
    });

    grid.addEventListener('click', function (e) {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);
  }

  renderGrid();
  renderList();
  enableDragScroll();
});
