function validateForm() {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const subject = document.getElementById("subject").value.trim();
    const message = document.getElementById("message").value.trim();

    // Regular expression for email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const namePattern = /^[a-zA-Z\s]+$/; // Allows only letters and spaces

    if (name === "") {
        alert("Name cannot be empty.");
        return false;
    } else if (!namePattern.test(name)) {
        alert("Name can only contain letters and spaces.");
        return false;
    }

    if (email === "" || !emailPattern.test(email)) {
        alert("Please enter a valid email address.");
        return false;
    }

    if (subject === "") {
        alert("Subject cannot be empty.");
        return false;
    } else if (subject.length < 5) {
        alert("Subject must be at least 5 characters long.");
        return false;
    }

    if (message === "") {
        alert("Message cannot be empty.");
        return false;
    } else if (message.length < 10) {
        alert("Message must be at least 10 characters long.");
        return false;
    }

    return true;
}

document.getElementById("contactForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const subject = document.getElementById("subject").value.trim();
    const message = document.getElementById("message").value.trim();
    const btn = document.getElementById("submit-btn");
    btn.innerHTML = "Sending...";
    btn.disabled = true;

    if(!validateForm()) {
        btn.innerHTML = "Submit";
        btn.disabled = false;
        return;
    }

    const response = await fetch("https://mw-backend-green.vercel.app/nexastats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
    });

    const result = await response.json();
    alert(result.message);
    // empty form fields
    document.getElementById("name").value = "";
    document.getElementById("email").value = "";
    document.getElementById("subject").value = "";
    document.getElementById("message").value = "";
    document.getElementById("contactForm").reset();

    btn.innerHTML = "Submit";
    btn.disabled = false;
});
