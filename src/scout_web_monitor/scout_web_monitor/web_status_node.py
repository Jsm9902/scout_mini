#!/usr/bin/env python3

import json
import time

import rclpy
from rclpy.node import Node

from std_msgs.msg import String
from scout_msgs.msg import ScoutStatus


class WebStatusNode(Node):
    def __init__(self):
        super().__init__('web_status_node')

        self.robot_last_time = 0.0

        self.mode_state = {
            'active_mode': 'none',
            'navigation': 'STANDBY',
            'slam': 'STANDBY'
        }

        self.status_pub = self.create_publisher(
            String,
            '/web_monitor/status',
            10
        )

        self.scout_status_sub = self.create_subscription(
            ScoutStatus,
            '/scout_status',
            self.scout_status_callback,
            10
        )

        self.mode_state_sub = self.create_subscription(
            String,
            '/web_monitor/mode_state',
            self.mode_state_callback,
            10
        )

        self.timer = self.create_timer(1.0, self.publish_status)

        self.get_logger().info('Web Status Node started.')
        self.get_logger().info('Publishing: /web_monitor/status')
        self.get_logger().info('Subscribe: /web_monitor/mode_state')

    def scout_status_callback(self, msg):
        self.robot_last_time = time.time()

    def mode_state_callback(self, msg):
        try:
            self.mode_state = json.loads(msg.data)
        except Exception as e:
            self.get_logger().warn(f'Failed to parse mode_state: {str(e)}')

    def is_robot_online(self):
        return (time.time() - self.robot_last_time) < 3.0

    def has_any_node(self, keywords):
        node_names = self.get_node_names()

        for node_name in node_names:
            for keyword in keywords:
                if keyword in node_name:
                    return True

        return False

    def is_navigation_ready(self):
        required_keywords = [
            'map_server',
            'amcl',
            'planner_server',
            'controller_server',
            'bt_navigator',
            'behavior_server',
            'waypoint_follower'
        ]

        node_names = self.get_node_names()

        for keyword in required_keywords:
            found = False

            for node_name in node_names:
                if keyword in node_name:
                    found = True
                    break

            if not found:
                return False

        return True

    def is_slam_ready(self):
        return self.has_any_node(['slam_toolbox'])

    def get_navigation_state(self):
        manager_state = self.mode_state.get('navigation', 'STANDBY')

        if manager_state in ['STARTING', 'STOPPING', 'ERROR']:
            if manager_state == 'STARTING' and self.is_navigation_ready():
                return 'READY'
            return manager_state

        if self.is_navigation_ready():
            return 'READY'

        return 'STANDBY'

    def get_slam_state(self):
        manager_state = self.mode_state.get('slam', 'STANDBY')

        if manager_state in ['STARTING', 'STOPPING', 'ERROR']:
            if manager_state == 'STARTING' and self.is_slam_ready():
                return 'READY'
            return manager_state

        if self.is_slam_ready():
            return 'READY'

        return 'STANDBY'

    def get_active_mode(self, navigation_state, slam_state):
        if navigation_state == 'READY':
            return 'navigation'

        if slam_state == 'READY':
            return 'slam'

        return self.mode_state.get('active_mode', 'none')

    def publish_status(self):
        navigation_state = self.get_navigation_state()
        slam_state = self.get_slam_state()

        status = {
            'ros': 'CONNECTED',
            'websocket': 'CONNECTED',
            'robot': 'ONLINE' if self.is_robot_online() else 'OFFLINE',
            'active_mode': self.get_active_mode(navigation_state, slam_state),
            'navigation': navigation_state,
            'slam': slam_state
        }

        msg = String()
        msg.data = json.dumps(status)

        self.status_pub.publish(msg)


def main(args=None):
    rclpy.init(args=args)
    node = WebStatusNode()

    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()