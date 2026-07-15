# 🚓 Scout Mini Autonomous Patrol Robot

<div align="center">

### ROS2 Humble 기반 자율 순찰 로봇 시스템

SLAM · Navigation2 · Industrial Safety · Frontier Exploration · Web Monitoring

</div>

---

# 📖 Overview

본 프로젝트는 **AgileX Scout Mini**를 기반으로 개발한 **ROS2 자율 순찰 로봇 시스템**입니다.

LiDAR를 이용하여 실시간으로 지도를 생성하고(SLAM), 생성된 지도를 기반으로 AMCL 위치 추정과 Navigation2를 이용한 자율주행을 수행합니다.

또한 산업 환경에서 사용할 수 있도록 **Safety Stop**, **Industrial Safety**, **자동 순찰**, **저전압 자동 복귀**, **Frontier Exploration**, **Web 기반 원격 관제 시스템**을 구현하였습니다.

---

# 🎯 Project Goals

- ROS2 기반 자율주행 시스템 구축
- 실시간 SLAM 및 Navigation 구현
- 산업 환경을 고려한 안전 시스템 구축
- Web 기반 원격 관제 시스템 개발
- 다양한 자율주행 기능을 하나의 플랫폼으로 통합

---

# ✨ Implemented Features

| Feature | Status |
|----------|:------:|
| SLAM Toolbox | ✅ |
| AMCL Localization | ✅ |
| Navigation2 | ✅ |
| Waypoint Navigation | ✅ |
| Autonomous Patrol | ✅ |
| Safety Stop | ✅ |
| Industrial Safety | ✅ |
| Low Battery Return | ✅ |
| Frontier Exploration | ✅ |
| Web Monitoring System | ✅ |
| Remote Robot Control | ✅ |
| ROSBridge Integration | ✅ |

---

# 🖥 Hardware

| Component | Description |
|------------|-------------|
| Mobile Robot | AgileX Scout Mini |
| LiDAR | Velodyne VLP-16 |
| Computer | Intel NUC |
| OS | Ubuntu 22.04 |
| ROS | ROS2 Humble |

---

# 💻 Software Stack

- ROS2 Humble
- Navigation2
- SLAM Toolbox
- AMCL
- RViz2
- ROSBridge Suite
- HTML
- CSS
- JavaScript
- Python

---

# 📂 Project Structure

```text
src
├── scout_description
│   └── Robot URDF
│
├── scout_ros2
│   └── Scout Robot Driver
│
├── ugv_sdk
│   └── Scout SDK
│
├── scout_slam
│   ├── SLAM Toolbox
│   └── Map Management
│
├── scout_navigation
│   ├── Navigation2
│   ├── AMCL
│   ├── Safety Stop
│   ├── Industrial Safety
│   ├── Autonomous Patrol
│   ├── Battery Return
│   └── Web Goal Manager
│
├── scout_exploration
│   └── Frontier Exploration
│
└── scout_web_monitor
    ├── ROSBridge
    ├── Web Server
    ├── Navigation UI
    └── SLAM UI
```

---

# 🏗 System Architecture

```text
               Velodyne LiDAR
                      │
                Scout Mini Robot
                      │
                 ROS2 Humble
                      │
      ┌─────────────────────────────────┐
      │                                 │
      │    SLAM Toolbox / Navigation2   │
      │                                 │
      └─────────────────────────────────┘
                      │
      ┌───────────────┼─────────────────┐
      │               │                 │
 Safety Stop   Industrial Safety   Battery Return
      │               │                 │
      └───────────────┼─────────────────┘
                      │
      Autonomous Patrol / Frontier Exploration
                      │
                ROSBridge WebSocket
                      │
               Web Monitoring System
```

---

# 🚀 Build

```bash
cd ~/scout_ws

colcon build --symlink-install

source install/setup.bash
```

---

# 🚀 Launch Guide

## SLAM

```bash
ros2 launch scout_slam scout_slam_integrated.launch.py
```

---

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

## Autonomous Patrol

```bash
ros2 launch scout_navigation scout_auto_patrol_integrated.launch.py
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

# 🌐 Web Monitoring System

Web 기반 원격 관제 시스템을 구현하여 별도의 ROS 환경 없이 브라우저에서 로봇을 모니터링하고 제어할 수 있습니다.

### 주요 기능

- 실시간 지도 표시
- Robot Pose 표시
- Goal 설정
- Manual Control
- Camera Streaming
- Robot Status
- Battery Status
- Speed Monitoring
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
- Autonomous Patrol
- Low Battery Return
- Web Goal Manager

---

## scout_slam

- SLAM Toolbox
- Map Save
- Map Load

---

## scout_exploration

- Frontier Exploration

---

## scout_web_monitor

- ROSBridge
- WebSocket
- HTML / CSS / JavaScript
- Robot Monitoring
- Remote Control

---

# 📈 Project Highlights

- ROS2 기반 자율주행 시스템 구축
- SLAM Toolbox를 이용한 실시간 지도 생성
- Navigation2 기반 자율주행
- 산업 환경을 고려한 Safety Stop 및 Industrial Safety 구현
- Waypoint 기반 자율 순찰
- 저전압 자동 복귀 기능
- Frontier 기반 자동 탐사
- Web 기반 원격 관제 시스템 개발
- ROSBridge를 이용한 ROS2-Web 실시간 통신

---

# 🔧 Future Improvements

- YOLO 기반 사람 추종
- RTAB-Map 기반 3D Mapping
- AI 객체 인식 및 상황 판단
- 다중 로봇 관제 시스템
- AI 기반 자율 순찰 고도화

---

# 👨‍💻 Developer

**Jo Seongmin**

Master of Artificial Intelligence Convergence

**Tech Stack**

- ROS2
- Navigation2
- SLAM Toolbox
- Python
- HTML / CSS / JavaScript
- Embedded System
- Computer Vision
- Autonomous Mobile Robot
