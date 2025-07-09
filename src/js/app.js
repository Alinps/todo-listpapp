document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    renderTasks();
});

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
let currentPage = 1;
const TASKS_PER_PAGE = 5;

function loadTasks() {
    const stored = localStorage.getItem('tasks');
    tasks = stored ? JSON.parse(stored) : [];
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function getPaginatedTasks() {
    const start = (currentPage - 1) * TASKS_PER_PAGE;
    return tasks.slice(start, start + TASKS_PER_PAGE);
}

function renderPagination() {
    let pagination = document.getElementById('pagination');
    if (!pagination) {
        pagination = document.createElement('nav');
        pagination.id = 'pagination';
        pagination.className = 'mt-3';
        taskList.parentNode.appendChild(pagination);
    }

    const totalPages = Math.ceil(tasks.length / TASKS_PER_PAGE);
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    let html = `<ul class="pagination justify-content-center mb-0">`;
    html += `<li class="page-item${currentPage === 1 ? ' disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage - 1}">&laquo;</a>
            </li>`;
    for (let i = 1; i <= totalPages; i++) {
        html += `<li class="page-item${i === currentPage ? ' active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>`;
    }
    html += `<li class="page-item${currentPage === totalPages ? ' disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage + 1}">&raquo;</a>
            </li>`;
    html += `</ul>`;

    pagination.innerHTML = html;

    pagination.querySelectorAll('a.page-link').forEach(link => {
        link.onclick = function (e) {
            e.preventDefault();
            const page = parseInt(this.getAttribute('data-page'));
            if (page >= 1 && page <= totalPages && page !== currentPage) {
                currentPage = page;
                renderTasks();
            }
        };
    });
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    if (isNaN(date)) return dateStr;
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();

    // Get ordinal suffix
    function ordinal(n) {
        if (n > 3 && n < 21) return 'th';
        switch (n % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    }

    return `${day}${ordinal(day)} ${month} ${year}`;
}

function renderTasks() {
    taskList.innerHTML = '';
    const paginatedTasks = getPaginatedTasks();

    paginatedTasks.forEach((task, idx) => {
        const realIdx = (currentPage - 1) * TASKS_PER_PAGE + idx;

        const li = document.createElement('li');
        li.className = 'list-group-item d-flex align-items-center';
        li.setAttribute('data-index', realIdx);

        if (task.completed) {
            li.classList.add('completed-task');
        } else {
            li.classList.remove('completed-task');
        }

        const checkboxWrapper = document.createElement('span');
        checkboxWrapper.className = 'custom-checkbox';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = !!task.completed;
        checkbox.title = "Mark as completed";
        checkbox.onclick = () => toggleTaskCompleted(realIdx);

        const checkmark = document.createElement('span');
        checkmark.className = 'checkmark';

        checkboxWrapper.appendChild(checkbox);
        checkboxWrapper.appendChild(checkmark);

        const span = document.createElement('span');
        span.className = 'task-text flex-grow-1';
        span.textContent = `${task.text} (Due: ${formatDate(task.date)})`;
        span.title = "Edit task";
        span.setAttribute('tabindex', 0);
        if (task.completed) {
            span.style.textDecoration = 'line-through';
            span.style.opacity = '0.6';
        }
        span.ondblclick = () => openEditModal(realIdx);

        const actions = document.createElement('div');
        actions.className = 'action-btns';

        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-sm btn-outline-secondary mr-1';
        editBtn.innerHTML = '<i class="bi bi-pencil"></i>';
        editBtn.title = "Edit";
        editBtn.onclick = () => openEditModal(realIdx);

        const delBtn = document.createElement('button');
        delBtn.className = 'btn btn-sm btn-outline-danger';
        delBtn.innerHTML = '<i class="bi bi-trash"></i>';
        delBtn.title = "Delete";
        delBtn.onclick = () => {
            taskToDelete = realIdx;
            deleteModal.modal('show');
        };

        actions.appendChild(editBtn);
        actions.appendChild(delBtn);

        li.appendChild(checkboxWrapper);
        li.appendChild(span);
        li.appendChild(actions);

        taskList.appendChild(li);
    });

    renderPagination();
}

//✅ FIXED toggle with animation applied to correct checkbox
// function toggleTaskCompleted(idx) {
//     const checkbox = taskList.querySelector(`li[data-index="${idx}"] .checkmark`);
//     if (checkbox) {
//         checkbox.classList.add('check-pop-animation');
//         setTimeout(() => {
//             checkbox.classList.remove('check-pop-animation');
//         }, 250);
//     }

//     tasks[idx].completed = !tasks[idx].completed;
//     saveTasks();
//     renderTasks();
// }


function toggleTaskCompleted(idx) {
    tasks[idx].completed = !tasks[idx].completed;
    saveTasks();
    renderTasks();

    // Wait until DOM updates, then animate specific task
    requestAnimationFrame(() => {
        const li = taskList.querySelector(`li[data-index="${idx}"]`);
        if (li) {
            const checkmark = li.querySelector('.checkmark');
            if (checkmark) {
                checkmark.classList.add('animated');
                setTimeout(() => checkmark.classList.remove('animated'), 300);
            }
        }
    });
}






function openEditModal(idx) {
    taskToEdit = idx;
    editTaskInput.value = tasks[idx].text;
    editModal.modal('show');
    setTimeout(() => editTaskInput.focus(), 300);
}

document.getElementById('saveEditBtn').onclick = function () {
    const newText = editTaskInput.value.trim();
    if (taskToEdit !== null && newText) {
        tasks[taskToEdit].text = newText;
        saveTasks();
        renderTasks();
        taskToEdit = null;
        editModal.modal('hide');
    }
};

function animateDelete(idx, callback) {
    const li = taskList.querySelector(`[data-index="${idx}"]`);
    if (li) {
        li.classList.add('removed');
        setTimeout(() => {
            callback();
        }, 400);
    } else {
        callback();
    }
}

document.getElementById('confirmDeleteBtn').onclick = function () {
    if (taskToDelete !== null) {
        animateDelete(taskToDelete, () => {
            tasks.splice(taskToDelete, 1);
            saveTasks();
            if ((currentPage - 1) * TASKS_PER_PAGE >= tasks.length) {
                currentPage = Math.max(1, currentPage - 1);
            }
            renderTasks();
            taskToDelete = null;
            deleteModal.modal('hide');
        });
    }
};




const searchInput = document.createElement('input');
searchInput.type = 'text';
searchInput.className = 'form-control mb-3';
searchInput.placeholder = 'Search tasks...';
searchInput.id = 'searchInput';
taskList.parentNode.insertBefore(searchInput, taskList);

let searchQuery = '';

searchInput.addEventListener('input', function () {
    searchQuery = this.value.trim().toLowerCase();
    currentPage = 1;
    renderTasks();
});

function getPaginatedTasks() {
    let filtered = tasks;
    if (searchQuery) {
        filtered = tasks.filter(task => task.text.toLowerCase().includes(searchQuery));
    }
    const start = (currentPage - 1) * TASKS_PER_PAGE;
    return filtered.slice(start, start + TASKS_PER_PAGE);
}

function renderPagination() {
    let pagination = document.getElementById('pagination');
    if (!pagination) {
        pagination = document.createElement('nav');
        pagination.id = 'pagination';
        pagination.className = 'mt-3';
        taskList.parentNode.appendChild(pagination);
    }

    let filtered = tasks;
    if (searchQuery) {
        filtered = tasks.filter(task => task.text.toLowerCase().includes(searchQuery));
    }
    const totalPages = Math.ceil(filtered.length / TASKS_PER_PAGE);
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    let html = `<ul class="pagination justify-content-center mb-0">`;
    html += `<li class="page-item${currentPage === 1 ? ' disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage - 1}">&laquo;</a>
            </li>`;
    for (let i = 1; i <= totalPages; i++) {
        html += `<li class="page-item${i === currentPage ? ' active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>`;
    }
    html += `<li class="page-item${currentPage === totalPages ? ' disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage + 1}">&raquo;</a>
            </li>`;
    html += `</ul>`;

    pagination.innerHTML = html;

    pagination.querySelectorAll('a.page-link').forEach(link => {
        link.onclick = function (e) {
            e.preventDefault();
            const page = parseInt(this.getAttribute('data-page'));
            if (page >= 1 && page <= totalPages && page !== currentPage) {
                currentPage = page;
                renderTasks();
            }
        };
    });
}




function addTask() {
    const text = taskInput.value.trim();
    const date = taskDate.value;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to midnight for accurate comparison

    if (!text || !date) {
        if (!text) taskInput.classList.add('is-invalid');
        else taskInput.classList.remove('is-invalid');
        if (!date) taskDate.classList.add('is-invalid');
        else taskDate.classList.remove('is-invalid');
        return;
    }

    // Date validation: only allow today or future dates
    const dueDate = new Date(date);
    dueDate.setHours(0, 0, 0, 0);
    if (dueDate < today) {
        taskDate.classList.add('is-invalid');
        taskDate.setCustomValidity('Due date cannot be in the past.');
        taskDate.reportValidity();
        return;
    } else {
        taskDate.classList.remove('is-invalid');
        taskDate.setCustomValidity('');
    }

    taskInput.classList.remove('is-invalid');
    taskDate.classList.remove('is-invalid');

    tasks.push({ text, date, completed: false });
    saveTasks();
    currentPage = Math.ceil(tasks.length / TASKS_PER_PAGE);
    renderTasks();
    animateLastAdded();

    taskInput.value = '';
    taskDate.value = '';
    taskInput.focus();
}

function animateLastAdded() {
    const items = taskList.querySelectorAll('.list-group-item');
    if (items.length) {
        const last = items[items.length - 1];
        last.classList.add('added');
        setTimeout(() => last.classList.remove('added'), 500);
    }
}

addTaskBtn.onclick = addTask;
taskInput.addEventListener('keydown', e => { if (e.key === 'Enter') addTask(); });
taskDate.addEventListener('keydown', e => { if (e.key === 'Enter') addTask(); });
editTaskInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('saveEditBtn').click();
});

// CSS for animations
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
}
.check-pop-animation {
    animation: check-pop 0.25s cubic-bezier(.4,2,.6,1);
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
    animation: checkmark-draw 0.18s cubic-bezier(.4,2,.6,1);
}
@keyframes checkmark-draw {
    0% { height: 0; width: 0; opacity: 0; }
    60% { height: 13px; width: 0; opacity: 1; }
    100% { height: 13px; width: 7px; opacity: 1; }
}
.added {
    animation: fadeIn 0.4s ease-in-out;
}
@keyframes fadeIn {
    from { background-color: #d1eaff; }
    to { background-color: transparent; }
}
.removed {
    animation: fadeOut 0.4s forwards cubic-bezier(.4,2,.6,1);
}
@keyframes fadeOut {
    from { opacity: 1; transform: scale(1); background: #ffeaea; }
    to { opacity: 0; transform: scale(0.95); height: 0; margin: 0; padding: 0; }
}
`;
document.head.appendChild(style);

