# 🚓 Scout Mini Autonomous Patrol Robot

> **ROS2 Humble 기반 자율 순찰 로봇 시스템**
>
> SLAM, Navigation2, Safety Stop, Industrial Safety, Autonomous Patrol, Battery Return, Frontier Exploration, Web Monitoring 기능을 통합한 자율주행 로봇 프로젝트입니다.

---

# 📌 Project Overview

본 프로젝트는 **AgileX Scout Mini**를 기반으로 구축한 ROS2 자율 순찰 로봇입니다.

LiDAR와 카메라를 이용하여 주변 환경을 인식하고, SLAM 기반 지도 생성, AMCL 기반 위치 추정, Navigation2 기반 자율주행을 수행합니다.

또한 산업 환경을 고려한 Safety Stop, Industrial Safety 기능과 함께 Waypoint 순찰, Battery Return, Frontier Exploration을 구현하였으며, Web 기반 원격 관제 시스템을 통해 실시간 모니터링과 원격 제어가 가능합니다.

---

# ✨ Features

- ✅ ROS2 Humble
- ✅ SLAM Toolbox
- ✅ Navigation2
- ✅ AMCL Localization
- ✅ Waypoint Patrol
- ✅ Multi Goal Mission
- ✅ Safety Stop
- ✅ Industrial Safety
- ✅ Recovery Behavior
- ✅ Low Battery Return
- ✅ Frontier Exploration
- ✅ Web Monitoring
- ✅ ROSBridge Web Control

---

# 🖥 Hardware

| Component | Model |
|-----------|-------|
| Mobile Robot | AgileX Scout Mini |
| LiDAR | Velodyne VLP-16 |
| Camera | Intel RealSense |
| OS | Ubuntu 22.04 |
| ROS | ROS2 Humble |

---

# 💻 Software

- ROS2 Humble
- Navigation2
- SLAM Toolbox
- AMCL
- RViz2
- ROSBridge Suite
- WebSocket
- HTML
- CSS
- JavaScript
- Python

---

# 📂 Project Structure

```text
src/
├── scout_description      # Robot URDF
├── scout_exploration      # Frontier Exploration
├── scout_navigation       # Navigation / Safety / Patrol
├── scout_ros2             # Scout Robot Driver
├── scout_slam             # SLAM
├── scout_web_monitor      # Web Monitoring
└── ugv_sdk                # Scout SDK
```

---

# 🏗 System Architecture

```text
                  Velodyne LiDAR
                         │
                  Intel RealSense
                         │
                   Scout Mini Robot
                         │
                    ROS2 Humble
                         │
 ┌──────────────────────────────────────────────┐
 │                                              │
 │        SLAM Toolbox / AMCL / Nav2            │
 │                                              │
 └──────────────────────────────────────────────┘
                         │
      ┌──────────────┬──────────────┬─────────────┐
      │              │              │
 Safety Stop   Industrial Safety   Recovery
      │              │              │
      └──────────────┴──────────────┘
                         │
          Waypoint / Patrol / Frontier
                         │
                 ROSBridge WebSocket
                         │
                  Web Monitoring UI
```

---

# 🚀 Build

```bash
cd ~/scout_ws

colcon build --symlink-install

source install/setup.bash
```

---

# 🚀 Launch

## Navigation

```bash
ros2 launch scout_navigation scout_nav2_integrated.launch.py
```

---

## Safety Stop

```bash
ros2 launch scout_navigation scout_safety_integrated.launch.py
```

---

## Industrial Safety

```bash
ros2 launch scout_navigation scout_industrial_safety_integrated.launch.py
```

---

## Auto Patrol

```bash
ros2 launch scout_navigation scout_auto_patrol_integrated.launch.py
```

---

## Multi Goal Mission

```bash
ros2 launch scout_navigation scout_multi_goal_integrated.launch.py
```

---

## Recovery Behavior

```bash
ros2 launch scout_navigation scout_recovery_integrated.launch.py
```

---

## Battery Return

```bash
ros2 launch scout_navigation scout_battery_return_integrated.launch.py
```

---

## Frontier Exploration

```bash
ros2 launch scout_navigation scout_frontier_exploration_integrated.launch.py
```

---

## SLAM

```bash
ros2 launch scout_slam scout_slam_integrated.launch.py
```

---

## Web Navigation

```bash
ros2 launch scout_web_monitor web_nav.launch.py
```

---

## Web SLAM

```bash
ros2 launch scout_web_monitor web_slam.launch.py
```

---

# 🌐 Web Monitoring

The Web Monitoring System provides:

- Real-time Map
- Robot Pose
- Goal Setting
- Manual Control
- Camera Streaming
- Battery Status
- Robot Speed
- Connection Status
- Navigation Mode
- SLAM Mode

---

# 📦 Main Packages

## scout_navigation

- Navigation2
- AMCL
- Safety Stop
- Industrial Safety
- Recovery Behavior
- Auto Patrol
- Multi Goal Mission
- Battery Return
- Web Goal Manager

---

## scout_slam

- SLAM Toolbox
- Map Save
- Map Load
- Online Mapping

---

## scout_exploration

- Frontier Exploration
- Automatic Exploration

---

## scout_web_monitor

- ROSBridge
- WebSocket
- HTML / CSS / JavaScript
- Robot Monitoring
- Manual Control

---

# 📈 Project Highlights

- Autonomous Navigation using Navigation2
- Real-time Mapping using SLAM Toolbox
- Obstacle Detection using LiDAR
- Industrial Safety Control
- Automatic Waypoint Patrol
- Automatic Battery Return
- Frontier-based Autonomous Exploration
- Web-based Robot Monitoring System

---

# 🔮 Future Work

- YOLO Human Following
- RTAB-Map 3D Mapping
- AI-based Object Detection
- Automatic Incident Detection
- Multi-Robot Control

---

# 👨‍💻 Developer

**Jo Seongmin**

ROS2 Autonomous Mobile Robot Developer

- ROS2
- Navigation2
- SLAM
- Web Monitoring
- Embedded System
- Computer Vision
