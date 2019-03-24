const http = require("http");
const express = require("express");
const path = require("path");
const app = express();
const appModule = require("./app");
const expressRouter = express.Router();
const appRouter = require('express').Router({mergeParams: true});
const chartScript = require("./scripts/chart-script");

appRouter.get("/data", (req, res) => {
    res.json(appModule.sortData()).status(200);
});

appRouter.get("/stats", (req, res) => {
    res.send(chartScript.sortChartData()).status(200);
});

appRouter.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "./views/index.html"));
});

expressRouter.use('/index', appRouter);

app.use("/", expressRouter);

http.createServer(app).listen(8000);
