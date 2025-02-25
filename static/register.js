document.addEventListener('DOMContentLoaded', () => {
    const loginsec = document.querySelector('.login-section');
    const loginlink = document.querySelector('.login-link');
    const registerlink = document.querySelector('.register-link');

    // toggle forms without navigating away
    registerlink.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent default when toggle
        loginsec.classList.add('active');
    });

    loginlink.addEventListener('click', (e) => {
        e.preventDefault(); 
        loginsec.classList.remove('active');
    });
});