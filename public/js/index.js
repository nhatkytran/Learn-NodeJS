import 'core-js/stable';
import 'regenerator-runtime/runtime';

import { displayMap } from './mapbox';
import { login, logout } from './login';
import { updateSettings } from './updateSettings';

// Tour
const mapBox = document.querySelector('#map');

if (mapBox) displayMap(JSON.parse(mapBox.dataset.locations));

// Login
const form = document.querySelector('.form--login');

if (form) {
  const emailInput = document.querySelector('#email');
  const passwordInput = document.querySelector('#password');

  form.addEventListener('submit', event => {
    event.preventDefault();

    const email = emailInput.value;
    const password = passwordInput.value;

    login(email, password);
  });
}

// Logout
const logoutBtn = document.querySelector('.nav__el--logout');

if (logoutBtn) logoutBtn.addEventListener('click', logout);

// Update user's name
const formUserData = document.querySelector('.form-user-data');

if (formUserData)
  formUserData.addEventListener('submit', event => {
    event.preventDefault();

    const nameInput = document.querySelector('#name');
    const username = nameInput.value;

    updateSettings({ name: username }, 'name');
  });

// Update password
const formUserSettings = document.querySelector('.form-user-password');

if (formUserSettings)
  formUserSettings.addEventListener('submit', async event => {
    event.preventDefault();

    const currentPasswordInput = document.querySelector('#password-current');
    const passwordInput = document.querySelector('#password');
    const passwordConfirmInput = document.querySelector('#password-confirm');

    const btnSavePassword = document.querySelector('.btn--save-password');

    const currentPassword = currentPasswordInput.value;
    const password = passwordInput.value;
    const passwordConfirm = passwordConfirmInput.value;

    btnSavePassword.textContent = 'Upadting...';

    await updateSettings(
      { currentPassword, password, passwordConfirm },
      'password'
    );

    btnSavePassword.textContent = 'Save password';

    currentPasswordInput.value = '';
    passwordInput.value = '';
    passwordConfirmInput.value = '';
  });
