import os

from ament_index_python.packages import get_package_share_directory

from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node


def generate_launch_description():
    scout_slam_share = get_package_share_directory('scout_slam')

    slam_config_path = os.path.join(
        scout_slam_share,
        'config',
        'mapper_params_online_async.yaml'
    )

    load_map_arg = DeclareLaunchArgument(
        'load_map',
        default_value='',
        description='기존 posegraph를 이어서 사용할 때 입력하는 파일 이름'
    )

    load_map_name = LaunchConfiguration('load_map')

    slam_toolbox_node = Node(
        package='slam_toolbox',
        executable='async_slam_toolbox_node',
        name='slam_toolbox',
        output='screen',
        parameters=[
            slam_config_path,
            {
                'use_sim_time': False,
                'map_file_name': [
                    os.path.expanduser('~'),
                    '/scout_ws/',
                    load_map_name
                ],
                'map_start_at_dock': True
            }
        ]
    )

    slam_manager_node = Node(
        package='scout_slam',
        executable='slam_manager',
        name='slam_manager_node',
        output='screen'
    )

    return LaunchDescription([
        load_map_arg,
        slam_toolbox_node,
        slam_manager_node
    ])