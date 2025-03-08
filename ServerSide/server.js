const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
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

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to DB"))
    .catch(err => console.log(err));

const PORT = process.env.PORT || 4500;
app.listen(PORT, () => console.log(`Server is running at port ${PORT}`));
