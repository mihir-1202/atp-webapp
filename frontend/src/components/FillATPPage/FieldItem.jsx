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

export default function FieldItem({id, question, answerFormat, register})
{
    //TODO: implement the logic to display the correct type of input field
    return(
        <div className={styles.fieldItem} key = {id}>
            <label className={styles.fieldLabel}>{question}</label>
            {answerFormat !== 'textarea' ? 
                <input type={answerFormat} className={styles.fieldInput} placeholder={getPlaceholder(answerFormat)} {...register(`technicianResponses.${id}`)} />
                :
                <textarea className={styles.fieldInput} placeholder={getPlaceholder(answerFormat)} {...register(`technicianResponses.${id}`)}></textarea>
            }
        </div>

    )
}