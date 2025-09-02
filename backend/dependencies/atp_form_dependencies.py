from typing import Optional, List
from pydantic import AnyUrl
from fastapi import UploadFile, File, Form

def parse_technician_image_data(
        technicianUploadedImages: Optional[List[UploadFile]] = File(None),
        technicianUploadedImageUUIDs: Optional[List[str]] = Form(None),
        technicianRemoteImagePaths: Optional[List[AnyUrl]] = Form(None),
        technicianRemoteImageUUIDs: Optional[List[str]] = Form(None)
):
    technician_image_data = {}

    if technicianUploadedImages and technicianUploadedImageUUIDs:
        for uuid, image in zip(technicianUploadedImageUUIDs, technicianUploadedImages):
            #Because FormData string values are converted to strings on the backend, we need to convert 'null' back to None
            if image == 'null':
                image = None
            technician_image_data[uuid] = image

    if technicianRemoteImagePaths and technicianRemoteImageUUIDs:
        for uuid, imagePath in zip(technicianRemoteImageUUIDs, technicianRemoteImagePaths):
            #Because FormData string values are converted to strings on the backend, we need to convert 'null' back to None
            if imagePath == 'null':
                imagePath = None
            technician_image_data[uuid] = imagePath
    
    return technician_image_data

def parse_engineer_image_data(
        engineerUploadedImages: Optional[List[UploadFile]] = File(None),
        engineerUploadedImageUUIDs: Optional[List[str]] = Form(None),
        engineerRemoteImagePaths: Optional[List[AnyUrl]] = Form(None),
        engineerRemoteImageUUIDs: Optional[List[str]] = Form(None)
):
    engineer_image_data = {}

    if engineerUploadedImages and engineerUploadedImageUUIDs:
        for uuid, image in zip(engineerUploadedImageUUIDs, engineerUploadedImages):
            #Because FormData string values are converted to strings on the backend, we need to convert 'null' back to None
            if image == 'null':
                image = None
            engineer_image_data[uuid] = image
    
    if engineerRemoteImagePaths and engineerRemoteImageUUIDs:
        for uuid, imagePath in zip(engineerRemoteImageUUIDs, engineerRemoteImagePaths):
            #Because FormData string values are converted to strings on the backend, we need to convert 'null' back to None
            if imagePath == 'null':
                imagePath = None
            engineer_image_data[uuid] = imagePath
    
    return engineer_image_data

