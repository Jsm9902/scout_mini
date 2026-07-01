const isNavigationPage = window.location.pathname.includes("nav.html");

function voltageToPercent(voltage) {
    const minV = 24.0;
    const maxV = 27.9;

    let percent = ((voltage - minV) / (maxV - minV)) * 100.0;

    percent = Math.max(0, Math.min(100, percent));

    return Math.round(percent);
}

function updateBatteryColor(voltage) {
    const batteryValue = document.getElementById("batteryValue");

    if (!batteryValue) {
        return;
    }

    batteryValue.classList.remove(
        "battery-good",
        "battery-warn",
        "battery-low"
    );

    const percent = voltageToPercent(voltage);

    const batteryPercent = document.getElementById("battery_percent");
    const cell1 = document.getElementById("batteryCell1");
    const cell2 = document.getElementById("batteryCell2");
    const cell3 = document.getElementById("batteryCell3");

    if (batteryPercent) {
        batteryPercent.innerHTML = percent;
    }

    if (!cell1 || !cell2 || !cell3) {
        return;
    }

    cell1.style.background = "#d9d9d9";
    cell2.style.background = "#d9d9d9";
    cell3.style.background = "#d9d9d9";

    if (voltage >= 27.0) {
        batteryValue.classList.add("battery-good");

        cell1.style.background = "#3cb44a";
        cell2.style.background = "#3cb44a";
        cell3.style.background = "#3cb44a";
    }
    else if (voltage >= 26.5) {
        batteryValue.classList.add("battery-warn");

        cell1.style.background = "#f59e0b";
        cell2.style.background = "#f59e0b";
    }
    else {
        batteryValue.classList.add("battery-low");

        cell1.style.background = "#dc2626";
    }
}

const batteryListener = new ROSLIB.Topic({
    ros: ros,
    name: "/scout_status",
    messageType: "scout_msgs/msg/ScoutStatus"
});

batteryListener.subscribe(function (message) {
    const voltage = Number(message.battery_voltage);
    const battery = document.getElementById("battery");

    if (battery) {
        battery.innerHTML = voltage.toFixed(1);
    }

    updateBatteryColor(voltage);
});

const odomListener = new ROSLIB.Topic({
    ros: ros,
    name: "/odom",
    messageType: "nav_msgs/msg/Odometry"
});

odomListener.subscribe(function (message) {
    const odomX = document.getElementById("odom_x");
    const odomY = document.getElementById("odom_y");
    const linearVelocity = document.getElementById("linear_velocity");
    const angularVelocity = document.getElementById("angular_velocity");

    if (odomX) {
        odomX.innerHTML = Number(message.pose.pose.position.x).toFixed(2);
    }

    if (odomY) {
        odomY.innerHTML = Number(message.pose.pose.position.y).toFixed(2);
    }

    if (linearVelocity) {
        linearVelocity.innerHTML = Number(message.twist.twist.linear.x).toFixed(2);
    }

    if (angularVelocity) {
        angularVelocity.innerHTML = Number(message.twist.twist.angular.z).toFixed(2);
    }
});

if (isNavigationPage) {
    const amclListener = new ROSLIB.Topic({
        ros: ros,
        name: "/amcl_pose",
        messageType: "geometry_msgs/msg/PoseWithCovarianceStamped"
    });

    amclListener.subscribe(function (message) {
        const pose = message.pose.pose;

        robotPose = {
            x: pose.position.x,
            y: pose.position.y,
            yaw: getYawFromQuaternion(pose.orientation)
        };

        if (typeof checkGoalArrived === "function") {
            checkGoalArrived();
        }

        if (typeof drawMap === "function") {
            drawMap();
        }
    });

    const pathListener = new ROSLIB.Topic({
        ros: ros,
        name: "/plan",
        messageType: "nav_msgs/msg/Path"
    });

    pathListener.subscribe(function (message) {
        globalPath = [];

        for (let i = 0; i < message.poses.length; i++) {
            globalPath.push({
                x: message.poses[i].pose.position.x,
                y: message.poses[i].pose.position.y
            });
        }

        if (typeof drawMap === "function") {
            drawMap();
        }
    });
}
