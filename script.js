(function () {
  const CORRECT_PIN = "696969"; // Change as needed
  const MAX_ATTEMPTS = 3;
  const LOCKOUT_MS = 30_000; // 30 seconds

  const dotsContainer = document.getElementById("pin-dots");
  const messageEl = document.getElementById("message");
  const keypad = document.querySelector(".keypad");
  const demoPinEl = document.getElementById("demo-pin");
  const lockIcon = document.querySelector('.lock-icon');

  let entered = "";
  let attempts = 0;
  let lockoutUntil = 0;

  function setMessage(text, type) {
    messageEl.textContent = text || "";
    messageEl.className = `message${type ? " " + type : ""}`;
  }

  function isLockedOut() {
    const now = Date.now();
    if (now < lockoutUntil) {
      const seconds = Math.ceil((lockoutUntil - now) / 1000);
      setMessage(`Locked for ${seconds}s due to too many attempts`, "warning");
      return true;
    }
    return false;
  }

  function updateDots(state) {
    const dots = dotsContainer.querySelectorAll(".dot");
    dots.forEach((d, i) => {
      d.classList.remove("filled", "success", "error");
      if (i < (state?.fillCount ?? entered.length)) {
        d.classList.add(state?.className || "filled");
      }
    });
    dotsContainer.dataset.length = entered.length.toString();
  }

  function clearInput(animated) {
    entered = "";
    updateDots();
    if (animated) {
      dotsContainer.classList.remove("shake");
      // Force reflow to restart animation
      // eslint-disable-next-line no-unused-expressions
      void dotsContainer.offsetWidth;
      dotsContainer.classList.add("shake");
      setTimeout(() => dotsContainer.classList.remove("shake"), 450);
    }
  }

  function onDigit(digit) {
    if (isLockedOut()) return;
    if (entered.length >= 6) return;
    entered += digit;
    updateDots();
    setMessage("");
  }

  function onDelete() {
    if (isLockedOut()) return;
    if (!entered) return;
    entered = entered.slice(0, -1);
    updateDots();
  }

  function onClear() {
    if (isLockedOut()) return;
    clearInput();
    setMessage("");
  }

  function validate() {
    if (entered === CORRECT_PIN) {
      updateDots({ fillCount: 6, className: "success" });
      setMessage("Unlocked!", "success");
      const title = document.querySelector('.title');
      if (title) title.textContent = 'Correct password';
      if (lockIcon) lockIcon.classList.add('open');
      Array.from(document.querySelectorAll(".key")).forEach((b) => (b.disabled = true));
      return true;
    }
    attempts += 1;
    updateDots({ fillCount: 6, className: "error" });
    setMessage("Incorrect PIN", "error");
    clearInput(true);

    if (attempts >= MAX_ATTEMPTS) {
      lockoutUntil = Date.now() + LOCKOUT_MS;
      setMessage("Too many attempts. Locked.", "warning");
    }
    return false;
  }

  // Click handlers
  keypad.addEventListener("click", (e) => {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;
    const btn = t.closest && t.closest("button");
    if (!btn) return;
    const digit = btn.getAttribute("data-key");
    const action = btn.getAttribute("data-action");
    if (digit) onDigit(digit);
    if (action === "delete") onDelete();
    if (action === "clear") onClear();
  });

  // Submit via checkmark key
  document.addEventListener("click", (e) => {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;
    const submitAction = t.closest && t.closest('[data-action="submit"]');
    if (submitAction) {
      if (isLockedOut()) return;
      if (entered.length < 6) {
        setMessage("Enter all 6 digits", "warning");
        return;
      }
      validate();
    }
  });

  // Keyboard support
  window.addEventListener("keydown", (e) => {
    if (e.key >= "0" && e.key <= "9") {
      e.preventDefault();
      onDigit(e.key);
      return;
    }
    if (e.key === "Backspace") {
      e.preventDefault();
      onDelete();
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      onClear();
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (entered.length === 6) validate();
      else setMessage("Enter all 6 digits", "warning");
    }
  });

  // Initialize
  updateDots();
  setMessage("");
  if (demoPinEl) demoPinEl.textContent = CORRECT_PIN;
})();



