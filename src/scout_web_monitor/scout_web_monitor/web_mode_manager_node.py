#!/usr/bin/env python3

import json
import os
import signal
import subprocess
import time

import rclpy
from rclpy.node import Node
from std_msgs.msg import String


class WebModeManagerNode(Node):
    def __init__(self):
        super().__init__('web_mode_manager_node')

        self.current_process = None
        self.current_mode = 'none'

        self.navigation_state = 'STANDBY'
        self.slam_state = 'STANDBY'

        self.mode_sub = self.create_subscription(
            String,
            '/web_monitor/mode_command',
            self.mode_command_callback,
            10
        )

        self.mode_state_pub = self.create_publisher(
            String,
            '/web_monitor/mode_state',
            10
        )

        self.timer = self.create_timer(0.5, self.publish_mode_state)

        self.get_logger().info('Web Mode Manager Node started.')
        self.get_logger().info('Subscribe: /web_monitor/mode_command')
        self.get_logger().info('Publish: /web_monitor/mode_state')

    def publish_mode_state(self):
        msg = String()
        msg.data = json.dumps({
            'active_mode': self.current_mode,
            'navigation': self.navigation_state,
            'slam': self.slam_state
        })
        self.mode_state_pub.publish(msg)

    def mode_command_callback(self, msg):
        mode = msg.data.strip().lower()

        if mode == 'navigation':
            self.start_navigation()

        elif mode == 'slam':
            self.start_slam()

        elif mode == 'stop':
            self.stop_current_mode()
            self.cleanup_all_mode_processes()
            self.current_mode = 'none'
            self.navigation_state = 'STANDBY'
            self.slam_state = 'STANDBY'
            self.publish_mode_state()

        else:
            self.get_logger().warn(f'Unknown mode command: {mode}')

    def run_cleanup_command(self, command):
        try:
            subprocess.run(
                command,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                timeout=3.0
            )
        except Exception as e:
            self.get_logger().warn(
                f'Cleanup command failed: {" ".join(command)} / {str(e)}'
            )

    def cleanup_by_patterns(self, patterns):
        for pattern in patterns:
            self.run_cleanup_command(['pkill', '-f', pattern])

    def cleanup_navigation_processes(self):
        self.get_logger().info('Cleaning up Navigation related processes...')

        patterns = [
            'web_nav.launch.py',
            'nav2_map_server',
            'nav2_amcl',
            'nav2_planner',
            'nav2_controller',
            'nav2_bt_navigator',
            'nav2_behaviors',
            'nav2_waypoint_follower',
            'nav2_lifecycle_manager',
            'map_server',
            'amcl',
            'planner_server',
            'controller_server',
            'bt_navigator',
            'behavior_server',
            'waypoint_follower',
            'lifecycle_manager_navigation',
            'recovery_behavior_node',
            'web_goal_manager'
        ]

        self.cleanup_by_patterns(patterns)

    def cleanup_slam_processes(self):
        self.get_logger().info('Cleaning up SLAM related processes...')

        patterns = [
            'web_slam.launch.py',
            'slam_toolbox',
            'async_slam_toolbox_node',
            'slam_manager',
            'slam_manager_node'
        ]

        self.cleanup_by_patterns(patterns)

    def cleanup_all_mode_processes(self):
        self.cleanup_navigation_processes()
        self.cleanup_slam_processes()
        time.sleep(1.5)

    def set_stopping_state_for_current_mode(self):
        if self.current_mode == 'navigation':
            self.navigation_state = 'STOPPING'
            self.slam_state = 'STANDBY'

        elif self.current_mode == 'slam':
            self.navigation_state = 'STANDBY'
            self.slam_state = 'STOPPING'

        else:
            if self.navigation_state in ['READY', 'STARTING']:
                self.navigation_state = 'STOPPING'

            if self.slam_state in ['READY', 'STARTING']:
                self.slam_state = 'STOPPING'

        self.publish_mode_state()

    def set_standby_state(self):
        self.current_mode = 'none'
        self.navigation_state = 'STANDBY'
        self.slam_state = 'STANDBY'
        self.publish_mode_state()

    def stop_current_mode(self):
        if self.current_process is None:
            self.get_logger().info('No active mode launch process to stop.')
            self.set_stopping_state_for_current_mode()
            time.sleep(0.5)
            self.set_standby_state()
            return

        self.get_logger().info(f'Stopping current mode launch: {self.current_mode}')
        self.set_stopping_state_for_current_mode()

        try:
            os.killpg(os.getpgid(self.current_process.pid), signal.SIGINT)

            try:
                self.current_process.wait(timeout=8.0)
            except subprocess.TimeoutExpired:
                self.get_logger().warn(
                    'Launch process did not stop with SIGINT. Sending SIGTERM.'
                )
                os.killpg(os.getpgid(self.current_process.pid), signal.SIGTERM)

                try:
                    self.current_process.wait(timeout=5.0)
                except subprocess.TimeoutExpired:
                    self.get_logger().warn(
                        'Launch process did not stop with SIGTERM. Sending SIGKILL.'
                    )
                    os.killpg(os.getpgid(self.current_process.pid), signal.SIGKILL)
                    self.current_process.wait(timeout=3.0)

        except Exception as e:
            self.get_logger().error(f'Failed to stop launch process: {str(e)}')

        self.current_process = None
        self.set_standby_state()
        time.sleep(1.0)

    def start_navigation(self):
        if self.current_mode == 'navigation' and self.current_process is not None:
            self.get_logger().info('Navigation mode is already running.')
            return

        self.stop_current_mode()
        self.cleanup_all_mode_processes()

        self.current_mode = 'navigation'
        self.navigation_state = 'STARTING'
        self.slam_state = 'STANDBY'
        self.publish_mode_state()

        command = [
            'ros2',
            'launch',
            'scout_web_monitor',
            'web_nav.launch.py'
        ]

        self.get_logger().info('Starting Navigation mode...')
        self.start_process(command, 'navigation')

    def start_slam(self):
        if self.current_mode == 'slam' and self.current_process is not None:
            self.get_logger().info('SLAM mode is already running.')
            return

        self.stop_current_mode()
        self.cleanup_all_mode_processes()

        self.current_mode = 'slam'
        self.navigation_state = 'STANDBY'
        self.slam_state = 'STARTING'
        self.publish_mode_state()

        command = [
            'ros2',
            'launch',
            'scout_web_monitor',
            'web_slam.launch.py'
        ]

        self.get_logger().info('Starting SLAM mode...')
        self.start_process(command, 'slam')

    def start_process(self, command, mode):
        try:
            self.current_process = subprocess.Popen(
                command,
                preexec_fn=os.setsid
            )

            self.current_mode = mode
            self.get_logger().info(
                f'{mode} launch started. PID: {self.current_process.pid}'
            )

        except Exception as e:
            self.current_process = None
            self.current_mode = 'none'

            if mode == 'navigation':
                self.navigation_state = 'ERROR'
            elif mode == 'slam':
                self.slam_state = 'ERROR'

            self.publish_mode_state()
            self.get_logger().error(f'Failed to start {mode}: {str(e)}')

    def destroy_node(self):
        self.stop_current_mode()
        self.cleanup_all_mode_processes()
        super().destroy_node()


def main(args=None):
    rclpy.init(args=args)
    node = WebModeManagerNode()

    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()
