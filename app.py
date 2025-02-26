from flask import Flask, render_template, url_for, request, redirect, flash,session,jsonify
import sqlite3

# Initialize the Flask application
app = Flask(__name__)
app.secret_key = 'your_secret_key'  # Required for session management and flashing messages
events=[]

# Initialize the database
def init_db():
    conn = sqlite3.connect("user_1.db")
    c = conn.cursor()
    c.execute(
        """CREATE TABLE IF NOT EXISTS logindata(
        full_name text,
        email text,
        password text)"""
    )
    conn.commit()
    conn.close()

init_db()

@app.route("/")
def home():
    return redirect('/login')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        
        # Check if the user exists and the password matches
        conn = sqlite3.connect("user_1.db")
        c = conn.cursor()
        c.execute("SELECT full_name,password FROM logindata WHERE email = ?", (email,))
        user = c.fetchone()
        conn.close()

        if user and user[1] == password:  # Check if user exists and password matches
            session['full_name']=user[0]
            return redirect(url_for('dashboard'))  # Redirect to a dashboard 
        else:
            flash('Invalid email or password')  
    return render_template('register.html', title='Login', form_type='login', form_title='Sign In', form_action='login', button_text='Login')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        full_name = request.form['full_name']
        email = request.form['email']
        password = request.form['password']
        repeat_password = request.form['repeat_password']
        
        # Basic validation
        conn = sqlite3.connect("user_1.db")
        c = conn.cursor()
        c.execute("SELECT email FROM logindata WHERE email = ?", (email,))
        existing_user = c.fetchone()

        if existing_user:
            flash('Email already registered')
        elif password != repeat_password:
            flash('Passwords do not match')
        else:
            c.execute("INSERT INTO logindata (full_name, email, password) VALUES (?, ?, ?)", (full_name, email, password))
            conn.commit()
            flash('Registration successful! Please log in.')
            return redirect(url_for('login'))  # Redirect to login page 
        conn.close()
    return render_template('register.html', title='Register', form_type='register', form_title='Register', form_action='register', button_text='Register')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route('/events', methods=['GET'])
def get_events():
    return jsonify(events)  

@app.route('/events', methods=['POST'])
def add_event():
    event = request.json  # Get the event data from the request
    if event:  # Check if event data is provided
        events.append(event)  # Save the event
        return '', 201  
    return jsonify({"error": "Invalid event data"}), 400 

@app.route('/add_expense', methods=['POST'])
def add_expense():
    expense_name = request.form['expense_name']
    amount = request.form['amount']
    date = request.form['date']
    return redirect(url_for('dashboard.html'))

    
if __name__ == '__main__':
    app.run(debug=True)