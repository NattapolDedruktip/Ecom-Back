const prisma = require("../config/prisma");

exports.listUsers = async (req, res) => {
  try {
    const user = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        enabled: true,
        address: true,
      },
    });
    res.send(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error" });
  }
};

exports.changeStatus = async (req, res) => {
  try {
    const { id, enabled } = req.body;
    console.log(id, enabled);
    const user = await prisma.user.update({
      where: {
        id: Number(id),
      },
      data: {
        enabled: enabled,
      },
    });
    res.send({ massage: "Change status success" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error" });
  }
};

exports.changeRole = async (req, res) => {
  try {
    const { id, role } = req.body;
    console.log(id, role);
    const user = await prisma.user.update({
      where: {
        id: Number(id),
      },
      data: {
        role: role,
      },
    });
    res.send({ message: "Change role success" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error" });
  }
};

exports.userCart = async (req, res) => {
  try {
    const { cart } = req.body;
    console.log(cart);
    console.log(req.user.id);

    const user = await prisma.user.findFirst({
      where: {
        id: Number(req.user.id),
      },
    });

    console.log(user);

    //check quantity
    for (const item of cart) {
      //   console.log(item);
      const product = await prisma.product.findUnique({
        where: {
          id: item.id,
        },
        select: {
          quantity: true,
          title: true,
        },
      });

      //   console.log(item);
      //   console.log(product);

      if (!product || item.count > product.quantity) {
        return res.status(400).json({
          message: `sorry ${product?.title} in inventory is not enough`,
        });
      }
    }

    //delete old cart item first

    await prisma.productOnCart.deleteMany({
      where: {
        cart: {
          orderedById: user.id,
        },
      },
    });

    //delete old cart

    await prisma.cart.deleteMany({
      where: {
        orderedById: user.id,
      },
    });

    //prepare products from cart

    let products = cart.map((item) => ({
      productId: item.id,
      count: item.count,
      price: item.price,
    }));

    //find total
    let cartTotal = products.reduce(
      (prev, curr) => prev + curr.price * curr.count,
      0
    );

    console.log(products);

    console.log(cartTotal);

    // new cart , just this one they put to productInCart in the same time

    const newCart = await prisma.cart.create({
      data: {
        products: {
          create: products, //loop item in
        },
        cartTotal: cartTotal,
        orderedById: user.id,
      },
    });

    console.log("newCart", newCart);

    res.send("Add Cart Ok!");
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error" });
  }
};

exports.getUserCart = async (req, res) => {
  try {
    const cart = await prisma.cart.findFirst({
      where: {
        orderedById: Number(req.user.id),
      },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    console.log("cart", cart);

    res.json({
      product: cart.products,
      cartTotal: cart.cartTotal,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error" });
  }
};

exports.emptyCart = async (req, res) => {
  try {
    const cart = await prisma.cart.findFirst({
      where: {
        orderedById: Number(req.user.id),
      },
    });

    if (!cart) {
      return res.status(400).json({ message: "no cart" });
    }

    await prisma.productOnCart.deleteMany({
      where: {
        cartId: cart.id,
      },
    });

    const result = await prisma.cart.deleteMany({
      where: {
        orderedById: Number(req.user.id),
      },
    });

    console.log(result);

    res.json({
      message: "Cart Empty Success",
      deletedCount: result.count,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error" });
  }
};

exports.saveAddress = async (req, res) => {
  try {
    const { address } = req.body;
    console.log(address);

    const addressUser = await prisma.user.update({
      where: {
        id: Number(req.user.id),
      },
      data: {
        address: address,
      },
    });
    res.json({
      ok: true,
      message: "Address update Success",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error" });
  }
};

exports.saveOrder = async (req, res) => {
  try {
    //step 0 check stripe
    const { id, amount, status, currency } = req.body.paymentIntent;
    //step1 get user cart
    const userCart = await prisma.cart.findFirst({
      where: {
        orderedById: Number(req.user.id),
      },
      include: {
        products: true,
      },
    });

    // console.log(userCart);

    if (!userCart || userCart.products.length === 0) {
      return res.status(400).json({ message: "you cart is empty" });
    }

    //create new order
    const amountTHB = Number(amount) / 100;

    const order = await prisma.order.create({
      data: {
        products: {
          create: userCart.products.map((item) => ({
            productId: item.productId,
            count: item.count,
            price: item.price,
          })),
        },
        orderedBy: {
          connect: {
            id: req.user.id,
          },
        },
        cartTotal: userCart.cartTotal,
        stripePaymentId: id,
        amount: amountTHB,
        status: status,
        currency: currency,
      },
    });
    console.log(order);

    //update Product
    const update = userCart.products.map((item) => ({
      where: {
        id: item.productId,
      },
      data: {
        quantity: {
          decrement: item.count,
        },
        sold: {
          increment: item.count,
        },
      },
    }));

    console.log(update);

    await Promise.all(update.map((updated) => prisma.product.update(updated)));

    //delete cart
    await prisma.cart.deleteMany({
      where: {
        orderedById: Number(req.user.id),
      },
    });

    res.json({
      ok: true,
      order,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error" });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        orderedById: Number(req.user.id),
      },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });
    console.log(orders);

    if (orders.length === 0) {
      return res.status(400).json({ message: "No orders" });
    }
    res.json({ ok: true, orders });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error" });
  }
};
