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
        $('#event-form').toggle(); 
        calendar.render();  // Render the calendar
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
$('#addTaskBtn').on('click', addTask); 
    $('#todo-icon').on('click', function() {
        $('#todo-container').show(); // Show to-do list
        $('#calendar-container').hide(); 
        $('#expense-container').hide();
        $('#event-form').hide(); 
        loadTasks(); 
    });
    
    function addTask() {
        const input = document.getElementById('newTaskInput');
        const taskText = input.value.trim();
    
        if (taskText === '') return; // Prevent adding empty tasks
    
        saveTaskToLocalStorage(taskText); // Save task to localStorage
        addTaskToDOM(taskText); 
    
        input.value = ''; // Clear input field
    }
    
    function addTaskToDOM(taskText) {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="task-text">${taskText}</span>
            <button class="delete-btn" aria-label="Delete task">X</button>
        `;
        document.getElementById('taskList').appendChild(li);
    }
    
    document.getElementById('taskList').addEventListener('click', function(event) {
        if (event.target.classList.contains('delete-btn')) {
            removeTask(event.target);
        }
    });
    
    window.removeTask = function(button) { // Make removeTask globally accessible
        const taskText = button.parentElement.childNodes[0].textContent.trim();
        removeTaskFromLocalStorage(taskText); // Remove task from localStorage
        button.parentElement.remove();
    };
    
    function saveTaskToLocalStorage(taskText) {
        const tasks = getTasksFromLocalStorage();
        tasks.push({ text: taskText }); 
        localStorage.setItem('tasks', JSON.stringify(tasks)); // Save updated tasks to localStorage
    }
    
    function removeTaskFromLocalStorage(taskText) {
        let tasks = getTasksFromLocalStorage();
        tasks = tasks.filter(task => task.text !== taskText); // Filter out the removed task
        localStorage.setItem('tasks', JSON.stringify(tasks)); 
    }
    
    function getTasksFromLocalStorage() {
        return JSON.parse(localStorage.getItem('tasks')) || []; // Retrieve tasks from localStorage
    }
    
    // Load tasks from localStorage when the page loads
    function loadTasks() {
        const tasks = getTasksFromLocalStorage();
        tasks.forEach(task => {
            addTaskToDOM(task.text);
        });
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
            updateLocalStorage(); // Update local storage with the new expense
            expenseForm.reset(); // Clear the input fields
        });
    
        // Load expenses on page load
        loadExpenses();
    });