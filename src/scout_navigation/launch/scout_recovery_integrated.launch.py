import os
from ament_index_python.packages import get_package_share_directory
from launch import LaunchDescription
from launch.actions import IncludeLaunchDescription
from launch.launch_description_sources import PythonLaunchDescriptionSource
def generate_launch_description():
    scout_base_share = get_package_share_directory('scout_base')
    scout_navigation_share = get_package_share_directory('scout_navigation')
    sensor_integrated_launch = IncludeLaunchDescription(
        PythonLaunchDescriptionSource(
            os.path.join(
                scout_base_share,
                'launch',
                'scout_sensor_integrated.launch.py'
            )
        )
    )
    recovery_launch = IncludeLaunchDescription(
        PythonLaunchDescriptionSource(
            os.path.join(
                scout_navigation_share,
                'launch',
                'scout_navigation_recovery.launch.py'
            )
        )
    )
    return LaunchDescription([
        sensor_integrated_launch,
        recovery_launch
    ])