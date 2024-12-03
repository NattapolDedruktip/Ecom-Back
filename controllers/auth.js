const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);

    if (!email) {
      return res.status(400).json({ message: "email is require" });
    }

    if (!password) {
      return res.status(400).json({ message: "password is require" });
    }

    //step2 check email in db ?

    const user = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });

    if (user) {
      return res.status(400).json({ message: "Email already exist" });
    }

    //step3 hash password

    const hashPassword = await bcrypt.hash(password, 10);

    //step 4  register in db

    await prisma.user.create({
      data: {
        email: email,
        password: hashPassword,
      },
    });

    res.send("Register success!");
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    //step 1 check email
    console.log(email, password);

    const user = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });

    if (!user || !user.enabled) {
      return res
        .status(400)
        .json({ message: "User not found or User is not enabled" });
    }
    //step 2 check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Password is invalid" });
    }
    //step 3 create payload

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    //step 4 generate Token
    jwt.sign(payload, process.env.SECRET, { expiresIn: "1d" }, (err, token) => {
      if (err) {
        return res.status(500).json({ message: "server error" });
      }

      res.json({ payload, token });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error" });
  }
};

exports.currentUser = async (req, res) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        email: req.user.email,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });
    res.send(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error" });
  }
};

exports.currentAdmin = async (req, res) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        email: req.user.email,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });
    res.send(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error" });
  }
};
