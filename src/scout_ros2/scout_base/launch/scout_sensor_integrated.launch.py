import os
from ament_index_python.packages import get_package_share_directory
from launch import LaunchDescription
from launch.actions import IncludeLaunchDescription
from launch.launch_description_sources import PythonLaunchDescriptionSource
def generate_launch_description():
    scout_base_share = get_package_share_directory('scout_base')
    scout_slam_share = get_package_share_directory('scout_slam')
    scout_all_launch = IncludeLaunchDescription(
        PythonLaunchDescriptionSource(
            os.path.join(
                scout_base_share,
                'launch',
                'scout_all.launch.py'
            )
        )
    )
    vlp16_to_laserscan_launch = IncludeLaunchDescription(
        PythonLaunchDescriptionSource(
            os.path.join(
                scout_slam_share,
                'launch',
                'vlp16_to_laserscan.launch.py'
            )
        )
    )
    return LaunchDescription([
        scout_all_launch,
        vlp16_to_laserscan_launch
    ])
