const subjects = [
  {
    name: "Engineering Mathematics",
    category: "Mathematics",
    icon: "∑",
    color: "#eeeaff",
    description: "Explore formulas, equations and problem-solving.",
    topics: ["Algebra and equations", "Differential calculus", "Integral calculus", "Matrices and determinants"]
  },
  {
    name: "Physics",
    category: "Science",
    icon: "⚛",
    color: "#e4f2ff",
    description: "Understand the laws of nature and motion.",
    topics: ["Mechanics", "Waves and oscillations", "Optics", "Electricity and magnetism"]
  },
  {
    name: "Chemistry",
    category: "Science",
    icon: "⚗",
    color: "#e1f8ef",
    description: "Learn chemical reactions and their applications.",
    topics: ["Atomic structure", "Chemical bonding", "Solutions", "Electrochemistry"]
  },
  {
    name: "Programming in C",
    category: "Technology",
    icon: "{ }",
    color: "#fff0df",
    description: "Build your programming and logic skills.",
    topics: ["Variables and data types", "If-else and loops", "Arrays and strings", "Functions and pointers"]
  },
  {
    name: "Computer Fundamentals",
    category: "Technology",
    icon: "▣",
    color: "#e7edff",
    description: "Learn how computers and operating systems work.",
    topics: ["Computer hardware", "Operating systems", "Memory and storage", "Networking basics"]
  },
  {
    name: "Environmental Science",
    category: "Science",
    icon: "♧",
    color: "#e4f6e8",
    description: "Discover ecosystems and environmental protection.",
    topics: ["Ecosystems", "Biodiversity", "Pollution", "Sustainable development"]
  }
];

const grid = document.getElementById("subjectsGrid");
const searchInput = document.getElementById("searchInput");
const filterRow = document.getElementById("filterRow");
const emptyState = document.getElementById("emptyState");
const resultCount = document.getElementById("resultCount");
const dialog = document.getElementById("subjectDialog");
const dialogContent = document.getElementById("dialogContent");
const toast = document.getElementById("toast");

let activeFilter = "All";
let toastTimeout;

document.getElementById("today").textContent =
  new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });

document.getElementById("subjectCount").textContent = subjects.length;

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("show"), 2400);
}

function renderSubjects() {
  const query = searchInput.value.trim().toLowerCase();

  const filtered = subjects.filter(subject => {
    const matchesFilter =
      activeFilter === "All" || subject.category === activeFilter;

    const searchableText = [
      subject.name,
      subject.category,
      subject.description,
      ...subject.topics
    ].join(" ").toLowerCase();

    return matchesFilter && searchableText.includes(query);
  });

  resultCount.textContent = `${filtered.length} subject${filtered.length === 1 ? "" : "s"}`;
  emptyState.hidden = filtered.length !== 0;

  grid.innerHTML = filtered.map(subject => {
    const index = subjects.indexOf(subject);

    return `
      <article class="subject-card">
        <div class="subject-top">
          <div class="subject-icon"
               style="background:${subject.color}">
            ${escapeHTML(subject.icon)}
          </div>
          <span class="subject-category">${escapeHTML(subject.category)}</span>
        </div>
        <h3>${escapeHTML(subject.name)}</h3>
        <p>${escapeHTML(subject.description)}</p>
        <button class="subject-action" data-open="${index}">
          Explore Topics →
        </button>
      </article>
    `;
  }).join("");
}

searchInput.addEventListener("input", renderSubjects);

filterRow.addEventListener("click", event => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;

  activeFilter = button.dataset.filter;

  filterRow.querySelectorAll(".filter").forEach(filter => {
    filter.classList.toggle("active", filter === button);
  });

  renderSubjects();
});

grid.addEventListener("click", event => {
  const button = event.target.closest("[data-open]");
  if (!button) return;

  const subject = subjects[Number(button.dataset.open)];
  if (!subject) return;

  dialogContent.innerHTML = `
    <p class="eyebrow">${escapeHTML(subject.category)}</p>
    <h2>${escapeHTML(subject.name)}</h2>
    <p style="color:#81849a;font-size:12px;line-height:1.8;margin-top:12px">
      ${escapeHTML(subject.description)}
    </p>
    <h3 style="font-size:14px;margin-top:24px">Topics to explore</h3>
    <ol class="dialog-list">
      ${subject.topics.map(topic =>
        `<li>${escapeHTML(topic)}</li>`
      ).join("")}
    </ol>
    <div class="dialog-note">
      These are sample study topics. You can add your own notes and PDF
      resources to make this library useful for your course.
    </div>
  `;

  dialog.showModal();
});

document.getElementById("closeDialog").addEventListener("click", () => {
  dialog.close();
});

dialog.addEventListener("click", event => {
  if (event.target === dialog) dialog.close();
});

// Study Planner: save tasks in this browser
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const taskEmpty = document.getElementById("taskEmpty");

let tasks = [];

try {
  const savedTasks = localStorage.getItem("studyhub-tasks");
  if (savedTasks) {
    const parsed = JSON.parse(savedTasks);
    if (Array.isArray(parsed)) {
      tasks = parsed.filter(task =>
        task &&
        typeof task.text === "string" &&
        typeof task.done === "boolean" &&
        typeof task.id === "string"
      );
    }
  }
} catch (error) {
  tasks = [];
}

function saveTasks() {
  try {
    localStorage.setItem("studyhub-tasks", JSON.stringify(tasks));
  } catch (error) {
    showToast("Could not save tasks in this browser.");
  }
}

function renderTasks() {
  const completed = tasks.filter(task => task.done).length;
  const pending = tasks.length - completed;
  const progress = tasks.length
    ? Math.round((completed / tasks.length) * 100)
    : 0;

  document.getElementById("completedCount").textContent = completed;
  document.getElementById("pendingCount").textContent = pending;
  document.getElementById("progressLabel").textContent =
    `${progress}% completed`;
  document.getElementById("progressFill").style.width = `${progress}%`;

  taskEmpty.hidden = tasks.length > 0;

  taskList.innerHTML = tasks.map(task => `
    <div class="task-item ${task.done ? "done" : ""}">
      <input type="checkbox"
             data-toggle="${escapeHTML(task.id)}"
             ${task.done ? "checked" : ""}
             aria-label="Mark ${escapeHTML(task.text)} as completed">
      <span class="task-text">${escapeHTML(task.text)}</span>
      <button class="delete-task"
              data-delete="${escapeHTML(task.id)}"
              aria-label="Delete task">×</button>
    </div>
  `).join("");
}

taskForm.addEventListener("submit", event => {
  event.preventDefault();

  const text = taskInput.value.trim();
  if (!text) return;

  tasks.push({
    id: crypto.randomUUID(),
    text,
    done: false
  });

  saveTasks();
  renderTasks();
  taskForm.reset();
  taskInput.focus();
  showToast("Study task added successfully!");
});

taskList.addEventListener("change", event => {
  const id = event.target.dataset.toggle;
  if (!id) return;

  const task = tasks.find(item => item.id === id);
  if (!task) return;

  task.done = event.target.checked;
  saveTasks();
  renderTasks();
});

taskList.addEventListener("click", event => {
  const button = event.target.closest("[data-delete]");
  if (!button) return;

  tasks = tasks.filter(task => task.id !== button.dataset.delete);
  saveTasks();
  renderTasks();
  showToast("Task deleted.");
});

// Highlight the current navigation section
document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", () => {
    document.querySelectorAll(".nav-link").forEach(item => {
      item.classList.toggle("active", item === link);
    });
  });
});

renderSubjects();
renderTasks();
/* Temporary test: remove after checking */
body {
    background-color: #090811 !important;
    color: #f8f7ff !important;
}