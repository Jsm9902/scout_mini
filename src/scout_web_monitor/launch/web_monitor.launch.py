import os

from ament_index_python.packages import get_package_share_directory

from launch import LaunchDescription
from launch.actions import IncludeLaunchDescription
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch_xml.launch_description_sources import XMLLaunchDescriptionSource

from launch_ros.actions import Node


def generate_launch_description():
    rosbridge_share = get_package_share_directory('rosbridge_server')
    scout_base_share = get_package_share_directory('scout_base')

    rosbridge_launch = IncludeLaunchDescription(
        XMLLaunchDescriptionSource(
            os.path.join(
                rosbridge_share,
                'launch',
                'rosbridge_websocket_launch.xml'
            )
        )
    )

    sensor_integrated_launch = IncludeLaunchDescription(
        PythonLaunchDescriptionSource(
            os.path.join(
                scout_base_share,
                'launch',
                'scout_sensor_integrated.launch.py'
            )
        )
    )

    web_video_server_node = Node(
        package='web_video_server',
        executable='web_video_server',
        name='web_video_server',
        output='screen'
    )

    web_http_server_node = Node(
        package='scout_web_monitor',
        executable='web_http_server',
        name='web_http_server_node',
        output='screen',
        parameters=[
            {
                'port': 8000
            }
        ]
    )

    web_status_node = Node(
        package='scout_web_monitor',
        executable='web_status',
        name='web_status_node',
        output='screen'
    )

    web_mode_manager_node = Node(
        package='scout_web_monitor',
        executable='web_mode_manager',
        name='web_mode_manager_node',
        output='screen'
    )

    cmd_vel_mux_node = Node(
        package='scout_navigation',
        executable='cmd_vel_mux_node',
        name='cmd_vel_mux_node',
        output='screen'
    )

    safety_stop_node = Node(
        package='scout_navigation',
        executable='safety_stop_node',
        name='safety_stop_node',
        output='screen'
    )

    return LaunchDescription([
        rosbridge_launch,
        sensor_integrated_launch,
        web_video_server_node,
        web_http_server_node,
        web_status_node,
        web_mode_manager_node,
        cmd_vel_mux_node,
        safety_stop_node
    ])
