from typing import Optional, List
from pydantic import AnyUrl
from fastapi import UploadFile, File, Form

def parse_technician_image_data(
        technicianUploadedImages: Optional[List[UploadFile]] = File(None),
        technicianUploadedImageIndices: Optional[List[int]] = Form(None),
        technicianRemoteImages: Optional[List[AnyUrl]] = Form(None),
        technicianRemoteImageIndices: Optional[List[int]] = Form(None)
):
    technician_image_data = {}

    if technicianUploadedImages and technicianUploadedImageIndices:
        for index, image in zip(technicianUploadedImageIndices, technicianUploadedImages):
            technician_image_data[index] = image

    if technicianRemoteImages and technicianRemoteImageIndices:
        for index, image in zip(technicianRemoteImageIndices, technicianRemoteImages):
            technician_image_data[index] = image
    
    return technician_image_data

def parse_engineer_image_data(
        engineerUploadedImages: Optional[List[UploadFile]] = File(None),
        engineerUploadedImageIndices: Optional[List[int]] = Form(None),
        engineerRemoteImages: Optional[List[AnyUrl]] = Form(None),
        engineerRemoteImageIndices: Optional[List[int]] = Form(None)
):
    engineer_image_data = {}

    if engineerUploadedImages and engineerUploadedImageIndices:
        for index, image in zip(engineerUploadedImageIndices, engineerUploadedImages):
            engineer_image_data[index] = image
    
    if engineerRemoteImages and engineerRemoteImageIndices:
        for index, image in zip(engineerRemoteImageIndices, engineerRemoteImages):
            engineer_image_data[index] = image
    
    return engineer_image_data

