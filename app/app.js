// CHART APP

var CHART_MODES = {
        light: "light",
        dark: "dark"
    },
    CHART_DATA_FOLDERS = [1, 2, 3, 4, 5].map((folder) => "../data/" + folder + "/overview.json"),
    CHART_TYPES = [
        "LINE_CHART",
        "DOUBLE_LINE_CHART",
        "STAKED_CHART_BAR",
        "DAILY_CHART_BAR",
        "PERCENTAGE_STAKED_CHART_BAR"
    ],
    CHART_DATA_WITH_AXIS = [0],
    Y_AXIS_LABEL_WIDTH = 140,
    Y_AXIS_LABEL_HEIGHT = 50,
    Y_AXIS_COUNT = 50,
    X_STROKE_WIDTH = 25,
    CANVAS_ELEMENTS = [],
    CHART_DATA = [];

var ChartApp = function(appDomElementSelector) {

    function appendLineChartWidgets() {

        var chartWrapper = document
            .querySelector(appDomElementSelector);

        var lineChartChips = document.createElement("div");
        lineChartChips.className = "line-chart-chips";

        var lineChartDailyStatsFrame = document.createElement("div");
        lineChartDailyStatsFrame.className = "line-chart-daily-stats-frame";

            chartWrapper.appendChild(lineChartChips);
            chartWrapper.appendChild(lineChartDailyStatsFrame);
    }

    function displayChartData(data, name, index) {

        var CHART_WRAPPER = document.createElement("div");
        CHART_WRAPPER.id = "wrapper-" + name;
        CHART_WRAPPER.width = "100%";

        var CHART_CANVAS = document.createElement("canvas");
        CHART_CANVAS.id = "chart-" + name;
        document
            .querySelector(appDomElementSelector)
            .appendChild(CHART_WRAPPER);
        document.querySelector("#wrapper-" + name)
            .appendChild(CHART_CANVAS);

        if (CHART_DATA_WITH_AXIS.indexOf(index) > -1) {
            var CHART_LINES = document.createElement("canvas");
            CHART_LINES.id = "chart-lines-" + name;
            document.querySelector("#wrapper-" + name)
                .appendChild(CHART_LINES);
        }

        var chartDOMElement = document.querySelector("#chart-" + name),
            chartLinesDOMElement = document.querySelector("#chart-lines-" + name);

        if (chartLinesDOMElement) {
            CANVAS_ELEMENTS.push(chartLinesDOMElement);
        }

        CHART_DATA.push(data);
        CANVAS_ELEMENTS.push(chartDOMElement);

        if (index === 0) {
            grabChartData(
                name,
                grabDataForLineChart,
                data,
                chartDOMElement,
                chartLinesDOMElement
            );
        }
    }

    function handleFetchedData() {
        CHART_DATA_FOLDERS.forEach((url, index) => {

            var fetchedCount = 0;
            var request = new XMLHttpRequest();
            request.open(
                "GET",
                url,
                true
            );
            request.onreadystatechange = function() {
                if (this.status === 200) {
                    fetchedCount++;
                    if (fetchedCount === 2 && request.response.length > 0) {
                        setTimeout(() => {
                            displayChartData(
                                request.response,
                                CHART_TYPES[index],
                                index
                            );
                        }, 1000);
                    }
                }
            };
            request.send();
        });
    }

    function grabChartData(
        chartType,
        handle,
        data,
        canvasElement,
        canvasAxisElement
    ) {

        var chartAppFeatures = new ChartAppFeatures();
        var ChartChips = new chartAppFeatures.chartLineChips(),
            ChartModeSwitcher = new chartAppFeatures.modeSwitcher(),
            DailyStatsFrame = new chartAppFeatures.dailyStatsFrame();

        switch (chartType) {
            case CHART_TYPES[0]: {
                handle(
                    data, {
                        chips: ChartChips,
                        modeSwitcher: ChartModeSwitcher,
                        dailyStatsFrame: DailyStatsFrame
                    },
                    canvasElement,
                    canvasAxisElement
                );
                break;
            }
            default: {
                console.log("Unable to handle <none> chart");
                break;
            }
        }
    }

    // grab chartData for lineChart
    function grabDataForLineChart(
        data,
        features,
        chartElement,
        chartAxisElement
    ) {

        var activeDayScroll = 0,
            scrollDistance = 0,
            chipStatsLabels = document.querySelector(".line-chart-chips"),
            dailyStatsFrame = document.querySelector(".line-chart-daily-stats-frame");

        chipStatsLabels.appendChild(features.chips.chips.y0.chipDOM);
        chipStatsLabels.appendChild(features.chips.chips.y1.chipDOM);

        var chartData = JSON.parse(data),
            chartTimeStamps = transformTimestampsToXLables(chartData.columns[0]),
            setDailyStats = features.dailyStatsFrame.set;

        chartData.columns[1].splice(0, 1);
        chartData.columns[2].splice(0, 1);
        chartData.dailyData = chartTimeStamps.map((timestamp, id) => {
            return {
                label: timestamp,
                joined: chartData.columns[1][id],
                left: chartData.columns[2][id]
            };
        });
        dailyStatsFrame.appendChild(setDailyStats(chartData.dailyData[0]));
        displayLineChart(chartData, chartElement, chartAxisElement);

        /* chartsWrapper.onscroll = (event) => {
            event.target.scrollLeft > currentScrollDestanation ? currentScrollDestanation = currentActiveDay++ : currentActiveDay --;
            replaceDailyStatsFrameWithAnotherDay(charts[0].dailyData[currentActiveDay]);
            currentScrollDestanation = event.target.scrollLeft;
        }; */
    }

    // find largest from yAxis mountain
    function findLargestFromYAxis(lineY1, lineY2) {

        var maxFromLineY1, maxFromLineY2, counter = -1;
        while(counter++ < lineY1.length - 1) {
            if (lineY1[counter] > lineY1[counter - 1]) {
                maxFromLineY1 = lineY1[counter];
            }
        }
        counter = 0;
        while(counter++ < lineY2.length - 1) {
            if (lineY2[counter] > lineY1[counter - 1]) {
                maxFromLineY2 = lineY2[counter];
            }
        }
        return {
            maxY1: maxFromLineY1,
            maxY2: maxFromLineY2
        };
    }

    // display data on UI
    function displayLineChart(data, lineChartDOM, lineLinesDOM) {

        var timestamps = transformTimestampsToXLables(data.columns[0]);
        var chartWidth = Y_AXIS_LABEL_WIDTH * timestamps.length + X_STROKE_WIDTH;

        var lineChartContext = lineChartDOM.getContext("2d");
        var doubledData = Math.min(data.columns[1].length / 2);
        var doubledData2 = Math.min(data.columns[2].length / 2);
        data.columns[1].splice(doubledData, doubledData);
        data.columns[2].splice(doubledData2, doubledData2);

        var maxFromYAxis = findLargestFromYAxis(data.columns[1], data.columns[2]);
        var yAxisData = transformDataToYLabels(lineChartContext, data, timestamps, maxFromYAxis);
        var yLineHeight = Y_AXIS_LABEL_HEIGHT;
        yAxisData.yLabels.forEach((labelCount) => {
            lineChartContext.fillText(labelCount, 60, yLineHeight += Y_AXIS_LABEL_HEIGHT);
        });

        function initTimeStamps(CHART_ELEMENT, timestamps, yAxisHeight) {
            CHART_ELEMENT.font = "12px Arial, serif";
            var xStrokeWidth = X_STROKE_WIDTH;
            timestamps.forEach((timestamp) => {
                CHART_ELEMENT.fillText(timestamp, xStrokeWidth += Y_AXIS_LABEL_WIDTH, yAxisHeight + 20);
            });
        }

        lineChartDOM.setAttribute("width", chartWidth);
        lineLinesDOM.setAttribute("width", chartWidth);
        lineChartDOM.setAttribute("height", yAxisData.yAxisHeight + 200);
        lineLinesDOM.setAttribute("height", yAxisData.yAxisHeight + 200);

        initTimeStamps(lineChartContext, timestamps, yAxisData.yAxisHeight);
        initLines(lineChartContext, timestamps, yAxisData.yAxisStamps);
        fillLinePointsAsLine(lineLinesDOM.getContext("2d"), data.columns[1], data.colors["y0"]);
        fillLinePointsAsLine(lineLinesDOM.getContext("2d"), data.columns[2], data.colors["y1"]);
    }

    // draw cell-lines
    function initLines(CHART_ELEMENT, timestamps, yAxisStamps) {

        yAxisStamps.forEach((axis) => {
            var xStrokeWidth = 0;
            timestamps.forEach((stamp, index) => {
                CHART_ELEMENT.strokeStyle = 'gray';
                if (index !== 0) {
                    CHART_ELEMENT.strokeRect(
                        xStrokeWidth += Y_AXIS_LABEL_WIDTH,
                        axis,
                        Y_AXIS_LABEL_WIDTH,
                        Y_AXIS_LABEL_HEIGHT
                    );
                }
            });
            CHART_ELEMENT.restore();
            xStrokeWidth = Y_AXIS_LABEL_WIDTH;
        });
    }

    // transform y data to YLabels
    function transformDataToYLabels(CHART_ELEMENT, data, timestamps, maxFromYAxis) {

        var biggestYAxisElem = maxFromYAxis.maxY1 >= maxFromYAxis.maxY2 ? maxFromYAxis.maxY1 : maxFromYAxis.maxY2;
        var yAxisStamps = [], yLabelCounts = [], counter = -1;
        while(counter++ < biggestYAxisElem) {
            if (Number.isSafeInteger(counter / Y_AXIS_COUNT)) {
                yLabelCounts.push(counter);
            }
            if (Number.isSafeInteger(counter / Y_AXIS_LABEL_HEIGHT)) {
                yAxisStamps.push(counter);
            }
        }
        data.columns[1].splice(0, 1);
        data.columns[2].splice(0, 1);
        yLabelCounts.push(yLabelCounts[yLabelCounts.length - 1] + Y_AXIS_COUNT);

        var columnsX1 = data.columns[1],
            columnsX2 = data.columns[2];
        var xStrokeWidth = 0, yLineHeight = 0;

        CHART_ELEMENT.fillStyle = "black";
        xStrokeWidth = 0;
        columnsX1.forEach((columnX1) => {
            CHART_ELEMENT.fillText(columnX1, xStrokeWidth += Y_AXIS_LABEL_WIDTH, columnX1 + Y_AXIS_LABEL_HEIGHT);
        });
        xStrokeWidth = 0;
        columnsX2.forEach((columnY2) => {
            CHART_ELEMENT.fillText(columnY2, xStrokeWidth += Y_AXIS_LABEL_WIDTH, columnY2 + Y_AXIS_LABEL_HEIGHT);
        });
        return {
            yAxisHeight: yAxisStamps.length * Y_AXIS_LABEL_HEIGHT,
            yAxisStamps: yAxisStamps,
            yLabels: yLabelCounts
        };
    }

    // transform timestamps to XLabels
    function transformTimestampsToXLables(data) {
        return data.map((timestamp, id) => {
            var label = new Date(timestamp).toUTCString().split(" ");
            return id === 0 ? null : (label[0] + label[1] + label[2] + label[3]);
        }).filter((timestamp) => timestamp);
    }

    // draw points on lines
    function fillLinePointsAsLine(CHART_ELEMENT, linePoints, lineColor) {

        var xStrokeWidth = X_STROKE_WIDTH;
        linePoints.forEach((point, id) => {
            CHART_ELEMENT.beginPath();
            CHART_ELEMENT.strokeStyle = lineColor;
            CHART_ELEMENT.moveTo(xStrokeWidth, point);
            xStrokeWidth += X_STROKE_WIDTH;
            CHART_ELEMENT.lineTo(xStrokeWidth, linePoints[id + 1]);
            CHART_ELEMENT.stroke();
        });
    }

    return {
        activate: function() {
            appendLineChartWidgets();
            handleFetchedData();
        }
    };
};

var ChartAppFeatures = function() {

    function DailyStatsFrame() {

        var buildFrameBody = (function(day) {

            var body = document.createElement("div");
            body.innerHTML = '<p class="stats-title">' + day.label + '</p>' +
                '<div class="stats-text">' +
                '<p class="stats-text-block Joined">' +
                '<span>Joined</span>' +
                '<span>' + day.joined + '</span>' +
                '</p> <p class="stats-text-block Left">' +
                '<span>Left</span>' +
                '<span>' + day.left + '</span>' +
                '</p>' +
                '</div>';
            return body;
        }).bind(this);

        var buildFrameContentByDay = (function(day) {
            if (day) {
                return this.frameDOM = '<p class="stats-title">' + day.label + '</p>' +
                    '<div class="stats-text"> <p class="stats-text-block Joined">' +
                    '<span>Joined</span><span>' + day.joined + '</span>' +
                    '</p> <p class="stats-text-block Left"> <span>Left</span> <span>' + day.left + '</span>' +
                    '</p></div>';
            }
            this.frameDOM = `<p class="stats-title">ooops</p>`;
        }).bind(this);

        return {
            set: function(day) {
                return buildFrameBody(day);
            },
            reSet: buildFrameContentByDay
        };
    }

    function ChartLineChips() {

        var _chips = {
            y0: {
                title: "Joined",
                chipDOM: buildChipDOM({
                    tag: "div",
                    text: "Joined",
                    className: "label-chip chip-joined"
                })
            },
            y1: {
                title: "Left",
                chipDOM: buildChipDOM({
                    tag: "div",
                    text: "Left",
                    className: "label-chip chip-left"
                })
            }
        };

        function buildChipDOM({ tag, className, text }) {
            const elem = document.createElement(tag);
            elem.className = className;
            elem.innerHTML = '<div class="chip-circle ' + text + '"></div><p class="chip-title">' + text + '</p>';
            return elem;
        }

        return {
            chips: _chips
        };
    }

    function ModeSwitcher() {

        var _modes;

        var set = (function(appWrapperDOM) {

            _modes = {
                night: {
                    title: CHART_MODES["night"],
                    switch: function() {
                        appWrapperDOM.style.backgroundColor = "black";
                    }
                },
                light: {
                    title: CHART_MODES["light"],
                    switch: () => {
                        appWrapperDOM.style.backgroundColor = "whitesmoke";
                    }
                }
            };
            this.prototype.activeMode = CHART_MODES["light"];
            var _domSwitchLink = document.querySelector("#link-switcher");
            _domSwitchLink.innerText = 'Switch to ' +  _modes.night.title;
            _domSwitchLink.addEventListener("click", () => {
                toggleMode();
            });
        }).bind(this);

        var toggleMode = (function toggleMode() {
            this.prototype.activeMode === CHART_MODES["light"] ? (() => {
                _modes.night.switch();
                this.prototype.activeMode = CHART_MODES["night"];
            })() : (() => {
                _modes.light.switch();
                this.prototype.activeMode = CHART_MODES["light"]
            })()
        }).bind(this);

        return {
            set: set,
            toggleMode: toggleMode
        };
    }

    return {
        dailyStatsFrame: DailyStatsFrame,
        modeSwitcher: ModeSwitcher,
        chartLineChips: ChartLineChips
    };
};
