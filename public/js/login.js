import axios from 'axios';

import { showAlert } from './alert';

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: { email, password },
      timeout: 10 * 1000,
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Log in successfully!');
      setTimeout(() => location.assign('/'), 3000);
    }
  } catch (error) {
    if (error.name === 'AxiosError' && error.code === 'ERR_NETWORK')
      return showAlert(
        'error',
        'Something went wrong! Check your network connection and try again.'
      );

    showAlert('error', error.response.data.message || 'Something went wrong!');
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logged out successfully!');
      setTimeout(() => location.reload(true), 3000);
    }
  } catch (_) {
    showAlert('error', 'Something went wrong!');
  }
};
