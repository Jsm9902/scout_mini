import os

from launch import LaunchDescription
from launch.actions import IncludeLaunchDescription
from launch.launch_description_sources import AnyLaunchDescriptionSource
from launch_ros.actions import Node
from ament_index_python.packages import get_package_share_directory


def generate_launch_description():

    rosbridge_share = get_package_share_directory('rosbridge_server')

    rosbridge_launch = IncludeLaunchDescription(
        AnyLaunchDescriptionSource(
            os.path.join(
                rosbridge_share,
                'launch',
                'rosbridge_websocket_launch.xml'
            )
        )
    )

    web_goal_manager = Node(
        package='scout_navigation',
        executable='web_goal_manager',
        name='web_goal_manager',
        output='screen'
    )

    return LaunchDescription([
        rosbridge_launch,
        web_goal_manager
    ])
