from typing import Optional, List
from fastapi import UploadFile, File, Form

#Returns a dictionary mapping each item's uuid to its image data (item's without images, hasImage = False, will not be included in the dictionary since the frontend doesn't send this data)
def parse_technician_image_data(
        technicianUploadedImages: Optional[List[UploadFile]] = File(None),
        technicianUploadedImageUUIDs: Optional[List[str]] = Form(None),
        technicianRemoteImagePaths: Optional[List[str]] = Form(None),
        technicianRemoteImageUUIDs: Optional[List[str]] = Form(None)
):
    print(f"parse_technician_image_data called with:")
    print(f"  technicianUploadedImages: {technicianUploadedImages}")
    print(f"  technicianUploadedImageUUIDs: {technicianUploadedImageUUIDs}")
    print(f"  technicianRemoteImagePaths: {technicianRemoteImagePaths}")
    print(f"  technicianRemoteImageUUIDs: {technicianRemoteImageUUIDs}")
    
    technician_image_data = {}

    if technicianUploadedImages and technicianUploadedImageUUIDs:
        print(f"Processing uploaded images: {len(technicianUploadedImages)} images, {len(technicianUploadedImageUUIDs)} UUIDs")
        for uuid, image in zip(technicianUploadedImageUUIDs, technicianUploadedImages):
            print(f"  Adding uploaded image for UUID {uuid}: {image}")
            technician_image_data[uuid] = image

    if technicianRemoteImagePaths and technicianRemoteImageUUIDs:
        print(f"Processing remote image paths: {len(technicianRemoteImagePaths)} paths, {len(technicianRemoteImageUUIDs)} UUIDs")
        for uuid, imagePath in zip(technicianRemoteImageUUIDs, technicianRemoteImagePaths):
            print(f"  Adding remote image path for UUID {uuid}: {imagePath}")
            technician_image_data[uuid] = imagePath
    
    print(f"Final technician_image_data: {technician_image_data}")
    return technician_image_data

#Returns a dictionary mapping each item's uuid to its image data (item's without images, hasImage = False, will not be included in the dictionary since the frontend doesn't send this data)
def parse_engineer_image_data(
        engineerUploadedImages: Optional[List[UploadFile]] = File(None),
        engineerUploadedImageUUIDs: Optional[List[str]] = Form(None),
        engineerRemoteImagePaths: Optional[List[str]] = Form(None),
        engineerRemoteImageUUIDs: Optional[List[str]] = Form(None)
):
    engineer_image_data = {}

    if engineerUploadedImages and engineerUploadedImageUUIDs:
        for uuid, image in zip(engineerUploadedImageUUIDs, engineerUploadedImages):
            engineer_image_data[uuid] = image
    
    if engineerRemoteImagePaths and engineerRemoteImageUUIDs:
        for uuid, imagePath in zip(engineerRemoteImageUUIDs, engineerRemoteImagePaths):
            engineer_image_data[uuid] = imagePath
    
    return engineer_image_data

