import axios from 'axios';
import { showAlert } from './alert.js';

const stripe = Stripe(
  'pk_test_51MbOACI8uPqtxRMLapqSYKjWHI0tKVlNTHmbRyNTS4hYvUFByFqlwevrAFo8y8bBXdGwcwIV1odoal2DjrA7bRzo007ZwXM2hW'
);

const bookTour = async tourId => {
  try {
    const res = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    const { session } = res.data;

    await stripe.redirectToCheckout({
      sessionId: session.id,
    });
  } catch (error) {
    console.error(error);
    showAlert('error', 'Something went wrong!');
  }
};

export default bookTour;
