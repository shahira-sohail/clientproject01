# prompts.md

# Prompts Used During Development

This document contains the main questions asked while developing the **Independent Bookstore Events Page**.


## 1. What are the edge cases and how should they be handled?

### Prompt

> Explain the edge cases that should be handled for this project using my current code as reference.

### Answer Summary

The application handles several important edge cases:

### Empty State

If no events match the search or filter:

- Display a friendly message such as **"No events found"**
- Do not leave the page blank.

Implementation:

```javascript
if (filtered.length === 0) {
    renderEmpty();
    return;
}

### Loading State

During asynchronous operations (loading events or saving a new event):

- Show a loading spinner
- Disable the submit button while saving

Implementation:

```javascript
isLoading = true;
render();
```

and

```javascript
submitEventBtn.disabled = true;
```

### Network Failure

If the simulated request fails:

- Show an error message
- Display a Retry button

Implementation:

```javascript
catch (err) {
    hasLoadError = true;
    render();
}

### Invalid Form Submission

Prevent submission when required fields are missing.

Implementation:

```javascript
if (!values) return;
```

Each invalid field:

- gets a red border
- displays an error message
- receives keyboard focus

### Connection Lost While Saving

If saving fails:

- Preserve the entered data
- Inform the user
- Allow them to retry

Implementation:

```javascript
formStatus.textContent =
"Connection issue — your entry was not lost. Try saving again.";

## 2. What is Telemetry Simulation and how is it implemented?

### Prompt

> What is telemetry simulation? Explain it using my project.

### Answer Summary

Telemetry means recording important user actions.

Instead of sending data to a real analytics platform, this project simulates analytics by writing messages to the browser console.

Implementation:

```javascript
function logAnalytics(action) {
    console.log(
        "[Analytics] User interacted with Independent Bookstore Events Page",
        { action }
    );
}

Examples:

```javascript
logAnalytics("search_events");
logAnalytics("filter_events_by_category");
logAnalytics("add_event");
logAnalytics("retry_load_events");
```

## 3. How do I save events using Local Storage?

### Prompt

> Show me how to save and load events using localStorage.

### Answer Summary

Store the events array inside the browser.

Create a storage key:

```javascript
const STORAGE_KEY = "bookstore-events";
```

Save events:

```javascript
function saveEventsToStorage() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(events)
    );
}

Load events:

```javascript
const savedEvents =
    localStorage.getItem(STORAGE_KEY);

if (savedEvents) {
    events = JSON.parse(savedEvents);
}

After adding an event:

```javascript
events.push(newEvent);
saveEventsToStorage();
```

This keeps events available after refreshing the page.

## 4. What are ARIA labels and Live Regions?

### Prompt

> What are ARIA labels and how do I use live regions for accessibility?

### Answer Summary

ARIA improves accessibility for screen reader users.

### ARIA Labels

They provide meaningful names for interactive elements.

Example:

```html
<button
    aria-label="Add event">
    Add Event
</button>
```

Example from the project:

```html
<button
    aria-expanded="false"
    aria-controls="add-event-panel">

### Live Regions

Live regions automatically announce updates.

Example:

```html
<div
    id="events-status"
    aria-live="polite">
</div>

JavaScript updates:

```javascript
eventsStatus.textContent =
"Showing 4 events.";
```

The screen reader announces the update without moving keyboard focus.

## 5. How do I sanitize user input against basic XSS attacks?

### Prompt

> Explain input sanitization against basic XSS attacks using my project.

### Answer Summary

Users may enter malicious HTML such as:

```html
<script>alert("Hack")</script>
```

Instead of storing it directly, convert dangerous characters into harmless text.

Implementation:

```javascript
function sanitizeText(rawValue) {
    return String(rawValue)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
        .trim();
}
```

Every form value is sanitized before being stored.

Additionally, user data is displayed using:

```javascript
textContent
```

instead of

```javascript
innerHTML
```

This provides another layer of protection against XSS.

## 6. How do I add a loading indicator for asynchronous operations?

### Prompt

> How should I implement a loading indicator during asynchronous operations?

### Answer Summary

Before starting an asynchronous request:

```javascript
isLoading = true;
render();
```

The loading UI displays:

- Spinner
- Loading message
- Skeleton cards

Implementation:

```javascript
renderLoading();
```

CSS Spinner:

```css
.spinner {
    width: 32px;
    height: 32px;
    border: 3px solid var(--color-border);
    border-top-color: var(--color-ink);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}
```

After the request finishes:

```javascript
isLoading = false;
render();
```

The spinner disappears and the events are displayed.
## Summary

During the development of this project, the following topics were explored:

- Edge case handling
- Telemetry simulation
- Local Storage persistence
- Accessibility using ARIA labels and live regions
- Input sanitization against XSS
- Loading indicators for asynchronous operations

These concepts improved the application's usability, accessibility, reliability, and overall user experience.
