const prisma = require("../config/prisma");
const stripe = require("stripe")(
  "sk_test_51QT1JQLeQxBsRvB5k05Ps0xFiwYE8R01MBbbl7J6F9E0urgaQaLtNAAlYs7gHoZvKvuUSUQ45mj4a9OvCw1xeKMY00UbSSFKUt"
);

exports.payment = async (req, res) => {
  try {
    const cart = await prisma.cart.findFirst({
      where: {
        orderedById: req.user.id,
      },
    });

    const amountTHB = cart.cartTotal * 100;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountTHB,
      currency: "thb",
      // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error" });
  }
};
