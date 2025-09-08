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

    // Stateless preview: only track user's selected file
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileName, setFileName] = useState(imageBlobPath || 'No file chosen');
    const fileInputRef = useRef(null);
    const clearedRemoteImage = useRef(false);



    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setSelectedFile(file || null);
        
        // Extract the file from FileList and set it directly
        if (file) 
        {
            setValue(`sections.${role}.items.${index}.hasImage`, true);
            setValue(`sections.${role}.items.${index}.image`, file);
            setFileName(file.name);
        } 
        else 
        {
            setValue(`sections.${role}.items.${index}.hasImage`, false);
            setValue(`sections.${role}.items.${index}.image`, null);
            setFileName('No file chosen');
        }
        clearedRemoteImage.current = true;

        //THE FIELD KEY WILL EITHER BE A FILE OBJECT, URL STRING, OR NULL
    };

    const handleRemoveImage = () => {
        setSelectedFile(null);

        // Clear the file input value
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }

        // Reset the form fields
        setValue(`sections.${role}.items.${index}.hasImage`, false);
        setValue(`sections.${role}.items.${index}.image`, null);
        setFileName('No file chosen');
        clearedRemoteImage.current = true; // prevent remote from reappearing
        
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
            <div className={styles.controlsRow}>
                <input 
                    ref={fileInputRef}
                    id={id}
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange}
                    className={`${styles.fileInputNative} ${styles.wideFileInput}`}
                />
                <span className={styles.fileName}>{fileName}</span>
                
                {(selectedFile || (!clearedRemoteImage.current && imageUrl)) && (
                    <button 
                        type="button" 
                        className={styles.removeButton}
                        onClick={handleRemoveImage}
                    >
                        Remove Image
                    </button>
                )}
            </div>

            {/* Image Preview */}
            {(selectedFile || (!clearedRemoteImage.current && imageUrl)) && (
                <div className={styles.imagePreviewContainer}>
                    <img 
                        src={selectedFile ? URL.createObjectURL(selectedFile) : imageUrl} 
                        className={styles.imagePreview}
                        alt="Image Preview" 
                    />
                </div>
            )}
        </div>
    );
}
