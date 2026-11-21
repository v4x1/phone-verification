/**
 * English Club — membership registration
 *
 * ╔════════════════════════════════════════════════════════════════════════╗
 * ║  CONFIGURATION                                                          ║
 * ║                                                                         ║
 * ║  Paste your Formspree endpoint below, replacing YOUR_FORM_ID.           ║
 * ║  Example: "https://formspree.io/f/abcdwxyz"                             ║
 * ║                                                                         ║
 * ║  Formspree endpoints are public form identifiers, not secret keys —      ║
 * ║  no private API key is ever placed in this frontend code.               ║
 * ╚════════════════════════════════════════════════════════════════════════╝
 */
const FORMSPREE_ENDPOINT = "https://formspree.io/f/YOUR_FORM_ID";

(function () {
  "use strict";

  /* ── Elements ──────────────────────────────────────────────────────────── */

  const form = document.getElementById("registration-form");
  const input = document.getElementById("phone");
  const field = document.getElementById("phone-field");
  const errorBox = document.getElementById("phone-error");
  const errorText = document.getElementById("phone-error-text");
  const submitError = document.getElementById("submit-error");
  const submitErrorText = document.getElementById("submit-error-text");
  const submitButton = document.getElementById("submit-button");
  const submitLabel = document.getElementById("submit-label");
  const formStatus = document.getElementById("form-status");
  const intro = document.getElementById("intro");
  const successPanel = document.getElementById("success-panel");
  const successTitle = document.getElementById("success-title");

  /* ── Constants ─────────────────────────────────────────────────────────── */

  const REQUIRED_DIGITS = 8;
  const REQUEST_TIMEOUT_MS = 20000;
  const DEFAULT_LABEL = submitLabel.textContent;

  const MESSAGES = {
    empty: "Please enter your phone number.",
    nonDigits: "Please use digits only — letters and symbols are not allowed.",
    tooShort: "Your phone number must be exactly 8 digits.",
    tooLong: "That number is too long. Please enter exactly 8 digits.",
    notConfigured:
      "Registration isn’t available yet. Please contact the club administration.",
    network:
      "We couldn’t submit your registration. Please check your connection and try again.",
    server:
      "Something went wrong on our side. Please try again in a moment.",
    timeout: "The request took too long. Please try again.",
  };

  let isSubmitting = false;
  let errorVisible = false;

  /* ── Helpers ───────────────────────────────────────────────────────────── */

  /** Keep digits only; tolerate a country code pasted along with the number. */
  function toNationalDigits(raw) {
    let digits = raw.replace(/\D/g, "");
    if (digits.length === 11 && digits.indexOf("216") === 0) digits = digits.slice(3);
    if (/^00216/.test(digits) && digits.length === 13) digits = digits.slice(5);
    return digits;
  }

  /** Group as XX XXX XXX; anything beyond 8 digits stays visible so it can be corrected. */
  function formatPhone(digits) {
    const parts = [digits.slice(0, 2), digits.slice(2, 5), digits.slice(5, 8)];
    if (digits.length > REQUIRED_DIGITS) parts.push(digits.slice(8));
    return parts.filter(Boolean).join(" ");
  }

  /** Caret position in the formatted value after a given number of digits. */
  function caretForDigitCount(formatted, digitCount) {
    if (digitCount <= 0) return 0;
    let seen = 0;
    for (let i = 0; i < formatted.length; i += 1) {
      if (/\d/.test(formatted[i])) {
        seen += 1;
        if (seen === digitCount) return i + 1;
      }
    }
    return formatted.length;
  }

  function setPhoneError(message) {
    errorText.textContent = message;
    errorBox.hidden = false;
    field.querySelector(".phone").classList.add("is-error");
    input.setAttribute("aria-invalid", "true");
    errorVisible = true;
  }

  function clearPhoneError() {
    errorBox.hidden = true;
    errorText.textContent = "";
    field.querySelector(".phone").classList.remove("is-error");
    input.removeAttribute("aria-invalid");
    errorVisible = false;
  }

  function showSubmitError(message) {
    submitErrorText.textContent = message;
    submitError.hidden = false;
  }

  function clearSubmitError() {
    submitError.hidden = true;
    submitErrorText.textContent = "";
  }

  /** Validate the current input. Returns an error message, or "" when valid. */
  function getValidationMessage(rawValue) {
    const raw = rawValue == null ? input.value : rawValue;
    if (/[^\d\s+]/.test(raw)) return MESSAGES.nonDigits;

    const digits = toNationalDigits(raw);
    if (digits.length === 0) return MESSAGES.empty;
    if (digits.length < REQUIRED_DIGITS) return MESSAGES.tooShort;
    if (digits.length > REQUIRED_DIGITS) return MESSAGES.tooLong;
    return "";
  }

  function setLoading(isLoading) {
    isSubmitting = isLoading;
    submitButton.disabled = isLoading;
    submitButton.classList.toggle("is-loading", isLoading);
    submitButton.setAttribute("aria-busy", String(isLoading));
    input.readOnly = isLoading;
    submitLabel.textContent = isLoading ? "Submitting…" : DEFAULT_LABEL;
    if (isLoading) formStatus.textContent = "Submitting your registration…";
  }

  /* ── Input behaviour ───────────────────────────────────────────────────── */

  input.addEventListener("input", function (event) {
    if (isSubmitting) return;

    const raw = input.value;
    const caret = input.selectionStart == null ? raw.length : input.selectionStart;
    const digitsBeforeCaret = raw.slice(0, caret).replace(/\D/g, "").length;
    const hadInvalidChars = /[^\d\s]/.test(raw);
    const digits = toNationalDigits(raw);
    const formatted = formatPhone(digits);

    if (formatted !== raw) {
      input.value = formatted;
      const nextCaret = caretForDigitCount(formatted, digitsBeforeCaret);
      try {
        input.setSelectionRange(nextCaret, nextCaret);
      } catch (err) {
        /* Some browsers reject selection changes on tel inputs; harmless. */
      }
    }

    clearSubmitError();

    if (event.isComposing) return;

    if (hadInvalidChars) {
      setPhoneError(MESSAGES.nonDigits);
      return;
    }

    if (errorVisible) {
      const message = getValidationMessage();
      if (message) setPhoneError(message);
      else clearPhoneError();
    }
  });

  input.addEventListener("blur", function () {
    if (isSubmitting) return;
    if (input.value.trim() === "" && !errorVisible) return;
    const message = getValidationMessage();
    if (message) setPhoneError(message);
    else clearPhoneError();
  });

  /* ── Submission ────────────────────────────────────────────────────────── */

  function isEndpointConfigured() {
    return (
      typeof FORMSPREE_ENDPOINT === "string" &&
      /^https:\/\/formspree\.io\/f\/[A-Za-z0-9]+$/.test(FORMSPREE_ENDPOINT) &&
      FORMSPREE_ENDPOINT.indexOf("YOUR_FORM_ID") === -1
    );
  }

  /** Send the number to Formspree. Resolves on success, rejects otherwise. */
  async function sendRegistration(phoneNumber) {
    const controller = new AbortController();
    const timer = setTimeout(function () {
      controller.abort();
    }, REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ phone_number: phoneNumber }),
        signal: controller.signal,
      });

      if (response.ok) return;

      let detail = "";
      try {
        const data = await response.json();
        detail = data && data.error ? data.error : "";
      } catch (err) {
        /* Non-JSON error response; fall back to a generic message. */
      }

      const error = new Error(detail || "Request failed with status " + response.status);
      error.status = response.status;
      throw error;
    } catch (err) {
      if (err.name === "AbortError") {
        const timeout = new Error("Request timed out");
        timeout.isTimeout = true;
        throw timeout;
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  function showSuccess() {
    clearPhoneError();
    clearSubmitError();
    intro.hidden = true;
    form.hidden = true;
    successPanel.hidden = false;
    formStatus.textContent =
      "Your registration has been submitted successfully. Welcome to the English Club.";
    document.title = "Registration complete · English Club";
    if (successTitle && typeof successTitle.focus === "function") {
      successTitle.focus({ preventScroll: true });
    }
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (isSubmitting) return;

    clearSubmitError();

    const message = getValidationMessage();
    if (message) {
      setPhoneError(message);
      input.focus({ preventScroll: true });
      return;
    }

    if (!isEndpointConfigured()) {
      showSubmitError(MESSAGES.notConfigured);
      // Developer-facing hint; never shown as a success state.
      console.error(
        "Formspree endpoint is not configured. Set FORMSPREE_ENDPOINT in app.js to your " +
          'form URL (e.g. "https://formspree.io/f/abcdwxyz").'
      );
      return;
    }

    const digits = toNationalDigits(input.value);
    const phoneNumber = "+216" + digits;

    setLoading(true);
    clearPhoneError();
    clearSubmitError();

    try {
      await sendRegistration(phoneNumber);
      showSuccess();
    } catch (err) {
      if (err && err.isTimeout) {
        showSubmitError(MESSAGES.timeout);
      } else if (err && err.status && err.status >= 500) {
        showSubmitError(MESSAGES.server);
      } else {
        showSubmitError(MESSAGES.network);
      }
      console.error("Registration submission failed:", err);
      formStatus.textContent = "Registration failed. Please try again.";
      setLoading(false);
      input.focus({ preventScroll: true });
    }
  });
})();
