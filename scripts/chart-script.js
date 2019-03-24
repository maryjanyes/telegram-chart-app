const app = require("../app");
const UI_MODES = require("../constants/ui-modes.constant");

module.exports = {
    sortChartData: () => {
        return app.data();
    },
    calculatePercentage: (count, elemsLen) => {
        return count / elemsLen;
    },
    switchMode() {
        console.log(UI_MODES);
    }
};
