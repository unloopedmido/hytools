import Express from "express";
import Chalk from "chalk";

const Port = process.env.SERVER_PORT || 3001;
const App = Express();

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
