import os

from ament_index_python.packages import get_package_share_directory

from launch import LaunchDescription
from launch.actions import IncludeLaunchDescription
from launch.launch_description_sources import PythonLaunchDescriptionSource

from launch_ros.actions import Node


def generate_launch_description():

    scout_navigation_share = get_package_share_directory('scout_navigation')

    industrial_safety_integrated_launch = IncludeLaunchDescription(
        PythonLaunchDescriptionSource(
            os.path.join(
                scout_navigation_share,
                'launch',
                'scout_industrial_safety_integrated.launch.py'
            )
        )
    )

    battery_return_node = Node(
        package='scout_navigation',
        executable='battery_return_node',
        name='battery_return_node',
        output='screen'
    )

    return LaunchDescription([
        industrial_safety_integrated_launch,
        battery_return_node
    ])