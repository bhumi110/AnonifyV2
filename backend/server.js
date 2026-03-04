require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected",process.env.MONGO_URL))
  
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});