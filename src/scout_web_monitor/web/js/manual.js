const modePublisher = new ROSLIB.Topic({
        ros: ros,
        name: '/web_mode',
        messageType: 'std_msgs/msg/String'
    });

function changeMode() {
        currentMode = document.getElementById("modeSelect").value;

        const modeMsg = new ROSLIB.Message({
            data: currentMode
        });

        modePublisher.publish(modeMsg);

        const buttons = document.getElementsByClassName("manual-btn");

        if (currentMode === "manual") {
            for (let btn of buttons) {
                btn.disabled = false;
            }
        }
        else {
            stopMove();

            for (let btn of buttons) {
                btn.disabled = true;
            }
        }
    }

const cmdVel = new ROSLIB.Topic({
        ros: ros,
        name: '/cmd_vel_web',
        messageType: 'geometry_msgs/msg/Twist'
    });

    let moveTimer = null;

    function startMove(linear_x, angular_z) {
        if (currentMode !== "manual") {
            return;
        }

        stopMove();

        moveTimer = setInterval(function () {
            const twist = new ROSLIB.Message({
                linear: {
                    x: linear_x,
                    y: 0.0,
                    z: 0.0
                },
                angular: {
                    x: 0.0,
                    y: 0.0,
                    z: angular_z
                }
            });

            cmdVel.publish(twist);

        }, 100);
    }

    function stopMove() {
        if (moveTimer) {
            clearInterval(moveTimer);
            moveTimer = null;
        }

        const stopTwist = new ROSLIB.Message({
            linear: {
                x: 0.0,
                y: 0.0,
                z: 0.0
            },
            angular: {
                x: 0.0,
                y: 0.0,
                z: 0.0
            }
        });

        cmdVel.publish(stopTwist);
    }
