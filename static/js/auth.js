const API = "";

function showError(msg) {
    const el = document.getElementById("error-msg");
    el.textContent = msg;
    el.classList.remove("hidden");
}

function hideError() {
    document.getElementById("error-msg").classList.add("hidden");
}

// ── Login ──
const loginForm = document.getElementById("login-form");
if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        hideError();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        const body = new URLSearchParams();
        body.append("username", email);
        body.append("password", password);

        try {
            const res = await fetch(`${API}/api/auth/login`, {
                method: "POST",
                body: body,
            });
            if (!res.ok) {
                const data = await res.json();
                showError(data.detail || "Login failed");
                return;
            }
            const data = await res.json();
            localStorage.setItem("token", data.access_token);
            window.location.href = "/dashboard";
        } catch {
            showError("Network error. Please try again.");
        }
    });
}

// ── Register ──
const registerForm = document.getElementById("register-form");
if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        hideError();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const confirm = document.getElementById("confirm-password").value;

        if (password !== confirm) {
            showError("Passwords do not match");
            return;
        }

        try {
            const res = await fetch(`${API}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            if (!res.ok) {
                const data = await res.json();
                showError(data.detail || "Registration failed");
                return;
            }
            // Auto-login after register
            const loginBody = new URLSearchParams();
            loginBody.append("username", email);
            loginBody.append("password", password);
            const loginRes = await fetch(`${API}/api/auth/login`, {
                method: "POST",
                body: loginBody,
            });
            if (loginRes.ok) {
                const data = await loginRes.json();
                localStorage.setItem("token", data.access_token);
            }
            window.location.href = "/dashboard";
        } catch {
            showError("Network error. Please try again.");
        }
    });
}
