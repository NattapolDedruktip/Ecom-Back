const prisma = require("../config/prisma");
const cloudinary = require("cloudinary").v2;

exports.create = async (req, res) => {
  try {
    const { title, description, price, quantity, images, categoryId } =
      req.body;
    console.log(title, description, price, quantity, images, categoryId);

    const product = await prisma.product.create({
      data: {
        title: title,
        description: description,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        categoryId: parseInt(categoryId),
        // later
        images: {
          create: images.map((item) => ({
            asset_id: item.asset_id,
            public_id: item.public_id,
            url: item.url,
            secure_url: item.secure_url,
          })),
        },
      },
    });
    res.send(product);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error" });
  }
};

exports.list = async (req, res) => {
  try {
    const { count } = req.params;
    // console.log(typeof count);

    const products = await prisma.product.findMany({
      take: parseInt(count),
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        images: true,
      },
    });
    res.send(products);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error" });
  }
};

exports.read = async (req, res) => {
  try {
    const { id } = req.params;

    const products = await prisma.product.findMany({
      where: {
        id: Number(id),
      },
      include: {
        category: true,
        images: true,
      },
    });

    res.send(products);
  } catch (err) {
    console.error(err); // Improved logging for debugging
    res.status(500).json({ message: "Server error" });
  }
};

exports.update = async (req, res) => {
  try {
    const { title, description, price, quantity, images, categoryId } =
      req.body;
    console.log(title, description, price, quantity, images, categoryId);

    //delete old photo before update
    await prisma.image.deleteMany({
      where: {
        productId: Number(req.params.id),
      },
    });

    const product = await prisma.product.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        title: title,
        description: description,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        categoryId: parseInt(categoryId),
        // later
        images: {
          create: images.map((item) => ({
            asset_id: item.asset_id,
            public_id: item.public_id,
            url: item.url,
            secure_url: item.secure_url,
          })),
        },
      },
    });
    res.send(product);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error" });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({
      where: {
        id: Number(id),
      },
    });
    res.send("delete success!");

    // delete photo
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error" });
  }
};

exports.listby = async (req, res) => {
  try {
    const { sort, order, limit } = req.body;
    // console.log(sort, order, limit);

    const products = await prisma.product.findMany({
      take: limit,
      orderBy: {
        [sort]: order,
      },
      include: {
        category: true,
      },
    });
    res.send(products);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error" });
  }
};

//search filter

const handleQuery = async (req, res, query) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        title: {
          contains: query,
        },
      },
      include: {
        category: true,
        images: true,
      },
    });
    res.send(products);
  } catch (err) {
    console.log(err);
    res.status(500).send("search Error");
  }
};

const handlePrice = async (req, res, priceRange) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        price: {
          gte: priceRange[0],
          lte: priceRange[1],
        },
      },
      include: {
        category: true,
        images: true,
      },
    });
    res.send(products);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

const handleCategory = async (req, res, categoryId) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        categoryId: {
          in: categoryId.map((id) => Number(id)),
        },
      },
      include: {
        category: true,
        images: true,
      },
    });
    res.send(products);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.searchFilters = async (req, res) => {
  try {
    const { query, category, price } = req.body;

    if (query) {
      console.log("query", query);
      await handleQuery(req, res, query);
    }

    if (category) {
      console.log("category", category);
      await handleCategory(req, res, category);
    }

    if (price) {
      console.log("price", price);
      await handlePrice(req, res, price);
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error" });
  }
};

//image upload

cloudinary.config({
  cloud_name: process.env.CLOUNDINARY_CLOUD_NAME,
  api_key: process.env.CLOUNDINARY_API_KEY,
  api_secret: process.env.CLOUNDINARY_API_SECRET,
});

exports.createImages = async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.body.image, {
      public_id: `packEcom-${Date.now()}`,
      resource_type: "auto",
      folder: "Ecom2024",
    });
    res.send(result);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.removeImages = async (req, res) => {
  try {
    const { public_id } = req.body;
    console.log("public_id", public_id);
    cloudinary.uploader.destroy(public_id, (result) => {
      res.send("remove image success");
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};
