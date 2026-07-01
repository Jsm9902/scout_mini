const WEB_HOST = window.location.hostname;

const ROSBRIDGE_URL = "ws://" + WEB_HOST + ":9090";
const VIDEO_SERVER_URL = "http://" + WEB_HOST + ":8080";

function yawToQuaternion(yaw) {
    const halfYaw = yaw * 0.5;

    return {
        x: 0.0,
        y: 0.0,
        z: Math.sin(halfYaw),
        w: Math.cos(halfYaw)
    };
}

function getYawFromQuaternion(q) {
    const sinyCosp = 2.0 * (q.w * q.z + q.x * q.y);
    const cosyCosp = 1.0 - 2.0 * (q.y * q.y + q.z * q.z);

    return Math.atan2(sinyCosp, cosyCosp);
}

function makePoseStamped(x, y, yaw) {
    const q = yawToQuaternion(yaw);

    return new ROSLIB.Message({
        header: {
            frame_id: "map"
        },
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
        }
    });
}

function makeEmptyMessage() {
    return new ROSLIB.Message({});
}
