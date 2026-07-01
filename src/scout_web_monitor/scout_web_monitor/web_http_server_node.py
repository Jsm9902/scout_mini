#!/usr/bin/env python3

import os
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

import rclpy
from rclpy.node import Node
from ament_index_python.packages import get_package_share_directory


class WebHttpServerNode(Node):
    def __init__(self):
        super().__init__('web_http_server_node')

        self.declare_parameter('port', 8000)

        self.port = self.get_parameter('port').value
        self.web_dir = os.path.join(
            get_package_share_directory('scout_web_monitor'),
            'web'
        )

        os.chdir(self.web_dir)

        self.server = ThreadingHTTPServer(
            ('0.0.0.0', self.port),
            SimpleHTTPRequestHandler
        )

        self.server_thread = threading.Thread(
            target=self.server.serve_forever,
            daemon=True
        )

        self.server_thread.start()

        self.get_logger().info(f'Web HTTP Server started: http://localhost:{self.port}')
        self.get_logger().info(f'Serving directory: {self.web_dir}')

    def destroy_node(self):
        self.get_logger().info('Stopping Web HTTP Server...')
        self.server.shutdown()
        self.server.server_close()
        super().destroy_node()


def main(args=None):
    rclpy.init(args=args)
    node = WebHttpServerNode()

    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()