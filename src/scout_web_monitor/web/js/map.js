let mapViewInitialized = false;

function resizeMapCanvas() {
    mapCanvas.width = mapContainer.clientWidth;
    mapCanvas.height = mapContainer.clientHeight;
}

function clampPan() {
    const containerWidth = mapCanvas.width;
    const containerHeight = mapCanvas.height;

    const scaledWidth = mapDisplayWidth * zoomScale;
    const scaledHeight = mapDisplayHeight * zoomScale;

    if (scaledWidth <= containerWidth) {
        panX = (containerWidth - scaledWidth) / 2;
    }
    else {
        panX = Math.min(0, Math.max(panX, containerWidth - scaledWidth));
    }

    if (scaledHeight <= containerHeight) {
        panY = (containerHeight - scaledHeight) / 2;
    }
    else {
        panY = Math.min(0, Math.max(panY, containerHeight - scaledHeight));
    }
}

function worldToMapPixel(x, y) {
    const mapX = (x - mapOriginX) / mapResolution;
    const mapY = mapHeight - ((y - mapOriginY) / mapResolution);

    return { x: mapX, y: mapY };
}

function screenToWorld(screenX, screenY) {
    const rect = mapContainer.getBoundingClientRect();

    const localX = screenX - rect.left;
    const localY = screenY - rect.top;

    const mapPixelX = (localX - panX) / zoomScale;
    const mapPixelY = (localY - panY) / zoomScale;

    const worldX = mapPixelX * mapResolution + mapOriginX;
    const worldY = (mapHeight - mapPixelY) * mapResolution + mapOriginY;

    return { x: worldX, y: worldY };
}

function resetSlamMapView() {
    zoomScale = 1.0;
    panX = 0;
    panY = 0;
    mapViewInitialized = true;
    drawMap();
}

function processMapMessage(message) {
    if (!message || !message.info || !message.data) {
        console.error("Invalid map message:", message);
        return;
    }

    const width = message.info.width;
    const height = message.info.height;

    mapWidth = width;
    mapHeight = height;
    mapResolution = message.info.resolution;
    mapOriginX = message.info.origin.position.x;
    mapOriginY = message.info.origin.position.y;

    const displayWidth = width;
    const scale = displayWidth / width;
    const displayHeight = Math.floor(height * scale);

    mapDisplayWidth = displayWidth;
    mapDisplayHeight = displayHeight;

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = displayWidth;
    tempCanvas.height = displayHeight;

    const tempCtx = tempCanvas.getContext("2d");
    const imageData = tempCtx.createImageData(displayWidth, displayHeight);

    for (let y = 0; y < displayHeight; y++) {
        for (let x = 0; x < displayWidth; x++) {
            const mapX = Math.floor(x / scale);
            const mapY = height - 1 - Math.floor(y / scale);

            const mapIndex = mapY * width + mapX;
            const value = message.data[mapIndex];

            let color = 255;

            if (value === 100) {
                color = 0;
            }
            else if (value === -1) {
                color = 160;
            }

            const index = (y * displayWidth + x) * 4;

            imageData.data[index + 0] = color;
            imageData.data[index + 1] = color;
            imageData.data[index + 2] = color;
            imageData.data[index + 3] = 255;
        }
    }

    tempCtx.putImageData(imageData, 0, 0);

    mapImageCanvas = tempCanvas;
    mapDrawn = true;

    if (!mapViewInitialized) {
        zoomScale = 1.0;
        panX = 0;
        panY = 0;
        mapViewInitialized = true;
    }

    drawMap();
}

function requestMapFromServer() {
    const request = new ROSLIB.ServiceRequest({});

    mapService.callService(
        request,
        function (result) {
            if (result && result.map) {
                mapViewInitialized = false;
                processMapMessage(result.map);
            }
        },
        function (error) {
            console.error("Map service call failed:", error);
        }
    );
}

function drawPath() {
    if (!globalPath || globalPath.length < 2 || !mapImageCanvas) {
        return;
    }

    mapCtx.save();
    mapCtx.beginPath();

    for (let i = 0; i < globalPath.length; i++) {
        const pixel = worldToMapPixel(globalPath[i].x, globalPath[i].y);

        const screenX = panX + pixel.x * zoomScale;
        const screenY = panY + pixel.y * zoomScale;

        if (i === 0) {
            mapCtx.moveTo(screenX, screenY);
        }
        else {
            mapCtx.lineTo(screenX, screenY);
        }
    }

    mapCtx.strokeStyle = "#00aa55";
    mapCtx.lineWidth = 4;
    mapCtx.stroke();
    mapCtx.restore();
}

function drawRobotMarker() {
    if (!robotPose || !mapImageCanvas) {
        return;
    }

    const pixel = worldToMapPixel(robotPose.x, robotPose.y);

    const screenX = panX + pixel.x * zoomScale;
    const screenY = panY + pixel.y * zoomScale;

    mapCtx.save();

    mapCtx.translate(screenX, screenY);
    mapCtx.rotate(-robotPose.yaw);

    mapCtx.beginPath();
    mapCtx.moveTo(14, 0);
    mapCtx.lineTo(-10, -8);
    mapCtx.lineTo(-10, 8);
    mapCtx.closePath();

    mapCtx.fillStyle = "#e63946";
    mapCtx.fill();

    mapCtx.strokeStyle = "white";
    mapCtx.lineWidth = 2;
    mapCtx.stroke();

    mapCtx.restore();

    mapCtx.beginPath();
    mapCtx.arc(screenX, screenY, 5, 0, Math.PI * 2);
    mapCtx.fillStyle = "#e63946";
    mapCtx.fill();
}

function drawGoalMarker() {
    if (!goalPose || !mapImageCanvas) {
        return;
    }

    const pixel = worldToMapPixel(goalPose.x, goalPose.y);

    const screenX = panX + pixel.x * zoomScale;
    const screenY = panY + pixel.y * zoomScale;

    mapCtx.save();

    mapCtx.beginPath();
    mapCtx.arc(screenX, screenY, 9, 0, Math.PI * 2);
    mapCtx.strokeStyle = "#0066ff";
    mapCtx.lineWidth = 3;
    mapCtx.stroke();

    mapCtx.beginPath();
    mapCtx.moveTo(screenX - 14, screenY);
    mapCtx.lineTo(screenX + 14, screenY);
    mapCtx.moveTo(screenX, screenY - 14);
    mapCtx.lineTo(screenX, screenY + 14);
    mapCtx.stroke();

    mapCtx.restore();
}

function drawHomeMarker() {
    if (!homePose || !mapImageCanvas) {
        return;
    }

    const pixel = worldToMapPixel(homePose.x, homePose.y);

    const screenX = panX + pixel.x * zoomScale;
    const screenY = panY + pixel.y * zoomScale;

    mapCtx.save();

    mapCtx.beginPath();
    mapCtx.arc(screenX, screenY, 13, 0, Math.PI * 2);
    mapCtx.fillStyle = "#22a447";
    mapCtx.fill();

    mapCtx.strokeStyle = "white";
    mapCtx.lineWidth = 3;
    mapCtx.stroke();

    mapCtx.fillStyle = "white";
    mapCtx.font = "bold 15px Arial";
    mapCtx.textAlign = "center";
    mapCtx.textBaseline = "middle";
    mapCtx.fillText("H", screenX, screenY + 1);

    if (homePose.yaw !== undefined) {
        mapCtx.translate(screenX, screenY);
        mapCtx.rotate(-homePose.yaw);

        mapCtx.beginPath();
        mapCtx.moveTo(26, 0);
        mapCtx.lineTo(13, -6);
        mapCtx.lineTo(13, 6);
        mapCtx.closePath();

        mapCtx.fillStyle = "#22a447";
        mapCtx.fill();

        mapCtx.strokeStyle = "white";
        mapCtx.lineWidth = 1.5;
        mapCtx.stroke();
    }

    mapCtx.restore();
}

function drawWaypointMarkers() {
    if (!waypointList || waypointList.length === 0 || !mapImageCanvas) {
        return;
    }

    for (let i = 0; i < waypointList.length; i++) {
        const pixel = worldToMapPixel(waypointList[i].x, waypointList[i].y);

        const screenX = panX + pixel.x * zoomScale;
        const screenY = panY + pixel.y * zoomScale;

        mapCtx.save();

        mapCtx.beginPath();
        mapCtx.arc(screenX, screenY, 10, 0, Math.PI * 2);

        if (waypointRunning && i === activeWaypointIndex) {
            mapCtx.fillStyle = "#9333ea";
        }
        else {
            mapCtx.fillStyle = "#ff9900";
        }

        mapCtx.fill();

        mapCtx.strokeStyle = "white";
        mapCtx.lineWidth = 2;
        mapCtx.stroke();

        mapCtx.fillStyle = "white";
        mapCtx.font = "bold 12px Arial";
        mapCtx.textAlign = "center";
        mapCtx.textBaseline = "middle";
        mapCtx.fillText(String(i + 1), screenX, screenY);

        mapCtx.restore();
    }
}

function drawInitialPoseMarker() {
    if (!initialPoseTemp || !mapImageCanvas) {
        return;
    }

    const pixel = worldToMapPixel(initialPoseTemp.x, initialPoseTemp.y);

    const screenX = panX + pixel.x * zoomScale;
    const screenY = panY + pixel.y * zoomScale;

    mapCtx.save();

    mapCtx.beginPath();
    mapCtx.arc(screenX, screenY, 8, 0, Math.PI * 2);
    mapCtx.fillStyle = "#ff9900";
    mapCtx.fill();

    if (initialPoseTemp.yaw !== undefined) {
        mapCtx.translate(screenX, screenY);
        mapCtx.rotate(-initialPoseTemp.yaw);

        mapCtx.beginPath();
        mapCtx.moveTo(22, 0);
        mapCtx.lineTo(0, -8);
        mapCtx.lineTo(0, 8);
        mapCtx.closePath();

        mapCtx.fillStyle = "#ff9900";
        mapCtx.fill();
    }

    mapCtx.restore();
}

function drawHomePoseTempMarker() {
    if (!homePoseTemp || !mapImageCanvas) {
        return;
    }

    const pixel = worldToMapPixel(homePoseTemp.x, homePoseTemp.y);

    const screenX = panX + pixel.x * zoomScale;
    const screenY = panY + pixel.y * zoomScale;

    mapCtx.save();

    mapCtx.beginPath();
    mapCtx.arc(screenX, screenY, 9, 0, Math.PI * 2);
    mapCtx.fillStyle = "#22a447";
    mapCtx.fill();

    mapCtx.strokeStyle = "white";
    mapCtx.lineWidth = 2;
    mapCtx.stroke();

    if (homePoseTemp.yaw !== undefined) {
        mapCtx.translate(screenX, screenY);
        mapCtx.rotate(-homePoseTemp.yaw);

        mapCtx.beginPath();
        mapCtx.moveTo(24, 0);
        mapCtx.lineTo(5, -7);
        mapCtx.lineTo(5, 7);
        mapCtx.closePath();

        mapCtx.fillStyle = "#22a447";
        mapCtx.fill();
    }

    mapCtx.restore();
}

function checkGoalArrived() {
    if (!robotPose || !goalPose) {
        return;
    }

    const dx = robotPose.x - goalPose.x;
    const dy = robotPose.y - goalPose.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (waypointRunning && activeWaypointIndex >= 0) {
        if (distance < 0.35) {
            activeWaypointIndex += 1;

            if (activeWaypointIndex < waypointList.length) {
                goalPose = {
                    x: waypointList[activeWaypointIndex].x,
                    y: waypointList[activeWaypointIndex].y,
                    yaw: waypointList[activeWaypointIndex].yaw
                };

                setGoalStatus("WAYPOINT " + (activeWaypointIndex + 1) + " / " + waypointList.length);
            }
            else {
                waypointRunning = false;
                activeWaypointIndex = -1;
                goalPose = null;
                globalPath = [];
                setGoalStatus("WAYPOINT_DONE");
            }

            updateGoalCard();
        }

        return;
    }

    if (distance < 0.30) {
        goalPose = null;
        globalPath = [];
        setGoalStatus("ARRIVED");
        updateGoalCard();
    }
}

function drawMap() {
    if (!mapImageCanvas) {
        return;
    }

    resizeMapCanvas();
    clampPan();

    mapCtx.setTransform(1, 0, 0, 1, 0, 0);
    mapCtx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);

    mapCtx.imageSmoothingEnabled = false;

    mapCtx.drawImage(
        mapImageCanvas,
        panX,
        panY,
        mapDisplayWidth * zoomScale,
        mapDisplayHeight * zoomScale
    );

    drawLidarScan();
    drawPath();
    drawHomeMarker();
    drawGoalMarker();
    drawWaypointMarkers();
    drawInitialPoseMarker();
    drawHomePoseTempMarker();
    drawRobotMarker();
}
