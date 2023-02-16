import axios from 'axios';
import { showAlert } from './alert.js';

const stripe = Stripe(
  'pk_test_51MbOACI8uPqtxRMLapqSYKjWHI0tKVlNTHmbRyNTS4hYvUFByFqlwevrAFo8y8bBXdGwcwIV1odoal2DjrA7bRzo007ZwXM2hW'
);

const bookTour = async tourId => {
  try {
    const res = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
    );
    console.log(res);
    const session = res.data.session;

    await stripe.redirectToCheckout({
      sessionId: session.id,
    });
  } catch (error) {
    console.error(error);
    showAlert('error', 'Something went wrong!');
  }
};

export default bookTour;
