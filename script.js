// DOM Elements
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const prioritySelect = document.getElementById('priority-select');
const dueDateInput = document.getElementById('due-date');
const taskList = document.getElementById('task-list');
const tasksCount = document.getElementById('tasks-count');
const clearCompletedBtn = document.getElementById('clear-completed-btn');
const filterButtons = document.querySelectorAll('.filter-btn');
const darkModeCheckbox = document.getElementById('dark-mode');

// Load tasks from LocalStorage or default initial tasks
let tasks = JSON.parse(localStorage.getItem('tasks')) || [
    { id: 1, text: 'Buy groceries', priority: 'medium', dueDate: 'Today', completed: false },
    { id: 2, text: 'Call David', priority: 'high', dueDate: 'Tomorrow', completed: true }
];
let currentFilter = 'all';

// Save tasks to LocalStorage and update UI
function saveAndRender() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
    updateTaskCount();
}

// Format due date representation nicely
function formatDueDate(dateString) {
    if (!dateString) return '';
    if (dateString === 'Today' || dateString === 'Tomorrow') return dateString;
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Render tasks matching current filter
function renderTasks() {
    if (!taskList) return;
    taskList.innerHTML = '';

    const filteredTasks = tasks.filter(task => {
        if (currentFilter === 'active') return !task.completed;
        if (currentFilter === 'completed') return task.completed;
        return true;
    });

    if (filteredTasks.length === 0) {
        taskList.innerHTML = `<li style="text-align:center; padding:20px; color:#666; border:none; background:transparent;">No tasks found.</li>`;
        return;
    }

    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `priority-${task.priority} ${task.completed ? 'completed' : ''}`;

        li.innerHTML = `
            <div class="task-info">
                <span class="task-text">${escapeHTML(task.text)}</span>
                ${task.dueDate ? `<small class="due-tag"><i class="far fa-calendar-alt"></i> ${formatDueDate(task.dueDate)}</small>` : ''}
            </div>
            <div class="actions">
                <i class="fas fa-check-square check-icon" title="Mark Complete" onclick="toggleTask(${task.id})"></i>
                <i class="fas fa-pen edit-icon" title="Edit Task" onclick="editTask(${task.id})"></i>
                <i class="fas fa-trash delete-icon" title="Delete Task" onclick="deleteTask(${task.id})"></i>
            </div>
        `;
        taskList.appendChild(li);
    });
}

// Escape HTML utility to prevent XSS injection
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

// Update remaining active task counter text
function updateTaskCount() {
    if (!tasksCount) return;
    const activeCount = tasks.filter(task => !task.completed).length;
    tasksCount.textContent = `${activeCount} task${activeCount === 1 ? '' : 's'} remaining`;
}

// Form Submission Event Listener
if (todoForm) {
    todoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = todoInput.value.trim();
        if (!text) return;

        const newTask = {
            id: Date.now(),
            text: text,
            priority: prioritySelect ? prioritySelect.value : 'medium',
            dueDate: dueDateInput ? dueDateInput.value : '',
            completed: false
        };

        tasks.push(newTask);
        todoInput.value = '';
        if (dueDateInput) dueDateInput.value = '';
        if (prioritySelect) prioritySelect.value = 'medium';
        saveAndRender();
    });
}

// Toggle Task Completion State
window.toggleTask = function(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });
    saveAndRender();
};

// Delete Task from List
window.deleteTask = function(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveAndRender();
};

// Edit Task Item Description
window.editTask = function(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newText = prompt("Edit your task:", task.text);
    if (newText !== null && newText.trim() !== "") {
        task.text = newText.trim();
        saveAndRender();
    }
};

// Filter Button Event Listeners
filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.getAttribute('data-filter');
        renderTasks();
    });
});

// Clear Completed Tasks Action
if (clearCompletedBtn) {
    clearCompletedBtn.addEventListener('click', () => {
        tasks = tasks.filter(task => !task.completed);
        saveAndRender();
    });
}

// Dark Mode Toggle Logic & Local Storage Synchronization
const currentTheme = localStorage.getItem('theme');
if (currentTheme === 'dark') {
    document.body.classList.add('dark-mode');
    if (darkModeCheckbox) darkModeCheckbox.checked = true;
}

if (darkModeCheckbox) {
    darkModeCheckbox.addEventListener('change', () => {
        if (darkModeCheckbox.checked) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
        }
    });
}

// Initial UI Render on Page Load
saveAndRender();