function setGoalStatus(status) {
        const el = document.getElementById("goal_status");

        el.innerHTML = status;
        el.classList.remove(
            "status-idle",
            "status-moving",
            "status-arrived",
            "status-canceled",
            "status-waypoint",
            "status-warning",
            "status-home"
        );

        if (status.includes("HOME")) {
            el.classList.add("status-home");
        }
        else if (status.includes("ARRIVED") || status.includes("DONE")) {
            el.classList.add("status-arrived");
        }
        else if (status.includes("CANCEL")) {
            el.classList.add("status-canceled");
        }
        else if (status.includes("WAYPOINT")) {
            el.classList.add("status-waypoint");
        }
        else if (status.includes("MOVING") || status.includes("SENDING") || status.includes("RETURN")) {
            el.classList.add("status-moving");
        }
        else if (status.includes("NO_") || status.includes("REJECTED") || status.includes("NOT_AVAILABLE")) {
            el.classList.add("status-warning");
        }
        else {
            el.classList.add("status-idle");
        }
    }

function updateGoalCard() {
        if (goalPose) {
            document.getElementById("goal_x").innerHTML = goalPose.x.toFixed(2);
            document.getElementById("goal_y").innerHTML = goalPose.y.toFixed(2);
        }
        else {
            document.getElementById("goal_x").innerHTML = "-";
            document.getElementById("goal_y").innerHTML = "-";
        }

        document.getElementById("local_waypoint_count").innerHTML = waypointList.length;

        if (waypointRunning && activeWaypointIndex >= 0) {
            document.getElementById("waypoint_progress").innerHTML =
                (activeWaypointIndex + 1) + " / " + waypointList.length;

            document.getElementById("waypoint_running_text").innerHTML =
                (activeWaypointIndex + 1) + " / " + waypointList.length;
        }
        else {
            document.getElementById("waypoint_progress").innerHTML = "-";
            document.getElementById("waypoint_running_text").innerHTML = "-";
        }
    }