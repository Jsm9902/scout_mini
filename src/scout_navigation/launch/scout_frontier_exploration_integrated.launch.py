import os

from ament_index_python.packages import get_package_share_directory

from launch import LaunchDescription
from launch.actions import IncludeLaunchDescription
from launch.launch_description_sources import PythonLaunchDescriptionSource


def generate_launch_description():

    scout_navigation_share = get_package_share_directory('scout_navigation')
    scout_exploration_share = get_package_share_directory('scout_exploration')

    industrial_safety_integrated_launch = IncludeLaunchDescription(
        PythonLaunchDescriptionSource(
            os.path.join(
                scout_navigation_share,
                'launch',
                'scout_industrial_safety_integrated.launch.py'
            )
        )
    )

    frontier_exploration_launch = IncludeLaunchDescription(
        PythonLaunchDescriptionSource(
            os.path.join(
                scout_exploration_share,
                'launch',
                'frontier_exploration.launch.py'
            )
        )
    )

    return LaunchDescription([
        industrial_safety_integrated_launch,
        frontier_exploration_launch
    ])