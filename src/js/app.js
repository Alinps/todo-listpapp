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

function createSearchBox() {
    let searchContainer = document.getElementById('searchContainer');
    if (!searchContainer) {
        searchContainer = document.createElement('div');
        searchContainer.id = 'searchContainer';
        searchContainer.className = 'mb-3';
        taskList.parentNode.insertBefore(searchContainer, taskList);
    }
    searchContainer.innerHTML = `
        <input type="text" id="searchInput" class="form-control" placeholder="Search tasks by name...">
    `;
    document.getElementById('searchInput').addEventListener('input', function () {
        currentPage = 1;
        renderTasks();
    });
}

function getFilteredTasks() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return tasks;
    const query = searchInput.value.trim().toLowerCase();
    if (!query) return tasks;
    return tasks.filter(task => task.text.toLowerCase().includes(query));
}

function getPaginatedTasks() {
    const filtered = getFilteredTasks();
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

    const filtered = getFilteredTasks();
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

// Insert search box on DOMContentLoaded
document.addEventListener('DOMContentLoaded', createSearchBox);

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
        span.textContent = `${task.text} (Due: ${task.date})`;
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
        editBtn.innerHTML = '<i class="bi bi-pencil h5 fs-5 mb-0"></i>';
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


function createFilterOptions() {
    let filterContainer = document.getElementById('filterContainer');
    if (!filterContainer) {
        filterContainer = document.createElement('div');
        filterContainer.id = 'filterContainer';
        filterContainer.className = 'mb-3 d-flex align-items-center justify-content-end';
        // Place filter above the input field
        const inputGroup = taskInput.closest('.input-group') || taskInput.parentNode;
        if (inputGroup && inputGroup.parentNode) {
            inputGroup.parentNode.insertBefore(filterContainer, inputGroup);
        } else {
            // fallback: above taskList
            taskList.parentNode.insertBefore(filterContainer, taskList);
        }
    }
    filterContainer.innerHTML = `
        <div class="btn-group btn-group-sm" role="group" aria-label="Task filter">
            <button type="button" class="btn btn-outline-primary active" data-filter="all">All</button>
            <button type="button" class="btn btn-outline-primary" data-filter="pending">Pending</button>
            <button type="button" class="btn btn-outline-primary" data-filter="completed">Completed</button>
        </div>
    `;
    filterContainer.querySelectorAll('button[data-filter]').forEach(btn => {
        btn.onclick = function () {
            filterContainer.querySelectorAll('button').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentPage = 1;
            renderTasks();
        };
    });
}

// Track current filter
let currentFilter = 'all';

function getFilteredTasks() {
    const searchInput = document.getElementById('searchInput');
    let filtered = tasks;
    // Filter by search
    if (searchInput) {
        const query = searchInput.value.trim().toLowerCase();
        if (query) {
            filtered = filtered.filter(task => task.text.toLowerCase().includes(query));
        }
    }
    // Filter by status
    const filterContainer = document.getElementById('filterContainer');
    if (filterContainer) {
        const activeBtn = filterContainer.querySelector('button.active[data-filter]');
        currentFilter = activeBtn ? activeBtn.getAttribute('data-filter') : 'all';
        if (currentFilter === 'pending') {
            filtered = filtered.filter(task => !task.completed);
        } else if (currentFilter === 'completed') {
            filtered = filtered.filter(task => !!task.completed);
        }
    }
    return filtered;
}

// Insert filter options on DOMContentLoaded
document.addEventListener('DOMContentLoaded', createFilterOptions);

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



function createExportDropdown() {
    let exportContainer = document.getElementById('exportContainer');
    if (!exportContainer) {
        exportContainer = document.createElement('div');
        exportContainer.id = 'exportContainer';
        exportContainer.className = 'mb-3 d-flex align-items-center justify-content-end';
        // Place export above the input field, next to filter
        const filterContainer = document.getElementById('filterContainer');
        if (filterContainer && filterContainer.parentNode) {
            filterContainer.parentNode.insertBefore(exportContainer, filterContainer.nextSibling);
        } else {
            // fallback: above taskList
            taskList.parentNode.insertBefore(exportContainer, taskList);
        }
    }
    exportContainer.innerHTML = `
        <div class="btn-group btn-group-sm ml-2 dropdown" role="group" aria-label="Export/Import">
            <button type="button" class="btn btn-outline-success dropdown-toggle btn-aesthetic" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                Export
            </button>
            <div class="dropdown-menu">
                <a class="dropdown-item" href="#" data-export="csv">CSV</a>
                <a class="dropdown-item" href="#" data-export="json">JSON</a>
                <a class="dropdown-item" href="#" data-export="txt">Plain Text</a>
                <a class="dropdown-item" href="#" data-export="xml">XML</a>
                <a class="dropdown-item" href="#" data-export="pdf">PDF</a>
            </div>
            <label type = "button" class="btn  mb-0  btn-aesthetic2">
                Import
                <input type="file" id="importFileInput" accept=".csv,.json,.txt,.xml" style="display:none;">
            </label>
        </div>
    `;

    // Export handlers
    exportContainer.querySelectorAll('[data-export]').forEach(item => {
        item.onclick = function (e) {
            e.preventDefault();
            const type = this.getAttribute('data-export');
            exportTasks(type);
        };
    });

    // Import handler
    exportContainer.querySelector('#importFileInput').addEventListener('change', function (e) {
        if (e.target.files.length) {
            importTasksFromFile(e.target.files[0]);
            e.target.value = '';
        }
    });

    // // Initialize Bootstrap dropdown if needed (for Bootstrap 5)
    // if (typeof bootstrap !== 'undefined' && typeof bootstrap.Dropdown === 'function') {
    //     const dropdownToggle = exportContainer.querySelector('.dropdown-toggle');
    //     if (dropdownToggle) {
    //         new bootstrap.Dropdown(dropdownToggle);
    //     }
    // }
}

document.addEventListener('DOMContentLoaded', createExportDropdown);

function exportTasks(type) {
    const filtered = getFilteredTasks();
    let content = '', filename = 'tasks', mime = 'text/plain';

    if (type === 'csv') {
        content = 'Task,Due Date,Completed\n' + filtered.map(t =>
            `"${t.text.replace(/"/g, '""')}","${t.date}",${t.completed ? 'Yes' : 'No'}`
        ).join('\n');
        filename += '.csv';
        mime = 'text/csv';
    } else if (type === 'json') {
        content = JSON.stringify(filtered, null, 2);
        filename += '.json';
        mime = 'application/json';
    } else if (type === 'txt') {
        content = filtered.map(t =>
            `Task: ${t.text}\nDue: ${t.date}\nCompleted: ${t.completed ? 'Yes' : 'No'}\n`
        ).join('\n');
        filename += '.txt';
    } else if (type === 'xml') {
        content = '<?xml version="1.0" encoding="UTF-8"?><tasks>' +
            filtered.map(t =>
                `<task><text>${escapeXml(t.text)}</text><date>${t.date}</date><completed>${t.completed}</completed></task>`
            ).join('') + '</tasks>';
        filename += '.xml';
        mime = 'application/xml';
    } else if (type === 'pdf') {
        exportTasksToPDF(filtered);
        return;
    }
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    triggerDownload(url, filename);
}

function escapeXml(unsafe) {
    return unsafe.replace(/[<>&'"]/g, function (c) {
        return {'<':'&lt;','>':'&gt;','&':'&amp;','\'':'&apos;','"':'&quot;'}[c];
    });
}

function triggerDownload(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}

// PDF export using jsPDF (must be included in your HTML)
function exportTasksToPDF(tasksArr) {
    if (typeof window.jspdf === 'undefined' && typeof window.jsPDF === 'undefined') {
        alert('PDF export requires jsPDF library.');
        return;
    }
    const doc = new (window.jspdf || window.jsPDF)();
    doc.setFontSize(14);
    doc.text('Tasks', 10, 15);
    let y = 25;
    tasksArr.forEach((t, i) => {
        doc.setFont(undefined, t.completed ? 'italic' : 'normal');
        doc.text(`${i + 1}. ${t.text}`, 10, y);
        doc.setFontSize(10);
        doc.text(`Due: ${t.date}   Completed: ${t.completed ? 'Yes' : 'No'}`, 12, y + 6);
        doc.setFontSize(14);
        y += 18;
        if (y > 270) { doc.addPage(); y = 20; }
    });
    doc.save('tasks.pdf');
}

// Import logic
function importTasksFromFile(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
        let imported = [];
        const ext = file.name.split('.').pop().toLowerCase();
        try {
            if (ext === 'json') {
                imported = JSON.parse(e.target.result);
            } else if (ext === 'csv') {
                imported = parseCSV(e.target.result);
            } else if (ext === 'txt') {
                imported = parseTXT(e.target.result);
            } else if (ext === 'xml') {
                imported = parseXML(e.target.result);
            } else {
                alert('Unsupported file type.');
                return;
            }
            if (!Array.isArray(imported)) throw new Error('Invalid format');
            // Merge and deduplicate by text+date
            const existing = new Set(tasks.map(t => t.text + '|' + t.date));
            imported.forEach(t => {
                if (t.text && t.date && !existing.has(t.text + '|' + t.date)) {
                    tasks.push({
                        text: t.text,
                        date: t.date,
                        completed: !!t.completed
                    });
                }
            });
            saveTasks();
            renderTasks();
            alert('Tasks imported successfully!');
        } catch (err) {
            alert('Failed to import: ' + err.message);
        }
    };
    reader.readAsText(file);
}

function parseCSV(str) {
    const lines = str.trim().split('\n');
    const arr = [];
    for (let i = 1; i < lines.length; i++) {
        const [text, date, completed] = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(s => s.replace(/^"|"$/g, '').replace(/""/g, '"'));
        arr.push({ text, date, completed: completed === 'Yes' });
    }
    return arr;
}

function parseTXT(str) {
    const arr = [];
    const blocks = str.split(/\n\s*\n/);
    blocks.forEach(block => {
        const text = (block.match(/Task:\s*(.*)/) || [])[1];
        const date = (block.match(/Due:\s*(.*)/) || [])[1];
        const completed = (block.match(/Completed:\s*(.*)/) || [])[1];
        if (text && date) arr.push({ text, date, completed: completed === 'Yes' });
    });
    return arr;
}

function parseXML(str) {
    const parser = new DOMParser();
    const xml = parser.parseFromString(str, 'application/xml');
    const arr = [];
    xml.querySelectorAll('task').forEach(node => {
        arr.push({
            text: (node.querySelector('text') || {}).textContent || '',
            date: (node.querySelector('date') || {}).textContent || '',
            completed: (node.querySelector('completed') || {}).textContent === 'true'
        });
    });
    return arr;
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

