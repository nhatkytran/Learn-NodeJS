import axios from 'axios';

import { showAlert } from './alert';

export const updateSettings = async (data, type) => {
  try {
    let urlEndpoint;
    if (type === 'name') urlEndpoint = 'me';
    if (type === 'password') urlEndpoint = 'updatePassword';

    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/users/${urlEndpoint}`,
      data,
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Update successfully!');
    } else showAlert('error', res.data.message);
  } catch (error) {
    showAlert('error', error.response.data.message || 'Something went wrong!');
  }
};
