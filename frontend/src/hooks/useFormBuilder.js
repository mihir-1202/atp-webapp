import { useState, useCallback } from 'react';

export function useFormBuilder() {
    const [formMetadata, setFormMetadata] = useState({
        title: '',
        description: ''
    });
    
    const [technicianItems, setTechnicianItems] = useState([]);
    const [engineerItems, setEngineerItems] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Update metadata
    const updateFormMetadata = useCallback((field, value) => {
        setFormMetadata(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);

    // Update items for a specific role
    const updateRoleItems = useCallback((role, items) => {
        if (role === 'technician') {
            setTechnicianItems(items);
        } else if (role === 'engineer') {
            setEngineerItems(items);
        }
    }, []);

    // Add item to a role
    const addItemToRole = useCallback((role, item) => {
        if (role === 'technician') {
            setTechnicianItems(prev => [...prev, item]);
        } else if (role === 'engineer') {
            setEngineerItems(prev => [...prev, item]);
        }
    }, []);

    // Remove item from a role
    const removeItemFromRole = useCallback((role, itemId) => {
        if (role === 'technician') {
            setTechnicianItems(prev => prev.filter(item => item.id !== itemId));
        } else if (role === 'engineer') {
            setEngineerItems(prev => prev.filter(item => item.id !== itemId));
        }
    }, []);

    // Update specific item
    const updateItem = useCallback((role, itemId, updates) => {
        const updateItems = (items) => 
            items.map(item => 
                item.id === itemId ? { ...item, ...updates } : item
            );

        if (role === 'technician') {
            setTechnicianItems(updateItems);
        } else if (role === 'engineer') {
            setEngineerItems(updateItems);
        }
    }, []);

    // Get complete form data
    const getFormData = useCallback(() => {
        return {
            metadata: {
                ...formMetadata,
                createdAt: new Date().toISOString(),
                createdBy: "current_user_id" // Replace with actual user ID
            },
            sections: {
                technician: {
                    items: technicianItems
                },
                engineer: {
                    items: engineerItems
                }
            }
        };
    }, [formMetadata, technicianItems, engineerItems]);

    // Reset form
    const resetForm = useCallback(() => {
        setFormMetadata({ title: '', description: '' });
        setTechnicianItems([]);
        setEngineerItems([]);
        setIsSubmitting(false);
    }, []);

    // Submit form
    const submitForm = useCallback(async (onSuccess, onError) => {
        setIsSubmitting(true);
        
        try {
            const formData = getFormData();
            
            const response = await fetch('/api/forms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const result = await response.json();
                onSuccess?.(result);
                resetForm();
            } else {
                const error = await response.text();
                onError?.(new Error(error));
            }
        } catch (error) {
            onError?.(error);
        } finally {
            setIsSubmitting(false);
        }
    }, [getFormData, resetForm]);

    return {
        // State
        formMetadata,
        technicianItems,
        engineerItems,
        isSubmitting,
        
        // Actions
        updateFormMetadata,
        updateRoleItems,
        addItemToRole,
        removeItemFromRole,
        updateItem,
        getFormData,
        resetForm,
        submitForm
    };
}
