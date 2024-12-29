// navbar.js
fetch('/navbar.html')
    .then(response => response.text())
    .then(html => {
        document.querySelector('nav').innerHTML = html;
        updateNavbar();
        document.getElementById('logoutLink').addEventListener('click', logout);
    });

function updateNavbar() {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');

    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        if (!token && (link.getAttribute('href') === '/cart.html' || link.getAttribute('href') === '/orders-history.html' || link.getAttribute('href') === '/dashboard.html')) {
            link.style.display = 'none';
        } else {
            link.style.display = 'inline-block';
        }
    });

    const logoutLink = document.getElementById('logoutLink');
    logoutLink.style.display = token ? 'inline-block' : 'none';
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    window.location.href = '/';
}