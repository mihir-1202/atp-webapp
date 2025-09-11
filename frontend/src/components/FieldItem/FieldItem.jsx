import styles from './FieldItem.module.css';

function getPlaceholder(answerFormat)
{
    if(answerFormat === 'text' || answerFormat === 'textarea')
    {
        return 'example: Sample Text';
    }
    else if(answerFormat === 'number')
    {
        return 'example: 1.0652';
    }
    else if(answerFormat === 'date')
    {
        return 'example: 2025-01-01';
    }
}

export default function FieldItem({questionUUID, questionText, answerFormat, register, role, readOnly = false, imageUrl = null, setValue})
{
    // Subtle styling for empty readonly fields to make them visible
    const emptyReadonlyStyle = readOnly ? {
        backgroundColor: '#f8f9fa',
        border: '1px dashed #dee2e6',
        color: '#6c757d'
    } : {};

    const {onChange: defaultOnChange, ...registerWithoutDefaultOnChange} = register(`${role}Responses.${questionUUID}.response`);

    function handleChange(e)
    {
        setValue(`${role}Responses.${questionUUID}.lastEdited`, new Date().toISOString());
        defaultOnChange(e);
    }

    //TODO: implement the logic to display the correct type of input field
    return(
        <div className={styles.fieldItem} key = {questionUUID}>
            <label className={styles.fieldLabel}>
                {questionText}
            </label>

            {imageUrl && (
                <div className={styles.imageContainer}>
                    <img src = {imageUrl} className={styles.fieldImage} alt = "Field Image" />
                </div>
            )}

            {answerFormat !== 'textarea' ? 
                //JS object keys are always strings
                //Since order becomes the key, it will be converted to a string so we need to parse it back into a number later
                //(RHF) interprets numeric keys in the field name as array indices, regardless of whether you use dot notation (foo.0.bar) or bracket notation (foo[0].bar).
                <input 
                    type={answerFormat} 
                    className={styles.fieldInput} 
                    style={{...emptyReadonlyStyle}}
                    placeholder={readOnly ? `No ${role} response yet` : getPlaceholder(answerFormat)} 
                    required 
                    {...registerWithoutDefaultOnChange} 
                    onChange = {handleChange}
                    readOnly={readOnly} 
                />
                :
                <textarea 
                    className={styles.fieldInput} 
                    style={{...emptyReadonlyStyle}}
                    placeholder={readOnly ? `No ${role} response yet` : getPlaceholder(answerFormat)} 
                    required {...registerWithoutDefaultOnChange} 
                    onChange = {handleChange}
                    readOnly={readOnly}
                />
            }

            
        </div>

    )
}