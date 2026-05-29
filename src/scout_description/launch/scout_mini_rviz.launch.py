import os

from ament_index_python.packages import get_package_share_directory
from launch import LaunchDescription
from launch.substitutions import Command
from launch_ros.actions import Node


def generate_launch_description():

    # scout_description 패키지 경로
    share_dir = get_package_share_directory('scout_description')

    # Xacro 파일 경로
    xacro_filepath = os.path.join(
        share_dir,
        'urdf',
        'scout_mini',
        'scout_mini.xacro'
    )

    # Robot State Publisher
    robot_state_publisher_node = Node(
        package='robot_state_publisher',
        executable='robot_state_publisher',
        name='robot_state_publisher',
        output='screen',
        parameters=[{
            'robot_description': Command(['xacro ', xacro_filepath]),
            'use_sim_time': False
        }]
    )

    return LaunchDescription([
        robot_state_publisher_node
    ])
