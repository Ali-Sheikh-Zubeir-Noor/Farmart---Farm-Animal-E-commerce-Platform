#!/usr/bin/env python3
"""
Farmart Application Runner
Run this file to start the Flask development server
"""


from app import app


if __name__ == '__main__':
   app.run(
       host='0.0.0.0',
       port=5000,
       debug=True
   )
