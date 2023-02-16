import 'core-js/stable';
import 'regenerator-runtime/runtime';

import { displayMap } from './mapbox';
import { login, logout } from './login';
import { updateSettings } from './updateSettings';
import bookTour from './stripe';

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

if (formUserData) {
  const photoInput = document.querySelector('#photo');
  const photo = document.querySelector('.form__user-photo');

  photoInput.addEventListener('change', event => {
    if (!event.target.files) return;

    const photoFile = event.target.files[0];
    const photoURL = URL.createObjectURL(photoFile);
    const image = document.createElement('img');
    image.src = photoURL;

    const SIZE = 1000; // 500 --> Image too large
    image.addEventListener('load', event => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = SIZE;
      canvas.height = SIZE;

      context.drawImage(
        event.target,
        (event.target.width - canvas.width) / 2,
        (event.target.height - canvas.height) / 2,
        canvas.width,
        canvas.height,
        0,
        0,
        SIZE,
        SIZE
      );

      const newImageURL = context.canvas.toDataURL('image/jpeg', 90);
      photo.src = newImageURL;

      photo.addEventListener('load', () => URL.revokeObjectURL(newImageURL));

      URL.revokeObjectURL(photoURL);
    });
  });

  formUserData.addEventListener('submit', async event => {
    event.preventDefault();

    const formData = new FormData();
    const saveBtn = document.querySelector('.btn--save-info');

    const nameInput = document.querySelector('#name');
    const username = nameInput.value;

    formData.append('name', username);
    console.log(photoInput.files);
    if (photoInput.files.length) formData.append('photo', photoInput.files[0]);

    saveBtn.textContent = 'Saving...';

    await updateSettings(formData, 'name');

    saveBtn.textContent = 'Save settings';
  });
}

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

// Stripe Payment
const paymentBtn = document.querySelector('#book-tour');

if (paymentBtn)
  paymentBtn.addEventListener('click', async event => {
    console.log(event.target.dataset);
    const { tourId } = event.target.dataset;

    paymentBtn.textContent = 'Processing...';

    await bookTour(tourId);
  });
