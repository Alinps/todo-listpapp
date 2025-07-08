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

function toggleTaskCompleted(idx) {
    tasks[idx].completed = !tasks[idx].completed;
    saveTasks();
    renderTasks();
}
/**
 * Modernize the checkbox with custom styling and add animations.
 * Uses a wrapper span for the custom checkbox and CSS classes for animation.
 */

// Add custom CSS for modern checkbox and animation
const style = document.createElement('style');
style.textContent = `
.custom-checkbox {
    position: relative;
    display: inline-block;
    width: 22px;
    height: 22px;
    margin-right: 12px;
    vertical-align: middle;
}
.custom-checkbox input[type="checkbox"] {
    opacity: 0;
    width: 22px;
    height: 22px;
    margin: 0;
    position: absolute;
    left: 0;
    top: 0;
    cursor: pointer;
    z-index: 2;
}
.custom-checkbox .checkmark {
    position: absolute;
    top: 0; left: 0;
    height: 22px; width: 22px;
    background: linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%);
    border-radius: 7px;
    border: 2px solid #bdbdbd;
    transition: border-color 0.2s, box-shadow 0.2s;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.custom-checkbox input:checked ~ .checkmark {
    border-color: #4f8cff;
    background: linear-gradient(135deg, #4f8cff 0%, #6fc3ff 100%);
    box-shadow: 0 2px 8px rgba(79,140,255,0.15);
    animation: check-pop 0.25s cubic-bezier(.4,2,.6,1) 1;
}
@keyframes check-pop {
    0% { transform: scale(0.7); }
    60% { transform: scale(1.15); }
    100% { transform: scale(1); }
}
.custom-checkbox .checkmark:after {
    content: "";
    position: absolute;
    display: none;
}
.custom-checkbox input:checked ~ .checkmark:after {
    display: block;
}
.custom-checkbox .checkmark:after {
    left: 6px;
    top: 2px;
    width: 7px;
    height: 13px;
    border: solid #fff;
    border-width: 0 3px 3px 0;
    border-radius: 1px;
    transform: rotate(45deg);
    animation: checkmark-draw 0.18s cubic-bezier(.4,2,.6,1) 1;
}
@keyframes checkmark-draw {
    0% { height: 0; width: 0; opacity: 0; }
    60% { height: 13px; width: 0; opacity: 1; }
    100% { height: 13px; width: 7px; opacity: 1; }
}
`;
document.head.appendChild(style);

// Override renderTasks to use the modern animated checkbox
const originalRenderTasksModern = renderTasks;
renderTasks = function() {
    taskList.innerHTML = '';
    tasks.forEach((task, idx) => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex align-items-center';
        li.setAttribute('data-index', idx);

        // Modern animated checkbox
        const checkboxWrapper = document.createElement('span');
        checkboxWrapper.className = 'custom-checkbox';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = !!task.completed;
        checkbox.title = "Mark as completed";
        checkbox.onclick = () => toggleTaskCompleted(idx);

        const checkmark = document.createElement('span');
        checkmark.className = 'checkmark';

        checkboxWrapper.appendChild(checkbox);
        checkboxWrapper.appendChild(checkmark);

        // Task text
        const span = document.createElement('span');
        span.className = 'task-text flex-grow-1';
        span.textContent = `${task.text} (Due: ${task.date})`;
        span.title = "Edit task";
        span.setAttribute('tabindex', 0);
        if (task.completed) {
            span.style.textDecoration = 'line-through';
            span.style.opacity = '0.6';
        }

        span.ondblclick = () => openEditModal(idx);

        // Action buttons
        const actions = document.createElement('div');
        actions.className = 'action-btns';

        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-sm btn-outline-secondary mr-1';
        editBtn.innerHTML = '<i class="bi bi-pencil"></i>';
        editBtn.title = "Edit";
        editBtn.onclick = () => openEditModal(idx);

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

        li.appendChild(checkboxWrapper);
        li.appendChild(span);
        li.appendChild(actions);

        taskList.appendChild(li);
    });
};
// // Update renderTasks to include checkbox
// const originalRenderTasks = renderTasks;
// renderTasks = function() {
//     taskList.innerHTML = '';
//     tasks.forEach((task, idx) => {
//         const li = document.createElement('li');
//         li.className = 'list-group-item d-flex align-items-center';
//         li.setAttribute('data-index', idx);

//         // Stylish checkbox
//         const checkbox = document.createElement('input');
//         checkbox.type = 'checkbox';
//         checkbox.className = 'form-check-input mr-2';
//         checkbox.checked = !!task.completed;
//         checkbox.title = "Mark as completed";
//         checkbox.onclick = () => toggleTaskCompleted(idx);

//         // Task text
//         const span = document.createElement('span');
//         span.className = 'task-text flex-grow-1';
//         span.textContent = `${task.text} (Due: ${task.date})`;
//         span.title = "Edit task";
//         span.setAttribute('tabindex', 0);
//         if (task.completed) {
//             span.style.textDecoration = 'line-through';
//             span.style.opacity = '0.6';
//         }

//         span.ondblclick = () => openEditModal(idx);

//         // Action buttons
//         const actions = document.createElement('div');
//         actions.className = 'action-btns';

//         const editBtn = document.createElement('button');
//         editBtn.className = 'btn btn-sm btn-outline-secondary mr-1';
//         editBtn.innerHTML = '<i class="bi bi-pencil"></i>';
//         editBtn.title = "Edit";
//         editBtn.onclick = () => openEditModal(idx);

//         const delBtn = document.createElement('button');
//         delBtn.className = 'btn btn-sm btn-outline-danger';
//         delBtn.innerHTML = '<i class="bi bi-trash"></i>';
//         delBtn.title = "Delete";
//         delBtn.onclick = () => {
//             taskToDelete = idx;
//             deleteModal.modal('show');
//         };

//         actions.appendChild(editBtn);
//         actions.appendChild(delBtn);

//         li.appendChild(checkbox);
//         li.appendChild(span);
//         li.appendChild(actions);

//         taskList.appendChild(li);
//     });
// };

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