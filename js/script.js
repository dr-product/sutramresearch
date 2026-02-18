const API_ENDPOINTS = [
    "https://mw-backend-green.vercel.app/sutramresearch",
];

function getFeedbackEl() {
    const form = document.getElementById("contactForm");
    let feedback = document.getElementById("contact-feedback");

    if (!feedback && form) {
        feedback = document.createElement("div");
        feedback.id = "contact-feedback";
        feedback.className = "alert mt-3 d-none";
        feedback.setAttribute("role", "alert");
        feedback.setAttribute("aria-live", "polite");
        form.appendChild(feedback);
    }

    return feedback;
}

function showFeedback(type, message) {
    const feedback = getFeedbackEl();
    if (!feedback) return;

    let alertClass = "alert-danger";
    if (type === "success") alertClass = "alert-success";
    if (type === "info") alertClass = "alert-info";
    feedback.className = `alert ${alertClass} mt-3`;
    feedback.textContent = message;
}

function clearFeedback() {
    const feedback = getFeedbackEl();
    if (!feedback) return;

    feedback.className = "alert mt-3 d-none";
    feedback.textContent = "";
}

function validateForm() {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const subject = document.getElementById("subject").value.trim();
    const message = document.getElementById("message").value.trim();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const namePattern = /^[a-zA-Z.\-\s]+$/;

    if (name === "") return "Name cannot be empty.";
    if (!namePattern.test(name)) return "Name can only contain letters, spaces, dots, and hyphens.";
    if (email === "" || !emailPattern.test(email)) return "Please enter a valid email address.";
    if (subject === "") return "Subject cannot be empty.";
    if (subject.length < 5) return "Subject must be at least 5 characters long.";
    if (message === "") return "Message cannot be empty.";
    if (message.length < 10) return "Message must be at least 10 characters long.";

    return "";
}

async function parseResponse(response) {
    const raw = await response.text();
    if (!raw) return {};

    try {
        return JSON.parse(raw);
    } catch (_) {
        return { message: raw };
    }
}

async function submitToEndpoint(url, payload) {
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const parsed = await parseResponse(response);
    return { response, parsed };
}

const contactForm = document.getElementById("contactForm");
const submitBtn = document.getElementById("submit-btn");

if (contactForm && submitBtn) {
    contactForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        clearFeedback();

        if (!contactForm.checkValidity()) {
            contactForm.reportValidity();
            return;
        }

        const validationMessage = validateForm();
        if (validationMessage) {
            showFeedback("error", validationMessage);
            return;
        }

        const payload = {
            name: document.getElementById("name").value.trim(),
            email: document.getElementById("email").value.trim(),
            subject: document.getElementById("subject").value.trim(),
            message: document.getElementById("message").value.trim(),
        };

        submitBtn.innerHTML = "Sending...";
        submitBtn.disabled = true;
        showFeedback("info", "Submitting your request. Please wait...");

        let finalError = "Unable to submit the form.";

        try {
            for (let i = 0; i < API_ENDPOINTS.length; i += 1) {
                const endpoint = API_ENDPOINTS[i];

                try {
                    const { response, parsed } = await submitToEndpoint(endpoint, payload);
                    const serverMessage = parsed?.message || "";

                    if (response.ok) {
                        showFeedback("success", serverMessage || "Thank you. Your message has been submitted successfully.");
                        contactForm.reset();
                        return;
                    }

                    finalError = `Server returned ${response.status}${serverMessage ? `: ${serverMessage}` : "."}`;

                    // Fallback to legacy endpoint only on 404/405.
                    if (i < API_ENDPOINTS.length - 1 && (response.status === 404 || response.status === 405)) {
                        continue;
                    }

                    break;
                } catch (endpointError) {
                    const errorMessage = endpointError?.message || String(endpointError);
                    const isNetworkLike =
                        errorMessage.toLowerCase().includes("failed to fetch") ||
                        errorMessage.toLowerCase().includes("networkerror") ||
                        errorMessage.toLowerCase().includes("load failed");

                    if (isNetworkLike) {
                        finalError = "Network/CORS error: browser could not reach the API.";
                    } else {
                        finalError = `Request failed: ${errorMessage}`;
                    }

                    // Retry next endpoint only for likely not-found route patterns.
                    if (i < API_ENDPOINTS.length - 1 && errorMessage.toLowerCase().includes("404")) {
                        continue;
                    }

                    break;
                }
            }

            showFeedback("error", finalError);
        } finally {
            submitBtn.innerHTML = "Submit";
            submitBtn.disabled = false;
        }
    });
}
