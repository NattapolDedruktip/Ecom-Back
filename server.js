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
// จัดการ preflight requests
app.options(
  "*",
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// router

readdirSync("./routes").map((item) => {
  console.log("Loading route:", item); // Add this line to check route
  app.use("/api", require("./routes/" + item));
});

// start server

app.listen(port, () => console.log(`server is running on port  ${port} `));
