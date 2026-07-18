
let events = [];
let isLoading = true;
let hasLoadError = false;

//Local storage

const STORAGE_KEY = 'bookstore-events';

function saveEventsToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

const eventsContainer = document.getElementById('events-container');
const resultsCount = document.getElementById('results-count');
const eventsStatus = document.getElementById('events-status');
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const searchForm = document.getElementById('search-form');

const toggleAddEventBtn = document.getElementById('toggle-add-event');
const addEventPanel = document.getElementById('add-event-panel');
const cancelAddEventBtn = document.getElementById('cancel-add-event');
const eventForm = document.getElementById('event-form');
const submitEventBtn = document.getElementById('submit-event-btn');
const formStatus = document.getElementById('form-status');

const CATEGORY_LABELS = {
  reading: 'Author Reading',
  'book-club': 'Book Club',
  signing: 'Book Signing',
  kids: 'Kids & Family',
  workshop: 'Workshop',
};

const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

function sanitizeText(rawValue) {
  return String(rawValue)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .trim();
}

function logAnalytics(action) {
  console.log('[Analytics] User interacted with Independent Bookstore Events Page', { action });
}

// SIMULATED NETWORK LAYER
// Wraps a Promise in a timeout to mimic a slow 3G connection, and fails
// randomly ~15% of the time to mimic a spotty connection dropping the
// request. Real code would call fetch(); this stands in for that call
// so the UI-facing logic (loading/error/success) can be demonstrated.

function simulateNetworkRequest(payload, { failRate = 0.15, delay = 1100 } = {}) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < failRate) {
        reject(new Error('Network request failed'));
      } else {
        resolve(payload);
      }
    }, delay);
  });
}

const SEED_EVENTS = [
  {
    id: 'evt-1',
    title: 'Local Authors Night: Short Fiction',
    category: 'reading',
    date: '2026-07-24',
    time: '18:30',
    description: 'Three local writers read new short fiction, followed by Q&A.',
  },
  {
    id: 'evt-2',
    title: 'Mystery & Thriller Book Club',
    category: 'book-club',
    date: '2026-07-26',
    time: '17:00',
    description: 'This month: a locked-room mystery. New members welcome.',
  },
  {
    id: 'evt-3',
    title: 'Storytime & Craft Hour',
    category: 'kids',
    date: '2026-07-19',
    time: '10:00',
    description: 'Picture books and a related craft for ages 3-7.',
  },
  {
    id: 'evt-4',
    title: 'Signed Copies: "The Quiet Coast"',
    category: 'signing',
    date: '2026-08-02',
    time: '19:00',
    description: 'Meet the author and get your copy signed at the front table.',
  },
];

// INITIAL LOAD
// Requests the event list, showing a loading state throughout and an
// error state (with retry) if the simulated request fails.

async function loadEvents() {
  isLoading = true;
  hasLoadError = false;
  render();

  try {
    const savedEvents = localStorage.getItem(STORAGE_KEY);

    if (savedEvents) {
    events = JSON.parse(savedEvents);
    isLoading = false;
    render();
    return;
    } 
    
    const data = await simulateNetworkRequest(SEED_EVENTS);
    events = data;
    saveEventsToStorage(); // Save the initial events
    isLoading = false;
    render();

  } catch (err) {
    isLoading = false;
    hasLoadError = true;
    render();
  }
}

// RENDERING
// A single render() function reads current state and redraws the events
// area. Kept declarative: state changes, then render() is called.

function getFilteredEvents() {
  const query = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;

  return events.filter((evt) => {
    const matchesQuery =
      !query ||
      evt.title.toLowerCase().includes(query) ||
      evt.description.toLowerCase().includes(query);
    const matchesCategory = category === 'all' || evt.category === category;
    return matchesQuery && matchesCategory;
  });
}

function formatDateParts(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number);
  return { day: String(day).padStart(2, '0'), month: MONTHS[month - 1] || '' };
}

function formatTime(isoTime) {
  const [hourStr, minute] = isoTime.split(':');
  const hour = Number(hourStr);
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = ((hour + 11) % 12) + 1;
  return `${hour12}:${minute} ${period}`;
}

function buildEventCard(evt) {
  const { day, month } = formatDateParts(evt.date);

  const card = document.createElement('article');
  card.className = 'event-card';
  card.setAttribute('aria-label', evt.title);

  const dateBlock = document.createElement('div');
  dateBlock.className = 'event-card-date';
  dateBlock.innerHTML = `<span class="day">${day}</span><span class="month">${month}</span>`;

  const body = document.createElement('div');
  body.className = 'event-card-body';

  // textContent (not innerHTML) is used for every user-authored field, so
  // even already-sanitized text gets a second layer of protection here.
  const categoryEl = document.createElement('p');
  categoryEl.className = 'event-card-category';
  categoryEl.textContent = CATEGORY_LABELS[evt.category] || evt.category;

  const titleEl = document.createElement('h3');
  titleEl.className = 'event-card-title';
  titleEl.textContent = evt.title;

  const timeEl = document.createElement('p');
  timeEl.className = 'event-card-time';
  timeEl.textContent = formatTime(evt.time);

  const descEl = document.createElement('p');
  descEl.className = 'event-card-description';
  descEl.textContent = evt.description;

  body.append(categoryEl, titleEl, timeEl, descEl);
  card.append(dateBlock, body);
  return card;
}

function renderLoading() {
  eventsContainer.innerHTML = '';
  const panel = document.createElement('div');
  panel.className = 'state-panel';
  panel.innerHTML = `
    <div class="spinner" role="presentation"></div>
    <h3>Loading events&hellip;</h3>
    <p>This can take a moment on a slow connection.</p>
  `;
  eventsContainer.appendChild(panel);

  // A few skeleton placeholders to reduce layout shift once real cards arrive.
  for (let i = 0; i < 3; i++) {
    const skeleton = document.createElement('div');
    skeleton.className = 'skeleton-card';
    eventsContainer.appendChild(skeleton);
  }

  resultsCount.textContent = '';
  eventsStatus.textContent = 'Loading events.';
}

function renderError() {
  eventsContainer.innerHTML = '';
  const panel = document.createElement('div');
  panel.className = 'state-panel';
  panel.innerHTML = `
    <h3>Couldn't load events</h3>
    <p>Your connection may have dropped. Check it and try again.</p>
  `;

  const retryBtn = document.createElement('button');
  retryBtn.type = 'button';
  retryBtn.className = 'btn btn-primary';
  retryBtn.textContent = 'Retry';
  retryBtn.addEventListener('click', () => {
    logAnalytics('retry_load_events');
    loadEvents();
  });

  panel.appendChild(retryBtn);
  eventsContainer.appendChild(panel);

  resultsCount.textContent = '';
  eventsStatus.textContent = 'Events failed to load.';
}

function renderEmpty() {
  eventsContainer.innerHTML = '';
  const panel = document.createElement('div');
  panel.className = 'state-panel';
  panel.innerHTML = `
    <h3>No events found</h3>
    <p>Try a different search term or category.</p>
  `;
  eventsContainer.appendChild(panel);

  resultsCount.textContent = '0 events';
  eventsStatus.textContent = 'No events found.';
}

function renderEvents(list) {
  eventsContainer.innerHTML = '';
  const sorted = [...list].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  sorted.forEach((evt) => eventsContainer.appendChild(buildEventCard(evt)));

  resultsCount.textContent = `${list.length} event${list.length === 1 ? '' : 's'}`;
  eventsStatus.textContent = `Showing ${list.length} event${list.length === 1 ? '' : 's'}.`;
}

function render() {
  if (isLoading) {
    renderLoading();
    return;
  }
  if (hasLoadError) {
    renderError();
    return;
  }
  const filtered = getFilteredEvents();
  if (filtered.length === 0) {
    renderEmpty();
    return;
  }
  renderEvents(filtered);
}

// SEARCH & FILTER
// Re-renders instantly on every keystroke/selection — no page reload,
// satisfying "respond immediately to my inputs".

searchInput.addEventListener('input', () => {
  render();
});

categoryFilter.addEventListener('change', () => {
  logAnalytics('filter_events_by_category');
  render();
});

// Prevent the native form submission (which would reload the page) since
// filtering already happens live via the 'input' listener above.
searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  logAnalytics('search_events');
  render();
});

// ADD EVENT PANEL: show / hide
// aria-expanded is kept in sync so assistive tech announces the toggle
// state correctly, and the panel is fully keyboard reachable.

function openAddEventPanel() {
  addEventPanel.hidden = false;
  toggleAddEventBtn.setAttribute('aria-expanded', 'true');
  document.getElementById('event-title').focus();
}

function closeAddEventPanel() {
  addEventPanel.hidden = true;
  toggleAddEventBtn.setAttribute('aria-expanded', 'false');
  toggleAddEventBtn.focus();
}

toggleAddEventBtn.addEventListener('click', () => {
  const isOpen = toggleAddEventBtn.getAttribute('aria-expanded') === 'true';
  if (isOpen) {
    closeAddEventPanel();
  } else {
    openAddEventPanel();
  }
});

cancelAddEventBtn.addEventListener('click', () => {
  eventForm.reset();
  clearAllFieldErrors();
  closeAddEventPanel();
});

// FORM VALIDATION
// Each required field is checked individually so its own field can be
// flagged in isolation, per "highlight the offending fields".

const FIELDS = ['title', 'category', 'date', 'time', 'description'];

function setFieldError(fieldName, message) {
  const input = document.getElementById(`event-${fieldName}`);
  const errorEl = document.getElementById(`event-${fieldName}-error`);
  input.closest('.field').classList.add('is-invalid');
  input.setAttribute('aria-invalid', 'true');
  errorEl.textContent = message;
}

function clearFieldError(fieldName) {
  const input = document.getElementById(`event-${fieldName}`);
  const errorEl = document.getElementById(`event-${fieldName}-error`);
  input.closest('.field').classList.remove('is-invalid');
  input.removeAttribute('aria-invalid');
  errorEl.textContent = '';
}

function clearAllFieldErrors() {
  FIELDS.forEach(clearFieldError);
  formStatus.textContent = '';
  formStatus.removeAttribute('data-state');
}

// Returns sanitized form values if every field is valid, otherwise
// flags the invalid fields in red and returns null.
function validateAndCollectForm() {
  clearAllFieldErrors();
  let firstInvalidField = null;
  const values = {};

  FIELDS.forEach((fieldName) => {
    const input = document.getElementById(`event-${fieldName}`);
    const rawValue = input.value;

    if (!rawValue || !rawValue.trim()) {
      setFieldError(fieldName, 'This field is required.');
      if (!firstInvalidField) firstInvalidField = input;
      return;
    }

    values[fieldName] = sanitizeText(rawValue);
  });

  if (firstInvalidField) {
    firstInvalidField.focus();
    formStatus.dataset.state = 'error';
    formStatus.textContent = 'Please fix the highlighted fields before saving.';
    return null;
  }

  return values;
}

// FORM SUBMISSION
// Validates, then simulates a network write with a loading state on the
// submit button. On failure the form data is preserved (nothing is lost)
// and the user can simply try again.

eventForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const values = validateAndCollectForm();
  if (!values) return;

  submitEventBtn.disabled = true;
  submitEventBtn.querySelector('.btn-label').textContent = 'Saving\u2026';
  formStatus.removeAttribute('data-state');
  formStatus.textContent = 'Saving event\u2026';

  try {
    const newEvent = { id: `evt-${Date.now()}`, ...values };
    await simulateNetworkRequest(newEvent);

    events.push(newEvent);
    saveEventsToStorage();
    logAnalytics('add_event');

    formStatus.dataset.state = 'success';
    formStatus.textContent = `"${newEvent.title}" was added.`;
    eventForm.reset();
    clearAllFieldErrors();
    render();

    setTimeout(closeAddEventPanel, 900);
  } catch (err) {
    formStatus.dataset.state = 'error';
    formStatus.textContent = 'Connection issue \u2014 your entry was not lost. Try saving again.';
  } finally {
    submitEventBtn.disabled = false;
    submitEventBtn.querySelector('.btn-label').textContent = 'Save event';
  }
});
loadEvents();