const waypointCountListener = new ROSLIB.Topic({
        ros: ros,
        name: '/web_waypoint_count',
        messageType: 'std_msgs/msg/Int32'
    });

    waypointCountListener.subscribe(function (message) {
        document.getElementById("server_waypoint_count").innerHTML = message.data;
    });

const waypointAddPublisher = new ROSLIB.Topic({
        ros: ros,
        name: '/web_waypoint_add',
        messageType: 'geometry_msgs/msg/PoseStamped'
    });

    const waypointStartPublisher = new ROSLIB.Topic({
        ros: ros,
        name: '/web_waypoint_start',
        messageType: 'std_msgs/msg/Empty'
    });

    const waypointClearPublisher = new ROSLIB.Topic({
        ros: ros,
        name: '/web_waypoint_clear',
        messageType: 'std_msgs/msg/Empty'
    });

function toggleWaypointAddMode() {
        waypointAddMode = !waypointAddMode;

        initialPoseMode = false;
        initialPoseStep = 0;
        initialPoseTemp = null;

        homePoseMode = false;
        homePoseStep = 0;
        homePoseTemp = null;

        document.getElementById("initialPoseBtn").classList.remove("active");
        document.getElementById("homePoseBtn").classList.remove("active");

        const btn = document.getElementById("waypointAddBtn");

        if (waypointAddMode) {
            btn.classList.add("active");
        }
        else {
            btn.classList.remove("active");
        }

        drawMap();
    }

function startWaypointPatrol() {
        const emptyMsg = new ROSLIB.Message({});

        waypointStartPublisher.publish(emptyMsg);

        if (waypointList.length > 0) {
            waypointRunning = true;
            activeWaypointIndex = 0;

            goalPose = {
                x: waypointList[0].x,
                y: waypointList[0].y,
                yaw: waypointList[0].yaw
            };

            setGoalStatus("WAYPOINT 1 / " + waypointList.length);

            updateGoalCard();
            drawMap();
        }
        else {
            setGoalStatus("NO_WAYPOINTS");
        }
    }

function clearWaypoints() {
        const emptyMsg = new ROSLIB.Message({});

        waypointClearPublisher.publish(emptyMsg);

        waypointList = [];
        waypointRunning = false;
        activeWaypointIndex = -1;
        goalPose = null;
        globalPath = [];

        setGoalStatus("WAYPOINT_CLEARED");

        updateGoalCard();
        drawMap();
    }
