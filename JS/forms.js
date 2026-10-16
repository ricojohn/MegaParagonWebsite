/**
 * Forms.js - Handle form submission with data sanitization
 * Sends to the PHP proxy, which loads .env and authenticates with the portal.
 * Secret API keys must never be included in browser JavaScript.
 */

function sanitizeInput(input) {
  if (typeof input !== "string") return input;
  // Remove HTML tags and trim whitespace
  return input.replace(/<[^>]*>/g, "").trim();
}

let recaptchaApiPromise;
const recaptchaWidgets = new WeakMap();

function loadRecaptcha() {
  if (window.grecaptcha && typeof window.grecaptcha.ready === "function") {
    return Promise.resolve(window.grecaptcha);
  }

  if (!recaptchaApiPromise) {
    recaptchaApiPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src =
        "https://www.google.com/recaptcha/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (
          !window.grecaptcha ||
          typeof window.grecaptcha.ready !== "function"
        ) {
          recaptchaApiPromise = null;
          reject(new Error("Google reCAPTCHA did not initialize."));
          return;
        }
        window.grecaptcha.ready(() => resolve(window.grecaptcha));
      };
      script.onerror = () => {
        recaptchaApiPromise = null;
        reject(new Error("Google reCAPTCHA could not be loaded."));
      };
      document.head.appendChild(script);
    });
  }

  return recaptchaApiPromise;
}

function getRecaptchaToken(form) {
  const container = form.querySelector("[data-recaptcha]");
  const sitekey = container && container.dataset.sitekey;
  if (!sitekey) {
    return Promise.reject(new Error("The reCAPTCHA site key is not configured."));
  }

  return loadRecaptcha().then((grecaptcha) => {
    let state = recaptchaWidgets.get(form);
    if (!state) {
      state = { widgetId: null, pending: null };
      state.widgetId = grecaptcha.render(container, {
        sitekey,
        size: "invisible",
        callback: (token) => {
          if (!state.pending) return;
          state.pending.resolve(token);
          state.pending = null;
        },
        "error-callback": () => {
          if (!state.pending) return;
          state.pending.reject(new Error("Google reCAPTCHA verification failed."));
          state.pending = null;
        },
        "expired-callback": () => {
          if (!state.pending) return;
          state.pending.reject(new Error("Google reCAPTCHA expired. Please try again."));
          state.pending = null;
        },
      });
      recaptchaWidgets.set(form, state);
    }

    return new Promise((resolve, reject) => {
      state.pending = { resolve, reject };
      try {
        grecaptcha.reset(state.widgetId);
        grecaptcha.execute(state.widgetId);
      } catch (error) {
        state.pending = null;
        reject(error);
      }
    });
  });
}

function setupForm(form) {
  const formType = form.dataset.formType || form.id.replace("Form", "");
  const messageDiv = form.querySelector(".form-message");
  const submitButton = form.querySelector("[type=submit]");

  // Determine portal endpoint based on form type
  const endpoints = {
    join: "/api/join.php",
    inquiry: "/api/inquiry.php",
  };

  const endpoint = endpoints[formType];
  if (!endpoint) {
    console.error("Unknown form type:", formType);
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    messageDiv.classList.remove("success", "error");
    messageDiv.textContent = "Sending...";
    messageDiv.classList.add("is-visible");
    submitButton.disabled = true;

    try {
      const recaptchaToken = await getRecaptchaToken(form);
      let payload;
      const isJoinForm = formType === "join";

      if (isJoinForm) {
        // Handle multipart form data (file uploads for join-team)
        const formData = new FormData(form);
        payload = new FormData();

        // Map form fields to API field names
        for (let [key, value] of formData.entries()) {
          if (key === "name") {
            payload.append("full_name", sanitizeInput(String(value)));
          } else {
            payload.append(
              key,
              value instanceof File ? value : sanitizeInput(String(value)),
            );
          }
        }
        payload.append("g-recaptcha-response", recaptchaToken);
      } else {
        // Handle JSON payload for inquiries (map name -> full_name)
        const formData = new FormData(form);
        payload = {};
        for (let [key, value] of formData.entries()) {
          if (key === "name") {
            payload["full_name"] = sanitizeInput(String(value));
          } else {
            payload[key] = sanitizeInput(String(value));
          }
        }
        payload["g-recaptcha-response"] = recaptchaToken;
      }

      // The PHP proxy adds X-API-Key; the browser sends only public form data.
      const headers = { Accept: "application/json" };

      // Add Content-Type only for JSON payloads
      if (!isJoinForm) {
        headers["Content-Type"] = "application/json";
      }

      const response = await fetch(endpoint, {
        method: "POST",
        body: isJoinForm ? payload : JSON.stringify(payload),
        headers: headers,
      });

      const responseText = await response.text();
      let data = {};

      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch {
          throw new Error("The form endpoint returned an unexpected response. Check that the PHP API files are deployed.");
        }
      }

      if (!response.ok) {
        throw new Error(data.error || data.message || "Submission failed");
      }

      messageDiv.textContent =
        data.message || "Thank you! We will get back to you soon.";
      messageDiv.classList.add("success");

      // Fire Meta Pixel event on success
      if (typeof window.fbq === "function") {
        window.fbq("track", "Lead", {
          content_name: formType === "join" ? "Recruitment" : "Sales",
        });
      }

      // Reset form after delay
      setTimeout(() => {
        form.reset();
        messageDiv.textContent = "";
        messageDiv.classList.remove("is-visible", "success");
      }, 2000);
    } catch (error) {
      console.error(`${formType} form submission failed:`, error);
      messageDiv.textContent =
        "We could not submit your form right now. Please try again later.";
      messageDiv.classList.add("error");
    } finally {
      submitButton.disabled = false;
    }
  });
}

// Initialize all forms with data-form-type attribute
document.querySelectorAll("form[data-form-type]").forEach(setupForm);
