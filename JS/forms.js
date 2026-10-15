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

function showFormToast(type, message) {
  let toast = document.getElementById("formToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "formToast";
    toast.className = "form-toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    document.body.append(toast);
  }

  toast.className = `form-toast ${type}`;
  toast.replaceChildren();
  const icon = document.createElement("i");
  icon.className = `fa-solid ${type === "success" ? "fa-circle-check" : "fa-circle-exclamation"}`;
  icon.setAttribute("aria-hidden", "true");
  const text = document.createElement("span");
  text.textContent = message;
  toast.append(icon, text);
  requestAnimationFrame(() => toast.classList.add("is-visible"));
  window.clearTimeout(toast.dismissTimer);
  toast.dismissTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 5000);
}

function setupForm(form) {
  const formType = form.dataset.formType || form.id.replace("Form", "");
  const submitButton = form.querySelector("[type=submit]");
  const originalButtonContent = submitButton.innerHTML;
  const phoneInput = form.querySelector('input[name="phone"]');

  if (phoneInput) {
    phoneInput.addEventListener("input", () => {
      phoneInput.value = phoneInput.value.replace(/\D/g, "");
    });
  }

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
    submitButton.disabled = true;

    if (!form.querySelector('[name="cf-turnstile-response"]')?.value) {
      showFormToast("error", "Please complete the verification first.");
      submitButton.disabled = false;
      return;
    }

    try {
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
          throw new Error(
            "The form endpoint returned an unexpected response. Check that the PHP API files are deployed.",
          );
        }
      }

      if (!response.ok) {
        const error = new Error(data.error || data.message || "Submission failed");
        error.status = response.status;
        throw error;
      }

      submitButton.classList.add("is-sent");
      submitButton.innerHTML =
        '<i class="fa-solid fa-circle-check" aria-hidden="true"></i> Sent';
      showFormToast(
        "success",
        data.message || "Your message was sent successfully.",
      );

      // Fire Meta Pixel event on success
      if (typeof window.fbq === "function") {
        window.fbq("track", "Lead", {
          content_name: formType === "join" ? "Recruitment" : "Sales",
        });
      }

      // Reset form after delay
      setTimeout(() => {
        form.reset();
        submitButton.classList.remove("is-sent");
        submitButton.innerHTML = originalButtonContent;
      }, 2000);
    } catch (error) {
      console.error(`${formType} form submission failed:`, error);
      showFormToast(
        "error",
        error.status === 429
          ? "Too many attempts. Please wait a few minutes and try again."
          : "We could not submit your form. Please try again.",
      );
    } finally {
      submitButton.disabled = false;
      if (window.turnstile) {
        window.turnstile.reset(form.querySelector(".cf-turnstile"));
      }
    }
  });
}

// Initialize all forms with data-form-type attribute
document.querySelectorAll("form[data-form-type]").forEach(setupForm);
