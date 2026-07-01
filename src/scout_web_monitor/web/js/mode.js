let pendingMode = null;
let modeCommandPublisher = null;
let modeMoveTimer = null;

const rosStatusDot = document.getElementById("rosStatusDot");
const rosStatusText = document.getElementById("rosStatusText");

const robotStatusDot = document.getElementById("robotStatusDot");
const robotStatusText = document.getElementById("robotStatusText");

const websocketStatusDot = document.getElementById("websocketStatusDot");
const websocketStatusText = document.getElementById("websocketStatusText");

const navModeBadge = document.getElementById("navModeBadge");
const navModeText = document.getElementById("navModeText");

const slamModeBadge = document.getElementById("slamModeBadge");
const slamModeText = document.getElementById("slamModeText");

const ros = new ROSLIB.Ros({
    url: "ws://localhost:9090"
});

function setDotConnected(dotElement, textElement, text) {
    if (!dotElement || !textElement) {
        return;
    }

    dotElement.classList.remove("disconnected");
    dotElement.classList.add("connected");
    textElement.innerHTML = text;
}

function setDotDisconnected(dotElement, textElement, text) {
    if (!dotElement || !textElement) {
        return;
    }

    dotElement.classList.remove("connected");
    dotElement.classList.add("disconnected");
    textElement.innerHTML = text;
}

function setModeBadge(badgeElement, textElement, state, text) {
    if (!badgeElement || !textElement) {
        return;
    }

    badgeElement.classList.remove(
        "standby",
        "starting",
        "ready",
        "stopping",
        "error",
        "offline"
    );

    badgeElement.classList.add(state.toLowerCase());
    textElement.innerHTML = text;
}

function setAllSystemOffline() {
    setDotDisconnected(rosStatusDot, rosStatusText, "ROS Disconnected");
    setDotDisconnected(robotStatusDot, robotStatusText, "Robot Unknown");
    setDotDisconnected(websocketStatusDot, websocketStatusText, "WebSocket Disconnected");

    setModeBadge(navModeBadge, navModeText, "offline", "OFFLINE");
    setModeBadge(slamModeBadge, slamModeText, "offline", "OFFLINE");
}

function applyModeStatus(status) {
    if (!status) {
        return;
    }

    if (status.ros === "CONNECTED") {
        setDotConnected(rosStatusDot, rosStatusText, "ROS Connected");
    }
    else {
        setDotDisconnected(rosStatusDot, rosStatusText, "ROS Disconnected");
    }

    if (status.websocket === "CONNECTED") {
        setDotConnected(websocketStatusDot, websocketStatusText, "WebSocket Connected");
    }
    else {
        setDotDisconnected(websocketStatusDot, websocketStatusText, "WebSocket Disconnected");
    }

    if (status.robot === "ONLINE") {
        setDotConnected(robotStatusDot, robotStatusText, "Robot Online");
    }
    else {
        setDotDisconnected(robotStatusDot, robotStatusText, "Robot Offline");
    }

    setModeBadge(
        navModeBadge,
        navModeText,
        status.navigation || "STANDBY",
        status.navigation || "STANDBY"
    );

    setModeBadge(
        slamModeBadge,
        slamModeText,
        status.slam || "STANDBY",
        status.slam || "STANDBY"
    );

    if (pendingMode === "navigation" && status.navigation === "READY") {
        moveToModePage("nav.html");
    }

    if (pendingMode === "slam" && status.slam === "READY") {
        moveToModePage("slam.html");
    }

    if (pendingMode === "navigation" && status.navigation === "ERROR") {
        pendingMode = null;
    }

    if (pendingMode === "slam" && status.slam === "ERROR") {
        pendingMode = null;
    }
}

function moveToModePage(page) {
    if (modeMoveTimer) {
        return;
    }

    modeMoveTimer = setTimeout(function () {
        window.location.href = page;
    }, 700);
}

function requestModeChange(mode) {
    if (!modeCommandPublisher) {
        console.error("Mode command publisher is not ready.");
        return;
    }

    pendingMode = mode;

    if (mode === "navigation") {
        setModeBadge(navModeBadge, navModeText, "starting", "STARTING");
        setModeBadge(slamModeBadge, slamModeText, "standby", "STANDBY");
    }

    if (mode === "slam") {
        setModeBadge(navModeBadge, navModeText, "standby", "STANDBY");
        setModeBadge(slamModeBadge, slamModeText, "starting", "STARTING");
    }

    const msg = new ROSLIB.Message({
        data: mode
    });

    modeCommandPublisher.publish(msg);
}

function subscribeWebMonitorStatus() {
    const statusListener = new ROSLIB.Topic({
        ros: ros,
        name: "/web_monitor/status",
        messageType: "std_msgs/msg/String"
    });

    statusListener.subscribe(function (message) {
        try {
            const status = JSON.parse(message.data);
            applyModeStatus(status);
        }
        catch (error) {
            console.error("Failed to parse /web_monitor/status:", error);
        }
    });
}

function initModePublisher() {
    modeCommandPublisher = new ROSLIB.Topic({
        ros: ros,
        name: "/web_monitor/mode_command",
        messageType: "std_msgs/msg/String"
    });
}

ros.on("connection", function () {
    setDotConnected(rosStatusDot, rosStatusText, "ROS Connected");
    setDotConnected(websocketStatusDot, websocketStatusText, "WebSocket Connected");

    setModeBadge(navModeBadge, navModeText, "standby", "STANDBY");
    setModeBadge(slamModeBadge, slamModeText, "standby", "STANDBY");

    initModePublisher();
    subscribeWebMonitorStatus();
});

ros.on("error", function () {
    setAllSystemOffline();
});

ros.on("close", function () {
    setAllSystemOffline();
});