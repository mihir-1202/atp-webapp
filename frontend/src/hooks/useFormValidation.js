import { useState, useMemo } from 'react';

export function useFormValidation(formData) {
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};

        // Validate metadata
        if (!formData.metadata?.title?.trim()) {
            newErrors.title = 'Form title is required';
        }

        if (!formData.metadata?.description?.trim()) {
            newErrors.description = 'Form description is required';
        }

        // Validate sections have at least one item
        if (!formData.sections?.technician?.items?.length) {
            newErrors.technician = 'Technician section must have at least one item';
        }

        if (!formData.sections?.engineer?.items?.length) {
            newErrors.engineer = 'Engineer section must have at least one item';
        }

        // Validate individual items
        ['technician', 'engineer'].forEach(role => {
            formData.sections?.[role]?.items?.forEach((item, index) => {
                if (item.type === 'heading' && !item.content?.trim()) {
                    newErrors[`${role}_heading_${index}`] = 'Heading text is required';
                }
                
                if (item.type === 'field') {
                    if (!item.question?.trim()) {
                        newErrors[`${role}_question_${index}`] = 'Question is required';
                    }
                    
                    if ((item.answerFormat === 'checkbox' || item.answerFormat === 'radio') 
                        && (!item.options || item.options.length < 2)) {
                        newErrors[`${role}_options_${index}`] = 'At least 2 options required';
                    }
                }
            });
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const isValid = useMemo(() => {
        return Object.keys(errors).length === 0;
    }, [errors]);

    return {
        errors,
        isValid,
        validateForm,
        setErrors
    };
}
