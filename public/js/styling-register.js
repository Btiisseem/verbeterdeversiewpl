
//register.ejs
window.onload = function () {
  const userEmailExists = '<%= userEmailExists %>';
  const passwordLengthError = '<%= passwordLengthError %>';
  const passwordMatchError = '<%= passwordMatchError %>';

  if (userEmailExists === 'true') {
    showAlert('E-mailadres bestaat al, gebruik een ander');
  }

  if (passwordLengthError === 'true') {
    showAlert('Wachtwoord moet minimaal 4 tekens lang zijn');
  }

  if (passwordMatchError === 'true') {
    showAlert('Wachtwoorden komen niet overeen');
  }
};

function showAlert(message) {
  alert(message);
}

//login
 document.addEventListener('DOMContentLoaded', function() {
  function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }
  const errorType = getQueryParam('error');
  if (errorType) {
    let errorMessage = '';
    switch (errorType) {
      case 'invalidCredentials':
        errorMessage = 'Wrong credentials. Please try again.';
        break;
      case 'userNotFound':
        errorMessage = 'User not found. Please register.';
        break;
      case 'serverError':
        errorMessage = 'An error occurred. Please try again.';
        break;
    }
    if (errorMessage) {
      alert(errorMessage);
    }
  }

  document.getElementById('login-form').addEventListener('submit', function(event) {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    if (!email || !password) {
      event.preventDefault();
      alert("Vul beide velden in.");
    }
  });
});


// Hamburger menu
document.addEventListener('DOMContentLoaded', function () {
  var hamburger = document.getElementById('hamburger');
  var navMenu = document.getElementById('nav-menu');

  hamburger.addEventListener('click', function () {
    navMenu.classList.toggle('open'); // Toggle the 'open' class on the menu
  });
});


function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleGoUpButton() {
  const goUpBtn = document.getElementById('goUpBtn');
  if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
    goUpBtn.style.display = 'block';
  } else {
    goUpBtn.style.display = 'none';
  }
}
window.addEventListener('scroll', toggleGoUpButton);
