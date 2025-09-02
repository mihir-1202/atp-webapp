#!/usr/bin/env python3
"""
Simple MongoDB Connection Test
"""

from dependencies import get_blob_handler

if __name__ == "__main__":
    blob_handler = get_blob_handler()
    blob_name = '68b72a997d65f2ab0500906a/technician/0.png'
    #blob_name does not include the container name
    print(blob_handler.get_blob_url(
        container_name = 'images',
        blob_name = blob_name,
        expiry_hours = 1
    ))
