const noteText = document.getElementById("note-text");
const charCount = document.getElementById("char-count");
const wordCount = document.getElementById("word-count");
const clearBtn = document.getElementById("clear-btn");
const themeToggle = document.getElementById("theme-toggle");

function updateCounts() {
    const text = noteText.value;
    const characters = text.length;

    const words = text.trim() === ""
        ? 0
        : text.trim().split(/\s+/).length;

    charCount.textContent = `${characters} / 200 characters`;
    wordCount.textContent = `${words} words`;

    charCount.classList.remove("warning", "over");

    if (characters > 200) {
        charCount.classList.add("over");
    } else if (characters > 180) {
        charCount.classList.add("warning");
    }
}
function saveDraft() {
    localStorage.setItem("noteDraft", noteText.value);
}
noteText.addEventListener("input", () => {
    updateCounts();
    saveDraft();
});
function clearEverything() {
    noteText.value = "";

    updateCounts();

    localStorage.removeItem("noteDraft");
}
clearBtn.addEventListener("click", () => {
    clearEverything();
});
noteText.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        clearEverything();
    }
});
themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    const isDark = document.body.classList.contains("dark");

    themeToggle.textContent = isDark ? "Light mode" : "Dark mode";

    localStorage.setItem("darkMode", isDark);
});
const savedDraft = localStorage.getItem("noteDraft");

if (savedDraft !== null) {
    noteText.value = savedDraft;
}
const savedTheme = localStorage.getItem("darkMode");

if (savedTheme === "true") {
    document.body.classList.add("dark");
    themeToggle.textContent = "Light mode";
} else {
    themeToggle.textContent = "Dark mode";
}
updateCounts();