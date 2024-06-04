const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
require("dotenv").config();
const mongoose = require("mongoose");
const routerIndex = require("./routers/index");
const morgan = require("morgan");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5001;

mongoose.set("strictQuery", true);
mongoose
  .connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true})
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

app.use(morgan("combined"));
app.use(express.json({limit: "10mb"}));
app.use(express.urlencoded({extended: true, limit: "10mb"}));

// CORS ayarlarını genişletin
app.use(
  cors({
    origin: "http://localhost:5173", // Frontend uygulamanızın adresi
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true // Gerekiyorsa kimlik doğrulama bilgilerini dahil eder
  })
);

app.use("/", routerIndex);

const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173", // Frontend uygulamanızın adresi
    methods: ["GET", "POST"]
  }
});

io.on("connection", socket => {
  console.log("Bir kullanıcı bağlandı");

  // Teklif güncelleme olayı
  socket.on("placeBid", bid => {
    console.log("Yeni teklif:", bid);
    // Teklif güncelleme logic
    io.emit("bidUpdate", {
      auctionId: bid.auctionId,
      newBid: bid.amount
    });
  });

  socket.on("disconnect", () => {
    console.log("Kullanıcı bağlantısı kesildi");
  });
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
