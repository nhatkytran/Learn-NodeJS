import axios from 'axios';

import { showAlert } from './alert';

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/login',
      data: { email, password },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Log in successfully!');
      setTimeout(() => location.assign('/'), 3000);
    }
  } catch (error) {
    showAlert('error', error.response.data.message || 'Something went wrong!');
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:3000/api/v1/users/logout',
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logged out successfully!');
      setTimeout(() => location.reload(true), 3000);
    }
  } catch (_) {
    showAlert('error', 'Something went wrong!');
  }
};
