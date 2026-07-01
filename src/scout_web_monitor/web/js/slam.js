let saveMapNamePublisher = null;
let serializePoseGraphNamePublisher = null;
let slamEventListener = null;

let slamModalMode = null;
let slamToastTimer = null;

function setSlamStatus(statusText, mapText) {
    const statusElement = document.getElementById("goal_status");
    const mapStatusElement = document.getElementById("slam_map_status");

    if (statusElement) {
        statusElement.innerHTML = statusText;
        statusElement.className = "status-value status-idle";
    }

    if (mapStatusElement) {
        mapStatusElement.innerHTML = mapText || statusText;
    }
}

function showSlamToast(message, type) {
    const toast = document.getElementById("slamToast");

    if (!toast) {
        return;
    }

    toast.innerHTML = message;
    toast.className = "slam-toast show";

    if (type === "success") {
        toast.classList.add("success");
    }
    else if (type === "error") {
        toast.classList.add("error");
    }
    else {
        toast.classList.add("info");
    }

    if (slamToastTimer) {
        clearTimeout(slamToastTimer);
    }

    slamToastTimer = setTimeout(function () {
        toast.className = "slam-toast";
    }, 3500);
}

function initSlamPublisher() {
    if (typeof ros === "undefined" || ros === null) {
        console.error("ROS is not connected. Cannot initialize SLAM publishers.");
        return;
    }

    saveMapNamePublisher = new ROSLIB.Topic({
        ros: ros,
        name: "/web_slam/save_map_name",
        messageType: "std_msgs/msg/String"
    });

    serializePoseGraphNamePublisher = new ROSLIB.Topic({
        ros: ros,
        name: "/web_slam/serialize_posegraph_name",
        messageType: "std_msgs/msg/String"
    });

    console.log("SLAM publisher initialized: /web_slam/save_map_name");
    console.log("SLAM publisher initialized: /web_slam/serialize_posegraph_name");
}

function initSlamEventListener() {
    if (typeof ros === "undefined" || ros === null) {
        console.error("ROS is not connected. Cannot initialize SLAM event listener.");
        return;
    }

    slamEventListener = new ROSLIB.Topic({
        ros: ros,
        name: "/web_slam/event",
        messageType: "std_msgs/msg/String"
    });

    slamEventListener.subscribe(function (message) {
        try {
            const event = JSON.parse(message.data);

            if (event.success) {
                if (event.type === "save_map") {
                    setSlamStatus("SAVE_MAP_DONE", event.message);
                    showSlamToast("✅ Map saved successfully", "success");
                }
                else if (event.type === "serialize_posegraph") {
                    setSlamStatus("SERIALIZE_DONE", event.message);
                    showSlamToast("✅ PoseGraph serialized successfully", "success");
                }
                else {
                    setSlamStatus("SLAM_DONE", event.message);
                    showSlamToast("✅ " + event.message, "success");
                }
            }
            else {
                if (event.type === "save_map") {
                    setSlamStatus("SAVE_MAP_FAILED", event.message);
                    showSlamToast("❌ Map save failed", "error");
                }
                else if (event.type === "serialize_posegraph") {
                    setSlamStatus("SERIALIZE_FAILED", event.message);
                    showSlamToast("❌ PoseGraph serialize failed", "error");
                }
                else {
                    setSlamStatus("SLAM_FAILED", event.message);
                    showSlamToast("❌ " + event.message, "error");
                }
            }

            console.log("SLAM event:", event);
        }
        catch (error) {
            console.error("Failed to parse /web_slam/event:", error);
        }
    });

    console.log("SLAM event listener initialized: /web_slam/event");
}

function callSlamTriggerService(serviceName, runningText, successPrefix, failPrefix) {
    if (typeof ros === "undefined" || ros === null) {
        setSlamStatus("ROS_NOT_CONNECTED", "ROS is not connected");
        showSlamToast("❌ ROS is not connected", "error");
        return;
    }

    setSlamStatus(runningText, "Calling " + serviceName);

    const serviceClient = new ROSLIB.Service({
        ros: ros,
        name: serviceName,
        serviceType: "std_srvs/srv/Trigger"
    });

    const request = new ROSLIB.ServiceRequest({});

    serviceClient.callService(
        request,
        function (result) {
            if (result.success) {
                setSlamStatus(successPrefix, result.message);
                showSlamToast("✅ " + result.message, "success");
                console.log(successPrefix + ":", result.message);
            }
            else {
                setSlamStatus(failPrefix, result.message);
                showSlamToast("❌ " + result.message, "error");
                console.error(failPrefix + ":", result.message);
            }
        },
        function (error) {
            setSlamStatus(failPrefix, String(error));
            showSlamToast("❌ Service call failed", "error");
            console.error("Service call failed:", serviceName, error);
        }
    );
}

function isValidSlamFileName(name) {
    const regex = /^[a-zA-Z0-9가-힣_-]+$/;
    return regex.test(name);
}

function openSlamFileModal(mode) {
    slamModalMode = mode;

    const overlay = document.getElementById("slamModalOverlay");
    const title = document.getElementById("slamModalTitle");
    const label = document.getElementById("slamModalLabel");
    const input = document.getElementById("slamModalInput");
    const hint = document.getElementById("slamModalHint");
    const error = document.getElementById("slamModalError");
    const confirmBtn = document.getElementById("slamModalConfirmBtn");

    if (!overlay || !title || !label || !input || !hint || !error || !confirmBtn) {
        console.error("SLAM modal elements are missing.");
        return;
    }

    error.innerHTML = "";
    input.value = "";

    if (mode === "map") {
        title.innerHTML = "Save SLAM Map";
        label.innerHTML = "Map File Name";
        input.placeholder = "예: bufs_4floor";
        hint.innerHTML = "확장자(.yaml, .pgm)는 입력하지 않아도 됩니다.";
        confirmBtn.innerHTML = "Save Map";
    }
    else if (mode === "posegraph") {
        title.innerHTML = "Serialize PoseGraph";
        label.innerHTML = "PoseGraph File Name";
        input.placeholder = "예: bufs_4floor_posegraph";
        hint.innerHTML = "확장자(.posegraph)는 입력하지 않아도 됩니다.";
        confirmBtn.innerHTML = "Serialize";
    }

    overlay.classList.add("show");

    setTimeout(function () {
        input.focus();
    }, 50);
}

function closeSlamFileModal() {
    const overlay = document.getElementById("slamModalOverlay");
    const error = document.getElementById("slamModalError");

    if (overlay) {
        overlay.classList.remove("show");
    }

    if (error) {
        error.innerHTML = "";
    }

    slamModalMode = null;
}

function confirmSlamFileModal() {
    const input = document.getElementById("slamModalInput");
    const error = document.getElementById("slamModalError");

    if (!input || !error) {
        return;
    }

    const fileName = input.value.trim();

    if (fileName.length === 0) {
        error.innerHTML = "파일명을 입력해야 합니다.";
        input.focus();
        return;
    }

    if (!isValidSlamFileName(fileName)) {
        error.innerHTML = "한글, 영문, 숫자, 언더바(_), 하이픈(-)만 사용할 수 있습니다.";
        input.focus();
        return;
    }

    if (slamModalMode === "map") {
        publishSaveMapName(fileName);
    }
    else if (slamModalMode === "posegraph") {
        publishSerializePoseGraphName(fileName);
    }

    closeSlamFileModal();
}

function publishSaveMapName(mapName) {
    if (typeof ros === "undefined" || ros === null) {
        setSlamStatus("ROS_NOT_CONNECTED", "ROS is not connected");
        showSlamToast("❌ ROS is not connected", "error");
        return;
    }

    if (saveMapNamePublisher === null) {
        initSlamPublisher();
    }

    const message = new ROSLIB.Message({
        data: mapName
    });

    saveMapNamePublisher.publish(message);

    setSlamStatus("SAVE_MAP_REQUESTED", "Save map requested: " + mapName);
    showSlamToast("💾 Saving map: " + mapName, "info");
    console.log("Save map name published:", mapName);
}

function publishSerializePoseGraphName(posegraphName) {
    if (typeof ros === "undefined" || ros === null) {
        setSlamStatus("ROS_NOT_CONNECTED", "ROS is not connected");
        showSlamToast("❌ ROS is not connected", "error");
        return;
    }

    if (serializePoseGraphNamePublisher === null) {
        initSlamPublisher();
    }

    const message = new ROSLIB.Message({
        data: posegraphName
    });

    serializePoseGraphNamePublisher.publish(message);

    setSlamStatus("SERIALIZE_REQUESTED", "Serialize PoseGraph requested: " + posegraphName);
    showSlamToast("🧩 Serializing PoseGraph: " + posegraphName, "info");
    console.log("Serialize posegraph name published:", posegraphName);
}

function saveSlamMap() {
    openSlamFileModal("map");
}

function serializeSlamPoseGraph() {
    openSlamFileModal("posegraph");
}

function resetSlamToolbox() {
    const confirmed = confirm(
        "현재 /slam_toolbox/reset 서비스를 호출합니다.\n\n" +
        "주의: 이 기능은 SLAM Toolbox 내부 상태를 일부 reset하지만,\n" +
        "처음 실행 상태처럼 완전히 빈 지도로 초기화되지는 않을 수 있습니다.\n\n" +
        "계속 진행할까요?"
    );

    if (!confirmed) {
        setSlamStatus("RESET_CANCELLED", "Reset SLAM cancelled");
        showSlamToast("Reset SLAM cancelled", "info");
        return;
    }

    callSlamTriggerService(
        "/web_slam/reset",
        "RESETTING_SLAM",
        "RESET_SLAM_DONE",
        "RESET_SLAM_FAILED"
    );
}

window.addEventListener("keydown", function (event) {
    const overlay = document.getElementById("slamModalOverlay");

    if (!overlay || !overlay.classList.contains("show")) {
        return;
    }

    if (event.key === "Escape") {
        closeSlamFileModal();
    }

    if (event.key === "Enter") {
        confirmSlamFileModal();
    }
});

window.addEventListener("load", function () {
    initSlamPublisher();
    initSlamEventListener();
});
