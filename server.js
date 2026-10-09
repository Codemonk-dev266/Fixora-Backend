import app from "./app.js";
import connectDB from "./src/config/mongodb.js";
import userRoute from "./src/Routes/userRouter.js";
import jobRoute from "./src/Routes/jobRoute.js";

const PORT = process.env.PORT || 5000;

connectDB();

app.get("/", (req, res) => {
  res.json("api is reachable");
});

app.use("/api/auth", userRoute);

app.use("/api/jobs", jobRoute);

app.listen(PORT, (req, res) => {
  console.log(`app is running at port ${PORT}`);
});
