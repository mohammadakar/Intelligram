const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const { init } = require("./socket");
dotenv.config();

const app = express();

app.use(express.json());

app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true
}));

// Routes
app.use('/api/auth', require("./Routes/AuthRoute"));
app.use("/api/password", require("./Routes/passwordRoute"));
app.use("/api/posts", require("./Routes/postRoutes"));
app.use("/api/users", require("./Routes/UserRoute"));
app.use('/api/stories', require('./Routes/storyRoute'));
app.use('/api/chats', require('./Routes/ChatRoutes'));
app.use('/api/notifications', require('./Routes/notificationRoutes'));
app.use('/api/admin', require('./Routes/adminRoutes'));
app.use('/api/reports', require('./Routes/reportRoutes'));


mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to DB"))
    .catch(err => console.log(err));

const PORT = process.env.PORT || 4500;
const server = app.listen(PORT, () => console.log(`Server is running at port ${PORT}`));

init(server);
