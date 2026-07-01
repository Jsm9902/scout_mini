import os

from ament_index_python.packages import get_package_share_directory

from launch import LaunchDescription
from launch_ros.actions import Node


def generate_launch_description():
    scout_navigation_share = get_package_share_directory('scout_navigation')

    nav2_param_path = os.path.join(
        scout_navigation_share,
        'config',
        'nav2_params_industrial_safety.yaml'
    )

    map_file = os.path.join(
        scout_navigation_share,
        'maps',
        '4floor.yaml'
    )

    map_server_node = Node(
        package='nav2_map_server',
        executable='map_server',
        name='map_server',
        output='screen',
        parameters=[
            nav2_param_path,
            {
                'yaml_filename': map_file
            }
        ]
    )

    amcl_node = Node(
        package='nav2_amcl',
        executable='amcl',
        name='amcl',
        output='screen',
        parameters=[nav2_param_path]
    )

    planner_server_node = Node(
        package='nav2_planner',
        executable='planner_server',
        name='planner_server',
        output='screen',
        parameters=[nav2_param_path]
    )

    controller_server_node = Node(
        package='nav2_controller',
        executable='controller_server',
        name='controller_server',
        output='screen',
        parameters=[nav2_param_path],
        remappings=[
            ('/cmd_vel', '/cmd_vel_nav'),
            ('cmd_vel', '/cmd_vel_nav')
        ]
    )

    bt_navigator_node = Node(
        package='nav2_bt_navigator',
        executable='bt_navigator',
        name='bt_navigator',
        output='screen',
        parameters=[nav2_param_path]
    )

    behavior_server_node = Node(
        package='nav2_behaviors',
        executable='behavior_server',
        name='behavior_server',
        output='screen',
        parameters=[nav2_param_path]
    )

    waypoint_follower_node = Node(
        package='nav2_waypoint_follower',
        executable='waypoint_follower',
        name='waypoint_follower',
        output='screen',
        parameters=[nav2_param_path]
    )

    lifecycle_manager_node = Node(
        package='nav2_lifecycle_manager',
        executable='lifecycle_manager',
        name='lifecycle_manager_navigation',
        output='screen',
        parameters=[
            {
                'use_sim_time': False,
                'autostart': True,
                'node_names': [
                    'map_server',
                    'amcl',
                    'planner_server',
                    'controller_server',
                    'bt_navigator',
                    'behavior_server',
                    'waypoint_follower'
                ]
            }
        ]
    )

    recovery_behavior_node = Node(
        package='scout_navigation',
        executable='recovery_behavior_node',
        name='recovery_behavior_node',
        output='screen'
    )

    web_goal_manager_node = Node(
        package='scout_navigation',
        executable='web_goal_manager',
        name='web_goal_manager',
        output='screen'
    )

    return LaunchDescription([
        map_server_node,
        amcl_node,
        planner_server_node,
        controller_server_node,
        bt_navigator_node,
        behavior_server_node,
        waypoint_follower_node,
        lifecycle_manager_node,
        recovery_behavior_node,
        web_goal_manager_node
    ])