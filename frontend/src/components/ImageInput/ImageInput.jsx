import React, { useState, useRef } from 'react';
import styles from './ImageInput.module.css';

export default function ImageInput({
    id,
    label,
    role,
    index,
    setValue,
    imageUrl = null,
    imageBlobPath = null,
    className = ''
}) {

    const [usingRemoteImage, setUsingRemoteImage] = useState(imageUrl ? true : false);
    const [localImage, setLocalImage] = useState(null);
    const fileInputRef = useRef(null);


    // Don't register the field automatically - we'll manage it manually
    // const { onChange: defaultOnChange, ...registerWithoutDefaultOnChange } = register(`sections.${role}.items.${index}.image`);
    

    // Initialize the form field when component mounts
    React.useEffect(() => {
        if (usingRemoteImage) 
        {
            setValue(`sections.${role}.items.${index}.hasImage`, true);
            setValue(`sections.${role}.items.${index}.image`, imageBlobPath);
        } 
        else 
        {
            setValue(`sections.${role}.items.${index}.hasImage`, false);
            setValue(`sections.${role}.items.${index}.image`, null);
        }
    }, [usingRemoteImage, setValue, role, index]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setLocalImage(file);
        
        // Extract the file from FileList and set it directly
        if (file) 
        {
            setValue(`sections.${role}.items.${index}.image`, file);
        } 
        else 
        {
            setValue(`sections.${role}.items.${index}.image`, null);
        }
        setUsingRemoteImage(false);

        //THE FIELD KEY WILL EITHER BE A FILE OBJECT, URL STRING, OR NULL
    };

    const handleRemoveImage = () => {
        if (localImage) {
            setLocalImage(null);
        }
        if (usingRemoteImage) {
            setUsingRemoteImage(false);
        }

        // Clear the file input value
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }

        // Reset the form fields
        setValue(`sections.${role}.items.${index}.image`, null);
        setValue(`sections.${role}.items.${index}.hasImage`, false);
    };

    return (
        <div className={`${styles.imageInputContainer} ${className}`}>
            <label htmlFor={id} className={styles.inputLabel}>
                {label}
            </label>
            
            {/*
            -attach fileInputRef to the image input element so we can manually update the input's DOM properties when an image is removed
            -When an image is changed, we want to implement a custom onChange function that updates the localImage state to provide a preview of the image AND ALSO
            update the useForm's internal state (combining custom onChange logic with the onChange logic that is provided by the register function)
            */}
            <input 
                ref={fileInputRef}
                id={id}
                type="file" 
                accept="image/*" 
                onChange={handleFileChange}
            />

            {/* Remove Image Button */}
            {(localImage || usingRemoteImage) && (
                <button 
                    type="button" 
                    className={styles.removeButton}
                    onClick={handleRemoveImage}
                >
                    Remove Image
                </button>
            )}

            {/* Image Preview */}
            {(localImage || usingRemoteImage) && (
                <img 
                    src={localImage ? URL.createObjectURL(localImage) : imageUrl} 
                    className={styles.imagePreview}
                    alt="Image Preview" 
                />
            )}
        </div>
    );
}
