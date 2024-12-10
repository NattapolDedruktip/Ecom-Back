// import

const express = require("express");
const app = express();
const port = 8000;
const morgan = require("morgan");
const cors = require("cors");
const { readdirSync } = require("fs");

// middleware
app.use(morgan("dev"));
app.use(express.json({ limit: "20mb" }));
// หรือระบุ Origin เฉพาะที่อนุญาต
app.use(
  cors({
    origin: "https://ecom-back-qrz9.vercel.app", // เปลี่ยนเป็น URL ของ frontend
    methods: ["GET", "POST", "PUT", "DELETE"], // ระบุวิธีการที่อนุญาต
    credentials: true, // ใช้ในกรณีมี cookies หรือ authorization header
  })
);

// router

readdirSync("./routes").map((item) => {
  console.log("Loading route:", item); // Add this line to check route
  app.use("/api", require("./routes/" + item));
});

// start server

app.listen(port, () => console.log(`server is running on port  ${port} `));
