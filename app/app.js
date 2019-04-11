// CHART APP

function FetchData() {

    const dataToFetch = [];
    const DATA_FOLDERS = [1, 2, 3, 4, 5];
    DATA_FOLDERS.forEach((folder) => {
        dataToFetch.push(fetch(`../data/${folder}/overview.json`));
    });

    return Promise.all(dataToFetch);
}

const ChartApp = function(appDomElementSelector) {

    const CHART_TYPES = [
        "LINE_CHART",
        "DOUBLE_LINE_CHART",
        "STAKED_CHART_BAR",
        "DAILY_CHART_BAR",
        "PERCENTAGE_STAKED_CHART_BAR"
    ];
    const CANVAS_ELEMENTS = [];

    function displayChartData({ dataset, name }) {

        const CHART_CANVAS = document.createElement("canvas");
        CHART_CANVAS.id = name;
        document
            .querySelector(appDomElementSelector)
            .appendChild(CHART_CANVAS);
        CANVAS_ELEMENTS.push(document.querySelector(`#${name}`).getContext("2d"));
        CANVAS_ELEMENTS.forEach((chartElement) => {
            chartElement.fillStyle = "red";
            chartElement.fillRect(100, 0, 100, 100);
        });
    }

    function handleFetchedData(data) {
        data.forEach((dataPerChart, dataPerChartIndex) => {
            dataPerChart.json().then((dataset) => {
                displayChartData({
                    dataset,
                    name: CHART_TYPES[dataPerChartIndex]
                });
            });
        });
    }

    return {
        activate: () => {
            FetchData().then((data) => {
                handleFetchedData(data);
            });
        }
    };
};
