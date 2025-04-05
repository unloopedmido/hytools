import Express from "express";
import Chalk from "chalk";
import Cors from 'cors';

const Port = process.env.SERVER_PORT || 3001;
const App = Express();

App.use(Cors({
  origin: ["http://localhost:5173"],
  credentials: true
}))
App.get("/", (req, res) => {
  res.send("Hello, World!");
})

import AuctionRoute from "./routes/auctions";
App.use("/auctions", AuctionRoute);

import UsersRoute from "./routes/users";
App.use("/users", UsersRoute);

App.listen(Port, () => {
  console.log(Chalk.green(`[SERVER]`), `Server running on port ${Port}`);
});
