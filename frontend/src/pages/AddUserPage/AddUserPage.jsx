import Navbar from '../../components/Navbar/Navbar';
import styles from './AddUserPage.module.css';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from '../../auth/UserProvider';
import UnauthorizedUI from '../../components/UnauthorizedUI/UnauthorizedUI.jsx';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function AddUserPage()
{
    const {register, handleSubmit} = useForm();
    const navigate = useNavigate();
    
    const user = useContext(UserContext);
    if (user.userRole !== 'admin')
    {
        return <UnauthorizedUI message='You are not authorized to add users' />;
    }

    function onSubmit(data)
    {
        
        const addUser = async () => {
            const response = await fetch(`${API_BASE_URL}/atp-users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const responseData = await response.json();
            if (!response.ok)
                alert(responseData.message);

            else{
                alert("Successfully added user");
                navigate('/');
            }
            
        }

        addUser();
    }

    return(
        <>
            <Navbar />
            <div className = {styles.addUserPage}>
                <h1>Add User</h1>
                <form onSubmit = {handleSubmit(onSubmit)}>
                    <label htmlFor = "userEmail">User Email</label>
                    <input type = "text" placeholder = "User Email" id = "userEmail" {...register("userEmail")} />
                    
                    <label htmlFor = "userRole">User Role</label>
                    <select id = "userRole" {...register("userRole")}>
                        <option value = "technician">Technician</option>
                        <option value = "engineer">Engineer</option>
                        <option value = "admin">Admin</option>
                    </select>
                    
                    <button type = "submit">Add User</button>
                </form>
            </div>
        </>
    )
}