from setuptools import find_packages, setup
import os
from glob import glob

package_name = 'scout_web_monitor'


def get_web_data_files():
    data_files = []

    for root, dirs, files in os.walk('web'):
        if files:
            install_dir = os.path.join(
                'share',
                package_name,
                root
            )

            data_files.append((
                install_dir,
                [os.path.join(root, file) for file in files]
            ))

    return data_files


setup(
    name=package_name,
    version='0.0.0',
    packages=find_packages(exclude=['test']),
    data_files=[
        ('share/ament_index/resource_index/packages',
            ['resource/' + package_name]),
        ('share/' + package_name,
            ['package.xml']),
        (os.path.join('share', package_name, 'launch'),
            glob('launch/*.launch.py')),
    ] + get_web_data_files(),
    install_requires=['setuptools'],
    zip_safe=True,
    maintainer='i421',
    maintainer_email='i421@todo.todo',
    description='Scout Mini Web Monitor Package',
    license='TODO',
    tests_require=['pytest'],
    entry_points={
        'console_scripts': [
            'web_http_server = scout_web_monitor.web_http_server_node:main',
            'web_status = scout_web_monitor.web_status_node:main',
            'web_mode_manager = scout_web_monitor.web_mode_manager_node:main',
        ],
    },
)