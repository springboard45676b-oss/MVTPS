document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const taskDate = document.getElementById('task-date');
    const taskList = document.getElementById('task-list');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // Function to save tasks to Local Storage
    const saveTasks = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    // Function to render tasks to the UI
    const renderTasks = () => {
        taskList.innerHTML = '';
        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="task-info">
                    <strong>${task.name}</strong> - Due: ${task.date}
                </span>
                <div class="task-actions">
                    <button class="complete-btn" data-index="${index}">${task.completed ? '✅' : '✔️'}</button>
                    <button class="delete-btn" data-index="${index}">❌</button>
                </div>
            `;
            if (task.completed) {
                li.classList.add('completed');
            }
            taskList.appendChild(li);
        });
    };

    // Handle form submission
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newTask = {
            name: taskInput.value,
            date: taskDate.value,
            completed: false
        };
        tasks.push(newTask);
        saveTasks();
        renderTasks();
        taskInput.value = '';
        taskDate.value = '';
    });

    // Handle task actions (complete and delete)
    taskList.addEventListener('click', (e) => {
        const index = e.target.dataset.index;
        if (e.target.classList.contains('complete-btn')) {
            tasks[index].completed = !tasks[index].completed;
            saveTasks();
            renderTasks();
        } else if (e.target.classList.contains('delete-btn')) {
            tasks.splice(index, 1);
            saveTasks();
            renderTasks();
        }
    });

    // Initial render
    renderTasks();
});