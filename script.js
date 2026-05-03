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

const bookingModal = document.getElementById("booking-modal");
const bookMeButton = document.getElementById("book-me-btn");
const bookingForm = document.getElementById("booking-form");
const bookingStatus = document.getElementById("booking-form-status");
const bookingSubmitButton = document.getElementById("booking-submit-btn");

let previousActiveElement = null;

function setBookingStatus(message, type = "") {
  if (!bookingStatus) return;

  bookingStatus.textContent = message;
  bookingStatus.classList.remove("success", "error");
  if (type) {
    bookingStatus.classList.add(type);
  }
}

function openBookingModal() {
  if (!bookingModal) return;

  previousActiveElement = document.activeElement;
  bookingModal.classList.add("is-open");
  bookingModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  setBookingStatus("");

  const firstField = bookingModal.querySelector("#booking-name");
  if (firstField) {
    firstField.focus();
  }
}

function closeBookingModal() {
  if (!bookingModal) return;

  bookingModal.classList.remove("is-open");
  bookingModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");

  if (previousActiveElement && typeof previousActiveElement.focus === "function") {
    previousActiveElement.focus();
  }
}

if (bookMeButton) {
  bookMeButton.addEventListener("click", openBookingModal);
}

if (bookingModal) {
  bookingModal.addEventListener("click", (event) => {
    const closeTrigger = event.target.closest("[data-modal-close]");
    if (closeTrigger) {
      closeBookingModal();
    }
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && bookingModal && bookingModal.classList.contains("is-open")) {
    closeBookingModal();
  }
});

if (bookingForm) {
  bookingForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!bookingSubmitButton) return;

    bookingSubmitButton.disabled = true;
    bookingSubmitButton.textContent = "Sending...";
    setBookingStatus("Sending your request...");

    try {
      const formData = new FormData(bookingForm);
      const response = await fetch(bookingForm.action, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Booking form request failed: ${response.status}`);
      }

      setBookingStatus("Thanks! Your booking request was sent successfully.", "success");
      bookingForm.reset();

      setTimeout(() => {
        closeBookingModal();
      }, 1200);
    } catch (error) {
      console.error("Unable to send booking request.", error);
      setBookingStatus(
        "Sorry, there was a problem sending your request. Please try again, or email me directly at josborn777@gmail.com.",
        "error"
      );
    } finally {
      bookingSubmitButton.disabled = false;
      bookingSubmitButton.textContent = "Send Request";
    }
  });
}

// Set footer year automatically
const yearElement = document.getElementById("year");
if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}
