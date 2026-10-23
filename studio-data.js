// Studio content. Add to any list and the pages update.
const studioData = {
  quotes: [
    { text: "The unexamined life is not worth living.", by: "Socrates" },
    { text: "What we think, we become.", by: "Buddha" },
    { text: "The only way to do great work is to love what you do.", by: "Steve Jobs" },
    { text: "Stay hungry, stay foolish.", by: "Steve Jobs" }
  ],

  // kind: "film" or "series". rating: IMDb score as a number, or leave it out and use ratingNote.
  // poster (optional): path to a poster image, e.g. "studio/posters/interstellar.jpg".
  //   Without it, the page draws a generated poster instead.
  movies: [
    { title: "Stranger Things", kind: "series", credit: "Created by the Duffer Brothers", rating: 8.6,
      note: "A love letter to 80s sci-fi and horror — a small Indiana town, a missing kid, and a growing tangle of government secrets and things that shouldn't exist." },
    { title: "Interstellar", kind: "film", credit: "Directed by Christopher Nolan", rating: 8.7,
      note: "A dying Earth, a father-daughter bond stretched across galaxies, and one of the most emotionally devastating uses of time dilation in film." },
    { title: "Game of Thrones", kind: "series", credit: "Created by David Benioff & D. B. Weiss", rating: 9.2,
      note: "Power, politics, and war across the Seven Kingdoms — ruthless in how it treats its characters, and unforgettable because of it." },
    { title: "Inception", kind: "film", credit: "Directed by Christopher Nolan", rating: 8.8,
      note: "A heist movie set inside dreams within dreams. Endlessly rewatchable, and the kind of film that rewards paying close attention to every detail." },
    { title: "The Odyssey", kind: "film", credit: "Directed by Christopher Nolan", ratingNote: "IMDb Top 250 (2026)",
      note: "Nolan's adaptation of Homer's epic, following Odysseus's long, perilous journey home after the Trojan War. Shot entirely on IMAX 70mm — one of his most acclaimed films yet." },
    { title: "Friends", kind: "series", credit: "Created by David Crane & Marta Kauffman", rating: 8.9,
      note: "Six friends navigating life, love, and coffee shops in Manhattan. Pure comfort TV — a show I can rewatch endlessly without ever getting tired of it." },
    { title: "The Dark Knight", kind: "film", credit: "Directed by Christopher Nolan", rating: 9.0,
      note: "Less a superhero movie than a crime saga about order versus chaos. Heath Ledger's Joker is one of the greatest villain performances ever put on screen." },
    { title: "Fight Club", kind: "film", credit: "Directed by David Fincher", rating: 8.8,
      note: "A sharp, unsettling look at masculinity, consumerism, and identity. The kind of movie that hits differently on a second watch once you know where it's going." }
  ],

  rules: [
    { text: "Treat others the way you want to be treated." }
  ],

  // Groups of tools. Each item: name, what (one line), why (optional).
  arsenal: [
    { group: "Hardware", items: [
      { name: "Dell Inspiron 3520", what: "Laptop", why: "My main laptop for studying, coding, research, and building projects." }
    ] },
    { group: "Shipping the web", items: [
      { name: "GitHub", what: "Code & history", why: "Every page of this site lives in a repository, so any change can be rolled back." },
      { name: "Vercel", what: "Hosting", why: "Deploys this site the moment I push to main." }
    ] }
  ]
};
