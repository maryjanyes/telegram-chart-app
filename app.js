const dataJSON = require("./chart_data.json");

const app = {
    sortData: () => dataJSON.map((line) => line.columns)
};

module.exports = app;
