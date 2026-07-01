const scanListener = new ROSLIB.Topic({
        ros: ros,
        name: '/scan',
        messageType: 'sensor_msgs/msg/LaserScan'
    });

    scanListener.subscribe(function (message) {
        latestScan = message;

        if (lidarOverlayEnabled) {
            drawMap();
        }
    });

function toggleLidarOverlay() {
        lidarOverlayEnabled = !lidarOverlayEnabled;

        const btn = document.getElementById("lidarToggleBtn");

        if (lidarOverlayEnabled) {
            btn.innerHTML = "LiDAR ON";
            btn.classList.add("active");
        }
        else {
            btn.innerHTML = "LiDAR OFF";
            btn.classList.remove("active");
        }

        drawMap();
    }

function drawLidarScan() {
        if (!lidarOverlayEnabled || !latestScan || !robotPose || !mapImageCanvas) {
            return;
        }

        const ranges = latestScan.ranges;
        const angleMin = latestScan.angle_min;
        const angleIncrement = latestScan.angle_increment;
        const rangeMin = latestScan.range_min;
        const rangeMax = Math.min(latestScan.range_max, 12.0);

        mapCtx.save();
        mapCtx.fillStyle = "#ff0000";

        for (let i = 0; i < ranges.length; i += 2) {
            const range = ranges[i];

            if (!isFinite(range)) {
                continue;
            }

            if (range < rangeMin || range > rangeMax) {
                continue;
            }

            const angle = angleMin + i * angleIncrement;

            const worldX = robotPose.x + range * Math.cos(robotPose.yaw + angle);
            const worldY = robotPose.y + range * Math.sin(robotPose.yaw + angle);

            const pixel = worldToMapPixel(worldX, worldY);

            const screenX = panX + pixel.x * zoomScale;
            const screenY = panY + pixel.y * zoomScale;

            mapCtx.beginPath();
            mapCtx.arc(screenX, screenY, 3.5, 0, Math.PI * 2);
            mapCtx.fill();
        }

        mapCtx.restore();
    }
