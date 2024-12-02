const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");
const e = require("express");

exports.authCheck = async (req, res, next) => {
  try {
    const headerToken = req.headers.authorization;
    console.log(headerToken);

    if (!headerToken) {
      return res.status(401).json({ message: "No Token , Authorization" });
    }

    const token = headerToken.split(" ")[1];
    console.log(token);

    const decode = jwt.verify(token, process.env.SECRET);
    // console.log(decode);

    req.user = decode;

    const user = await prisma.user.findFirst({
      where: {
        email: req.user.email,
      },
    });

    console.log(user);

    if (!user.enabled) {
      return res.status(400).json({ message: "This account can not access" });
    }
    console.log("hello middleware");
    next();
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Token invalid" });
  }
};

exports.adminCheck = async (req, res, next) => {
  try {
    const { email } = req.user;
    console.log("admin check", email);
    const adminUser = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });

    if (!adminUser || adminUser.role !== "admin") {
      return res.status(403).json({ message: "Access denied : Admin only" });
    }

    console.log(adminUser);
    next();
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Error Admin access denied " });
  }
};
