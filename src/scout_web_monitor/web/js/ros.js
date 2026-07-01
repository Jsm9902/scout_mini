const ros = new ROSLIB.Ros({
    url: ROSBRIDGE_URL
});

let rosConnected = false;

function updateConnectionStatus(text, color) {
    const statusText = document.getElementById("statusText");
    const statusDot = document.getElementById("statusDot");

    if (statusText) {
        statusText.innerHTML = text;
    }

    if (statusDot) {
        statusDot.style.background = color;
    }
}

ros.on("connection", function () {
    rosConnected = true;

    updateConnectionStatus("Connected", "#35c84a");

    if (typeof requestMapFromServer === "function") {
        setTimeout(function () {
            requestMapFromServer();
        }, 500);
    }

    if (typeof onRosConnected === "function") {
        onRosConnected();
    }
});

ros.on("error", function (error) {
    rosConnected = false;

    updateConnectionStatus("Error", "red");

    if (typeof onRosError === "function") {
        onRosError(error);
    }

    console.error(error);
});

ros.on("close", function () {
    rosConnected = false;

    updateConnectionStatus("Disconnected", "red");

    if (typeof onRosClosed === "function") {
        onRosClosed();
    }
});

function isRosConnected() {
    return rosConnected;
}
