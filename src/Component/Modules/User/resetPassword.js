import { useState } from 'react'
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Eye, EyeSlash } from 'react-bootstrap-icons';
import CommonTextInput from '../../Common/MultiSelect/CommonTextInput';
import AppButton from '../../Common/Buttton/button';

const ResetPassword = ({ onClose, item }) => {
    const token = Cookies.get("accessToken");
    console.log("item", item)
    const [newPassword, setNewPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false);
    const [isPasswordTouched, setIsPasswordTouched] = useState(false);


    const validatePassword = (password) => {
        const regex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/;
        return regex.test(password);
    };

    const handleReset = async (e) => {
        e.preventDefault();
        setIsPasswordTouched(true);

        if (!validatePassword(newPassword)) {
            toast.error("Please enter a valid password.");
            return; // आगे मत बढ़ो
        }

        try {
         await axios.post(`${window.runtimeConfig.REACT_APP_API_USER_MAN}/api/user-man/v1/user/resetpassword`,
                {
                    new_password: newPassword,
                    user_id: item.id,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            toast.success("Password reset successfully");
            onClose();

        } catch (error) {
            toast.error(error.response?.data?.detail || "Error while resetting password");
        }
    };

    return (

        <div className="popup-overlay" style={{ padding: '150px 100px 0px 0px' }}>
            <div className="popup-container">
                <button className="close-icon" onClick={onClose}>
                    &times;
                </button>
                <div className="popup-content">
                    <form onSubmit={handleReset}>
                        <h5>{item.username}</h5>
                        {/* <label htmlFor="title">New Password *</label> */}
                        <div style={{ position: "relative", display: "inline-block", width: "100%" }}>
                            <CommonTextInput
                                label="New Password *"
                                
                                type={showPassword ? "text" : "password"}
                                id="title"
                                name="title"
                                value={newPassword}
                                onChange={(e) => {
                                    setNewPassword(e.target.value);
                                    if (!isPasswordTouched) setIsPasswordTouched(true);
                                }}
                                onBlur={() => setIsPasswordTouched(true)}
                                placeholder="Enter your new password"
                                required
                            />

                            <span
                                onClick={() => setShowPassword((prev) => !prev)}
                                style={{
                                    position: "absolute",
                                    right: "10px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    cursor: "pointer"
                                }}
                            >
                                {showPassword ? <Eye /> : <EyeSlash />} {/* Changes icon based on visibility */}
                            </span>
                        </div>
                        {isPasswordTouched && !validatePassword(newPassword) && (
                            <p style={{ color: "red", fontSize: "12px", marginTop: "5px" }}>
                                Password must be at least 6 characters, include 1 capital letter and 1 special character.
                            </p>
                        )}

                        <div className="button-container">
                            <AppButton type="submit" className="create-btn">Reset</AppButton>
                            <AppButton type="button" className="cancel-btn" onClick={onClose}>
                                Cancel
                            </AppButton>
                        </div>
                    </form>
                </div>
            </div>
        </div>

    )
}

export default ResetPassword