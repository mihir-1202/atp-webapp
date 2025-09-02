import styles from './FieldItem.module.css';

function getPlaceholder(answerFormat)
{
    if(answerFormat === 'text' || answerFormat === 'textarea')
    {
        return 'Text';
    }
    else if(answerFormat === 'number')
    {
        return 'Number';
    }
    else if(answerFormat === 'date')
    {
        return 'Date';
    }
}

export default function FieldItem({questionUUID, questionText, answerFormat, register, role, readOnly = false, defaultValue = "", imageUrl = null })
{
    // Subtle styling for empty readonly fields to make them visible
    const emptyReadonlyStyle = readOnly && !defaultValue ? {
        backgroundColor: '#f8f9fa',
        border: '1px dashed #dee2e6',
        color: '#6c757d'
    } : {};

    //TODO: implement the logic to display the correct type of input field
    return(
        <div className={styles.fieldItem} key = {questionUUID}>
            <label className={styles.fieldLabel}>
                {questionText}
                {readOnly && !defaultValue && <span style={{color: '#6c757d', fontSize: '0.9em'}}> (No response)</span>}
            </label>

            {imageUrl && (
                <div>
                    <img src = {imageUrl} style = {{width: '50%', height: '50%', objectFit: 'contain'}} alt = "Heading Image" />
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
                    placeholder={readOnly && !defaultValue ? `No ${role} response yet` : getPlaceholder(answerFormat)} 
                    defaultValue={defaultValue} 
                    required 
                    {...register(`${role}Responses.${questionUUID}`)} 
                    readOnly={readOnly} 
                />
                :
                <textarea 
                    className={styles.fieldInput} 
                    style={{...emptyReadonlyStyle}}
                    placeholder={readOnly && !defaultValue ? `No ${role} response yet` : getPlaceholder(answerFormat)} 
                    defaultValue={defaultValue} 
                    required {...register(`${role}Responses.${questionUUID}`)} 
                    readOnly={readOnly}
                />
            }

            
        </div>

    )
}