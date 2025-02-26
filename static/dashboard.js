let btn=document.querySelector('#btn');
let sidebar=document.querySelector('.sidebar'); 

btn.onclick = function(){
    sidebar.classList.toggle('active')
}

// Calendar
document.addEventListener('DOMContentLoaded', function() {
    const calendarEl = document.getElementById('calendar-container');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        events: [] 
    });

    // Fetch events from the server
    fetch('/events')
    .then(response => response.json())
    .then(data => {
        data.forEach(event => {
            calendar.addEvent(event);
        });
    })
    .catch(error => {
        console.error('Error fetching events:', error);
    });

    // Hide the calendar & to-do list & expense-container initially
    $('#calendar-container').hide();
    $('#todo-container').hide();
    $('#expense-container').hide();

    $('#calendar-icon').on('click', function() {
        $('#calendar-container').show(); // Show calendar
        $('#todo-container').hide();
        $('#expense-container').hide();
        $('#event-form').show(); 
        calendar.render();  
    });

    // Handle event form submission
    $('#event-form').on('submit', function(event) {
        event.preventDefault(); // Prevent the form from submitting normally

        const title = $('#event-title').val();
        const start = $('#event-start').val();
        const end = $('#event-end').val();

        // Add the event to the calendar
        const eventData = {
            title: title,
            start: start,
            end: end || null
        };
        calendar.addEvent(eventData);

        // Sends the event to the server
        $.ajax({
            url: '/events',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(eventData),
            success: function() {
                console.log('Event saved successfully');
            },
            error: function() {
                console.error('Error saving event');
            }
        });

        // Reset the form fields
        $('#event-form')[0].reset(); 
    });


// To-Do List functionality
$(document).ready(function() {
    // Load tasks from local storage when the page loads
    loadTasks();

    $('#todo-icon').on('click', function() {
        $('#calendar-container').hide(); 
        $('#expense-container').hide(); 
        $('#todo-container').show(); 
        $('#event-form').hide(); 
    });
    $('#addTaskBtn').on('click', addTask);
        $('#taskList').on('click', '.delete-btn', function() {
            const taskText = $(this).siblings('.task-text').text();
            removeTask(taskText);
            $(this).parent().remove(); // Remove the task from the DOM
        });
        $('#taskList').on('change', '.task-checkbox', function() {
            const taskText = $(this).siblings('.task-text').text();
            toggleTaskCompletion(taskText, this.checked);
        });
    });
    
    // Function to add a task
    function addTask() {
        const input = $('#newTaskInput');
        const taskText = input.val().trim();
    
        if (taskText === '') return; // Prevent adding empty tasks
    
        // Save task to local storage
        saveTaskToLocalStorage(taskText);
        addTaskToDOM(taskText);
        input.val(''); // Clear input field
    }
    
    // Function to save task to local storage
    function saveTaskToLocalStorage(taskText) {
        const tasks = getTasksFromLocalStorage();
        tasks.push({ text: taskText, completed: false }); // Store as an object with completion state
        localStorage.setItem('tasks', JSON.stringify(tasks)); // Save updated tasks to local storage
    }
    
    // Function to get tasks from local storage
    function getTasksFromLocalStorage() {
        return JSON.parse(localStorage.getItem('tasks')) || []; // Retrieve tasks from local storage
    }
    
    // Function to load tasks from local storage
    function loadTasks() {
        const tasks = getTasksFromLocalStorage();
        tasks.forEach(task => {
            addTaskToDOM(task.text, task.completed); // Access the text and completed properties
        });
    }
    
    // Function to add a task to the DOM
    function addTaskToDOM(taskText, completed = false) {
        const checkedAttribute = completed ? 'checked' : '';
        const li = `<li>
                        <input type="checkbox" class="task-checkbox" ${checkedAttribute}>
                        <span class="task-text">${taskText}</span>
                        <button class="delete-btn">X</button>
                    </li>`;
        $('#taskList').append(li);
    }
    
    // Function to remove a task
    function removeTask(taskText) {
        let tasks = getTasksFromLocalStorage();
        tasks = tasks.filter(task => task.text !== taskText); // Filter out the removed task
        localStorage.setItem('tasks', JSON.stringify(tasks)); // Save updated tasks to local storage
    }
    
    // Function to toggle task completion
    function toggleTaskCompletion(taskText, isCompleted) {
        let tasks = getTasksFromLocalStorage();
        tasks = tasks.map(task => {
            if (task.text === taskText) {
                return { ...task, completed: isCompleted }; // Update the completion state
            }
            return task;
        });
        localStorage.setItem('tasks', JSON.stringify(tasks)); // Save updated tasks to local storage
    }

// Show Expense Tracker
        $('#expense-icon').on('click', function() {
            $('#expense-container').show(); // Show expense tracker
            $('#calendar-container').hide(); 
            $('#todo-container').hide();
            $('#event-form').hide(); 
        });
    
        // Expense Tracker Functionality
        const expenseForm = document.getElementById("expense-form");
        const expenseList = document.getElementById("expenseList"); 
        const totalAmount = document.getElementById("total-amount");
        let total = 0;
    
        const loadExpenses = () => {
            const savedExpenses = JSON.parse(localStorage.getItem("expenses")) || [];
            savedExpenses.forEach(expense => {
                addExpenseToDOM(expense.title, expense.amount, expense.date);
            });
        };
    
        // Function to add expense to DOM and update total
        const addExpenseToDOM = (name, amount, date) => {
            const listItem = document.createElement("li");
            listItem.className = "expense-item"; // Add a class for styling if needed
    
            // Create a span for the expense details
            const expenseDetails = document.createElement("span");
            expenseDetails.textContent = `${name} - $${amount.toFixed(2)} on ${date}`;
    
            //  delete button
            const deleteButton = document.createElement("button");
            deleteButton.className = "delete-btn";
            deleteButton.textContent = "Delete";
    
            // Append the details and button to the list item
            listItem.appendChild(expenseDetails);
            listItem.appendChild(deleteButton);
            expenseList.appendChild(listItem);
    
            total += amount;
            totalAmount.textContent = total.toFixed(2); // Update total display
    
            //  delete functionality
            deleteButton.addEventListener("click", () => {
                total -= amount; // Deduct amount from total
                totalAmount.textContent = total.toFixed(2); // Update total display
                listItem.remove(); 
                updateLocalStorage(); // Update local storage after deletion
            });
        };
    
        // Update local storage with current expenses
        const updateLocalStorage = () => {
            const expenses = [];
            document.querySelectorAll(".expense-item").forEach(item => {
                const expenseDetails = item.querySelector("span").textContent;
                const [title, amountWithDate] = expenseDetails.split(" - $");
                const [amount, date] = amountWithDate.split(" on ");
                expenses.push({ title, amount: parseFloat(amount), date });
            });
            localStorage.setItem("expenses", JSON.stringify(expenses));
        };
    
        expenseForm.addEventListener("submit", (e) => {
            e.preventDefault(); // Prevent the form from submitting normally
    
            const name = document.getElementById("expense-title").value;
            const amount = parseFloat(document.getElementById("expense-amount").value);
            const date = document.getElementById("expense-date").value;
    
            addExpenseToDOM(name, amount, date); 
            updateLocalStorage();
            expenseForm.reset(); // Clear the input fields
        });
    
        // Load expenses on page load
        loadExpenses();
    });