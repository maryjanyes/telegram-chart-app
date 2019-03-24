const http = require("http");
const express = require("express");
const app = express();
const appModule = require("./app");
const expressRouter = express.Router();
const appRouter = require('express').Router({mergeParams: true});

appRouter.get("/data", (req, res) => {
    res.json(appModule.sortData());
});

expressRouter.use('/index', appRouter);

app.use("/", expressRouter);

http.createServer(app).listen(8000);