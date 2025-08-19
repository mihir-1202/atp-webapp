import styles from '../../styles/FillATPPage.module.css';

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

export default function FieldItem({id, question, answerFormat, register, userRole, defaultValue = "" })
{
    //TODO: implement the logic to display the correct type of input field
    return(
        <div className={styles.fieldItem} key = {id}>
            <label className={styles.fieldLabel}>{question}</label>
            {answerFormat !== 'textarea' ? 
                //JS object keys are always strings
                //Since order becomes the key, it will be converted to a string so we need to parse it back into a number later
                //(RHF) interprets numeric keys in the field name as array indices, regardless of whether you use dot notation (foo.0.bar) or bracket notation (foo[0].bar).
                <input type={answerFormat} className={styles.fieldInput} placeholder={getPlaceholder(answerFormat)} defaultValue={defaultValue} {...register(`${userRole}Responses.${id}`)} />
                :
                <textarea className={styles.fieldInput} placeholder={getPlaceholder(answerFormat)} defaultValue={defaultValue} {...register(`${userRole}Responses.${id}`)}></textarea>
            }
        </div>

    )
}