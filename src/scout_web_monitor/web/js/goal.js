const goalStatusListener = new ROSLIB.Topic({
        ros: ros,
        name: '/web_goal_status',
        messageType: 'std_msgs/msg/String'
    });

    goalStatusListener.subscribe(function (message) {
        setGoalStatus(message.data);

        if (
            message.data === "CANCELED" ||
            message.data === "ARRIVED" ||
            message.data === "WAYPOINT_DONE"
        ) {
            if (message.data === "WAYPOINT_DONE") {
                waypointRunning = false;
                activeWaypointIndex = -1;
            }

            goalPose = null;
            globalPath = [];
            drawMap();
            updateGoalCard();
        }
    });

const webGoalPublisher = new ROSLIB.Topic({
        ros: ros,
        name: '/web_goal_pose',
        messageType: 'geometry_msgs/msg/PoseStamped'
    });

    const cancelGoalPublisher = new ROSLIB.Topic({
        ros: ros,
        name: '/web_cancel_goal',
        messageType: 'std_msgs/msg/Empty'
    });

const setHomePublisher = new ROSLIB.Topic({
        ros: ros,
        name: '/web_set_home_pose',
        messageType: 'geometry_msgs/msg/PoseStamped'
    });

    const returnHomePublisher = new ROSLIB.Topic({
        ros: ros,
        name: '/web_return_home',
        messageType: 'std_msgs/msg/Empty'
    });

const initialPosePublisher = new ROSLIB.Topic({
        ros: ros,
        name: '/initialpose',
        messageType: 'geometry_msgs/msg/PoseWithCovarianceStamped'
    });

function cancelGoal() {
        const emptyMsg = new ROSLIB.Message({});

        cancelGoalPublisher.publish(emptyMsg);

        goalPose = null;
        globalPath = [];
        waypointRunning = false;
        activeWaypointIndex = -1;

        setGoalStatus("CANCELING");

        updateGoalCard();
        drawMap();
    }

function startHomePoseMode() {
        homePoseMode = true;
        homePoseStep = 1;
        homePoseTemp = null;

        initialPoseMode = false;
        initialPoseStep = 0;
        initialPoseTemp = null;

        waypointAddMode = false;

        document.getElementById("initialPoseBtn").classList.remove("active");
        document.getElementById("waypointAddBtn").classList.remove("active");
        document.getElementById("homePoseBtn").classList.add("active");

        setGoalStatus("SET_HOME_POSE");

        drawMap();
    }

function cancelHomePoseMode() {
        homePoseMode = false;
        homePoseStep = 0;
        homePoseTemp = null;

        document.getElementById("homePoseBtn").classList.remove("active");

        drawMap();
    }

function returnHome() {
        const emptyMsg = new ROSLIB.Message({});

        returnHomePublisher.publish(emptyMsg);

        if (homePose) {
            goalPose = {
                x: homePose.x,
                y: homePose.y,
                yaw: homePose.yaw
            };

            waypointRunning = false;
            activeWaypointIndex = -1;

            setGoalStatus("RETURN_HOME");

            updateGoalCard();
            drawMap();
        }
        else {
            setGoalStatus("NO_HOME_POSE");
        }
    }

function startInitialPoseMode() {
        initialPoseMode = true;
        initialPoseStep = 1;
        initialPoseTemp = null;

        homePoseMode = false;
        homePoseStep = 0;
        homePoseTemp = null;

        waypointAddMode = false;

        document.getElementById("waypointAddBtn").classList.remove("active");
        document.getElementById("homePoseBtn").classList.remove("active");
        document.getElementById("initialPoseBtn").classList.add("active");

        drawMap();
    }

function cancelInitialPoseMode() {
        initialPoseMode = false;
        initialPoseStep = 0;
        initialPoseTemp = null;

        document.getElementById("initialPoseBtn").classList.remove("active");

        drawMap();
    }

function publishInitialPose(x, y, yaw) {
        const q = yawToQuaternion(yaw);

        const msg = new ROSLIB.Message({
            header: {
                frame_id: 'map'
            },
            pose: {
                pose: {
                    position: {
                        x: x,
                        y: y,
                        z: 0.0
                    },
                    orientation: {
                        x: q.x,
                        y: q.y,
                        z: q.z,
                        w: q.w
                    }
                },
                covariance: [
                    0.25, 0.0, 0.0, 0.0, 0.0, 0.0,
                    0.0, 0.25, 0.0, 0.0, 0.0, 0.0,
                    0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
                    0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
                    0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
                    0.0, 0.0, 0.0, 0.0, 0.0, 0.0685
                ]
            }
        });

        initialPosePublisher.publish(msg);
    }
