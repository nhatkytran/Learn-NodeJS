const Stripe = require('stripe');

const { Tour, Booking } = require('./../models');
const { AppError, catchAsync } = require('./../utils');

const { STRIPE_SECRET_KEY } = process.env;

exports.getCheckoutSession = catchAsync(async (req, res) => {
  const { tourId } = req.params;

  const query = Tour.findById(tourId);
  const tour = await query;

  if (!tour) throw new AppError(`Tour not found with ID < ${tourId} >`, 404);

  const stripe = Stripe(STRIPE_SECRET_KEY);
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${tour._id}&user=${
      req.user._id
    }&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tours/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: tourId,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
          },
        },
      },
    ],
  });

  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query;

  if (!tour || !user || !price) return next();

  const query = Booking.create({ tour, user, price });
  await query;

  res.redirect(req.originalUrl.split('?')[0]);
});
