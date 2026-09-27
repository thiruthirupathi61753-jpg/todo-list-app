const STORAGE_KEY = "todo-list-app.tasks";

const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const tasksList = document.getElementById("tasksList");
const emptyState = document.getElementById("emptyState");
const totalCount = document.getElementById("totalCount");
const completedCount = document.getElementById("completedCount");
const remainingCount = document.getElementById("remainingCount");
const clearCompletedBtn = document.getElementById("clearCompletedBtn");
const clearAllBtn = document.getElementById("clearAllBtn");
const filterButtons = document.querySelectorAll(".filter-btn");

let tasks = loadTasks();
let currentFilter = "all";

function loadTasks() {
    try {
        const savedTasks = JSON.parse(localStorage.getItem(STORAGE_KEY));
        return Array.isArray(savedTasks) ? savedTasks : [];
    } catch (error) {
        console.warn("Unable to load saved tasks.", error);
        return [];
    }
}

function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function createTask(text) {
    return {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        text,
        completed: false,
        createdAt: Date.now()
    };
}

function addTask() {
    const text = taskInput.value.trim();
    if (!text) {
        taskInput.focus();
        return;
    }

    tasks.unshift(createTask(text));
    taskInput.value = "";
    saveTasks();
    render();
    taskInput.focus();
}

function getVisibleTasks() {
    if (currentFilter === "active") return tasks.filter(task => !task.completed);
    if (currentFilter === "completed") return tasks.filter(task => task.completed);
    return tasks;
}

function render() {
    const visibleTasks = getVisibleTasks();
    tasksList.innerHTML = "";

    visibleTasks.forEach(task => {
        const item = document.createElement("li");
        item.className = `task-item${task.completed ? " completed" : ""}`;
        item.dataset.id = task.id;

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "task-checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute("aria-label", `Mark ${task.text} as complete`);
        checkbox.addEventListener("change", () => toggleTask(task.id));

        const text = document.createElement("span");
        text.className = "task-text";
        text.textContent = task.text;

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.type = "button";
        deleteButton.title = "Delete task";
        deleteButton.setAttribute("aria-label", `Delete ${task.text}`);
        deleteButton.textContent = "🗑️";
        deleteButton.addEventListener("click", () => deleteTask(task.id));

        item.append(checkbox, text, deleteButton);
        tasksList.appendChild(item);
    });

    emptyState.hidden = visibleTasks.length > 0;
    if (visibleTasks.length === 0 && tasks.length > 0) {
        emptyState.querySelector("p").textContent = `No ${currentFilter} tasks right now.`;
    } else {
        emptyState.querySelector("p").textContent = "✨ No tasks yet. Add one to get started!";
    }

    const completed = tasks.filter(task => task.completed).length;
    totalCount.textContent = tasks.length;
    completedCount.textContent = completed;
    remainingCount.textContent = tasks.length - completed;
}

function toggleTask(id) {
    tasks = tasks.map(task => task.id === id
        ? { ...task, completed: !task.completed }
        : task
    );
    saveTasks();
    render();
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    render();
}

addBtn.addEventListener("click", addTask);
taskInput.addEventListener("keydown", event => {
    if (event.key === "Enter") addTask();
});

filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        currentFilter = button.dataset.filter;
        filterButtons.forEach(item => item.classList.toggle("active", item === button));
        render();
    });
});

clearCompletedBtn.addEventListener("click", () => {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    render();
});

clearAllBtn.addEventListener("click", () => {
    if (tasks.length === 0 || confirm("Delete all tasks?")) {
        tasks = [];
        saveTasks();
        render();
    }
});

render();
