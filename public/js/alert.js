const hideAlert = () => {
  const alert = document.querySelector('.alert');
  if (alert) alert.remove();
};

export const showAlert = (type, message) => {
  hideAlert();

  const alertMarkup = `<div class="alert alert--${type}">${message}</div>`;
  document.body.insertAdjacentHTML('afterbegin', alertMarkup);

  setTimeout(hideAlert, 3000);
};
