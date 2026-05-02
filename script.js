async function loadShows() {
  try {
    const response = await fetch("shows.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to load shows: ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Unable to load shows data.", error);
    return [];
  }
}

// Find the container in HTML where show cards should go
const showListElement = document.getElementById("show-list");

function createMetaRow(label, value) {
  const row = document.createElement("p");
  row.className = "show-meta";

  if (label) {
    const strong = document.createElement("strong");
    strong.textContent = `${label}: `;
    row.appendChild(strong);
  }
  row.append(value);

  return row;
}

function createShowCard(show) {
  const venue = show.venue || "Venue TBA";
  const format = show.format || "Format TBA";
  const date = show.date || "Date TBA";
  const location = show.location || "Location TBA";

  const card = document.createElement("article");
  card.className = "show-card";

  const title = document.createElement("h3");
  title.textContent = venue;
  card.appendChild(title);

  card.appendChild(createMetaRow(null, date));
  card.appendChild(createMetaRow(null, location));
  card.appendChild(createMetaRow("Notes", format));

  if (show.link) {
    const linkRow = document.createElement("p");
    linkRow.className = "show-meta";

    const link = document.createElement("a");
    link.href = show.link;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = `Event Link for ${venue}`;

    linkRow.appendChild(link);
    card.appendChild(linkRow);
  }

  return card;
}

async function renderShows() {
  if (!showListElement) return;

  const shows = await loadShows();
  const fragment = document.createDocumentFragment();

  shows.forEach((show) => fragment.appendChild(createShowCard(show)));
  showListElement.appendChild(fragment);
}

renderShows();

// Set footer year automatically
const yearElement = document.getElementById("year");
if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}
