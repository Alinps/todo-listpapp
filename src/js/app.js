// 






// JavaScript logic for the To-Do List application

document.addEventListener('DOMContentLoaded', loadTasks);

const taskInput = document.getElementById('taskInput');
const taskDate = document.getElementById('taskDate');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const deleteModal = $('#deleteModal');
const editModal = $('#editModal');
const editTaskInput = document.getElementById('editTaskInput');
let tasks = [];
let taskToDelete = null;
let taskToEdit = null;

// Load tasks from localStorage
function loadTasks() {
    const stored = localStorage.getItem('tasks');
    tasks = stored ? JSON.parse(stored) : [];
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Render tasks
function renderTasks() {
    taskList.innerHTML = '';
    tasks.forEach((task, idx) => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex align-items-center';
        li.setAttribute('data-index', idx);

        const span = document.createElement('span');
        span.className = 'task-text flex-grow-1';
        // Show task name and date
        span.textContent = `${task.text} (Due: ${task.date})`;
        span.title = "Edit task";
        span.setAttribute('tabindex', 0);

        // Double-click to edit via modal
        span.ondblclick = () => openEditModal(idx);

        // Action buttons
        const actions = document.createElement('div');
        actions.className = 'action-btns';

        // Edit button
        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-sm btn-outline-secondary mr-1';
        editBtn.innerHTML = '<i class="bi bi-pencil"></i>';
        editBtn.title = "Edit";
        editBtn.onclick = () => openEditModal(idx);

        // Delete button
        const delBtn = document.createElement('button');
        delBtn.className = 'btn btn-sm btn-outline-danger';
        delBtn.innerHTML = '<i class="bi bi-trash"></i>';
        delBtn.title = "Delete";
        delBtn.onclick = () => {
            taskToDelete = idx;
            deleteModal.modal('show');
        };

        actions.appendChild(editBtn);
        actions.appendChild(delBtn);

        li.appendChild(span);
        li.appendChild(actions);

        taskList.appendChild(li);
    });
}

// Open edit modal and set current task index
function openEditModal(idx) {
    taskToEdit = idx;
    editTaskInput.value = tasks[idx].text;
    editModal.modal('show');
    setTimeout(() => editTaskInput.focus(), 300);
}

// Save edit from modal
document.getElementById('saveEditBtn').onclick = function() {
    const newText = editTaskInput.value.trim();
    if (taskToEdit !== null && newText) {
        tasks[taskToEdit].text = newText;
        saveTasks();
        renderTasks();
        taskToEdit = null;
        editModal.modal('hide');
    }
};

// Allow Enter key to save in modal
editTaskInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        document.getElementById('saveEditBtn').click();
    }
});

// Add task
function addTask() {
    const text = taskInput.value.trim();
    const date = taskDate.value;
    if (!text || !date) {
        if (!date) {
            taskDate.classList.add('is-invalid');
            taskDate.focus();
        } else {
            taskDate.classList.remove('is-invalid');
        }
        if (!text) {
            taskInput.classList.add('is-invalid');
            taskInput.focus();
        } else {
            taskInput.classList.remove('is-invalid');
        }
        return;
    }
    taskInput.classList.remove('is-invalid');
    taskDate.classList.remove('is-invalid');
    tasks.push({ text, date });
    saveTasks();
    renderTasks();
    animateLastAdded();
    taskInput.value = '';
    taskDate.value = '';
    taskInput.focus();
}

// Animate last added task
function animateLastAdded() {
    const items = taskList.querySelectorAll('.list-group-item');
    if (items.length) {
        const last = items[items.length - 1];
        last.classList.add('added');
        setTimeout(() => last.classList.remove('added'), 500);
    }
}

// Delete task
document.getElementById('confirmDeleteBtn').onclick = function() {
    if (taskToDelete !== null) {
        const li = taskList.querySelector(`[data-index="${taskToDelete}"]`);
        if (li) {
            li.classList.add('removed');
            setTimeout(() => {
                tasks.splice(taskToDelete, 1);
                saveTasks();
                renderTasks();
                taskToDelete = null;
                deleteModal.modal('hide');
            }, 400);
        }
    }
};

// Add task events
addTaskBtn.onclick = addTask;
taskInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') addTask();
});
taskDate.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') addTask();
});

// Initial load
loadTasks();
renderTasks();