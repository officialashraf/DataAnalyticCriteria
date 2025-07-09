import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import Select from 'react-select';
import '../User/addUser.css';
import { CloseButton } from 'react-bootstrap';
//import { customStyles } from '../Case/createCase'; // Adjust the import path as needed
import CommonTextInput from '../../Common/MultiSelect/CommonTextInput';
import SelectFieldOutlined from '../../Common/MultiSelect/SelectFieldOutlined';
import AppButton from '../../Common/Buttton/button'
import { customStyles } from '../Case/createCase'; // Adjust the import path as needed


const AssignRole = ({ togglePopup, details }) => {
    const token = Cookies.get('accessToken');
    const [endpoints, setEndpoints] = useState([]);
    const [roles, setRoles] = useState([]);
    const [selectedRole, setSelectedRole] = useState(null);
    const [selectedEndpoints, setSelectedEndpoints] = useState([]);
    const [initialEndpoints, setInitialEndpoints] = useState([]);
    const [loading, setLoading] = useState(false);
    const [endpointsLoading, setEndpointsLoading] = useState(false);
    const [rolesLoading, setRolesLoading] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    console.warn("detailsrole", details)
    console.log("selectedEndpoints", selectedEndpoints);

    useEffect(() => {
        if (details?.role) {
            setSelectedRole({
                value: details.id,
                label: details.role,
            });
        }
    }, [details]);

    const fetchEndpoints = useCallback(async () => {
        setEndpointsLoading(true);
        try {
            const response = await axios.get(
                `${window.runtimeConfig.REACT_APP_API_USER_MAN}/api/user-man/v1/endpoints`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );
            if (response.data && Array.isArray(response.data)) {
                const formatted = response.data.map(item => ({
                    value: item.endpoint,
                    label: item.endpoint.charAt(0).toUpperCase() + item.endpoint.slice(1).toLowerCase(),
                    isAssigned: item.roles?.includes(details.role)
                }));
                setEndpoints(formatted);

                const preSelected = formatted.filter(item => item.isAssigned);
                setSelectedEndpoints(preSelected);
                setInitialEndpoints(preSelected.map(endpoint => endpoint.value));
            }
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to load permissions');
        } finally {
            setEndpointsLoading(false);
        }
    }, [token, details.role]);

    const fetchRoles = useCallback(async () => {
        setRolesLoading(true);
        try {
            const response = await axios.get(
                `${window.runtimeConfig.REACT_APP_API_USER_MAN}/api/user-man/v1/role`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );
            if (response.data && Array.isArray(response.data)) {
                const formattedRoles = response.data.map(item => ({
                    value: item.role,
                    label: item.role
                }));
                setRoles(formattedRoles);
            }
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to load roles');
        } finally {
            setRolesLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchEndpoints();
        fetchRoles();
    }, [fetchEndpoints, fetchRoles]);



    const assignRole = async () => {
        setLoading(true);

        try {
            const currentSelectedValues = selectedEndpoints.map(endpoint => endpoint.value);

            const permissionsToAdd = currentSelectedValues.filter(
                endpointValue => !initialEndpoints.includes(endpointValue)
            );

            const permissionsToRemove = initialEndpoints.filter(
                endpointValue => !currentSelectedValues.includes(endpointValue)
            );

            if (permissionsToAdd.length === 0 && permissionsToRemove.length === 0) {
                toast.info("No changes to apply");
                setLoading(false);
                return;
            }

            const payload = {
                role_id: details.id,  // id nahi, role name hi bhej rahe ho text input me dikhate time
                permissions: permissionsToAdd.map(permission => String(permission).toLowerCase()),
                permissions_to_remove: permissionsToRemove.map(permission => String(permission).toLowerCase())
            };

            console.warn("API Payload:", payload);

            await axios.post(
                `${window.runtimeConfig.REACT_APP_API_USER_MAN}/api/user-man/v1/assign-role`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            const customStyles = {
                control: base => ({
                    ...base,
                    backgroundColor: '#101d2b',
                    color: 'white',
                    boxShadow: 'none',
                    outline: 'none'
                }),
                menuList: (provided) => ({
                    ...provided,
                    maxHeight: '150px',
                    overflowY: 'auto',
                }),
                menu: base => ({
                    ...base,
                    backgroundColor: '#101d2b',
                    color: 'white',
                    maxHeight: 'unset'
                }),
                option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isFocused ? '#f0f0f0' : 'white',
                    color: 'black',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px'
                })
            };

            window.dispatchEvent(new Event("databaseUpdated"));
            toast.success("Role permissions updated successfully");
            togglePopup(false);

        } catch (error) {
            console.error("API Error:", error);
            toast.error(error.response?.data?.detail || 'Failed to update role permissions');
        } finally {
            setLoading(false);
        }
    };
    // Custom checkbox option
    const CheckboxOption = props => {
        const { data, isSelected, innerRef, innerProps } = props;
        const isSelectAll = data.value === '_select_all_';
        return (
            <div ref={innerRef} {...innerProps} style={{
                display: 'flex',
                alignItems: 'center',
                padding: 5,
                backgroundColor: '#101d2b'
            }}>
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => null}
                    style={{ marginRight: 10 }}
                />
                {/* <label>
                    {data.label}
                    {data.isAssigned && <span style={{ color: '#666', marginLeft: 5 }}>(already assigned)</span>} 
                </label> */}
                <label>
                    {isSelectAll ? 'Select All' : data.label}
                    {!isSelectAll && data.isAssigned}
                </label>
            </div>
        );
    };
    return (
        <div className="popup-overlay" style={{ top: 0, left: 0, width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1050 }}>
            <div className="popup-container" style={{ alignItems: 'center' }}>
                <div className="popup-content" style={{ width: '80%', minHeight: isDropdownOpen ? "60vh" : "230px", position: "relative" }}>
                    <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                        <h5 >Assign Permissions to Role</h5>
                        <CloseButton variant="white" onClick={togglePopup} />
                    </span>
                    <form onSubmit={(e) => e.preventDefault()}>
                        <div className="form-group" style={{ marginBottom: '15px', color: 'white'}}>
                            {/* <label>Role</label> */}
                            <CommonTextInput
                                label="Role"
                                // style={{ backgroundColor: 'lightgray' }}
                                value={details.role}
                                disabled
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: '15px' }}>
                            <SelectFieldOutlined
                                label="Select Permission"
                                options={[{ label: 'Select All', value: '_select_all_' }, ...endpoints]}
                                // options={endpoints}
                                // styles={customStyles}
                                placeholder="Select permissions"
                                isLoading={endpointsLoading}
                                value={selectedEndpoints}
                                // onChange={setSelectedEndpoints}
                                onChange={(selected) => {
                                    if (!selected) return setSelectedEndpoints([]);

                                    const isSelectAllClicked = selected.find(opt => opt.value === '_select_all_');
                                    if (isSelectAllClicked) {
                                        const areAllSelected = selectedEndpoints.length === endpoints.length;
                                        if (areAllSelected) {
                                            setSelectedEndpoints([]);
                                        } else {
                                            setSelectedEndpoints(endpoints);
                                        }
                                    } else {
                                        setSelectedEndpoints(selected);
                                    }
                                }}
                                isMulti
                                closeMenuOnSelect={false}
                                hideSelectedOptions={false}
                                components={{ Option: CheckboxOption, MultiValue: () => null }}
                                onMenuOpen={() => setIsDropdownOpen(true)} //
                                smallNote="Check/Uncheck permissions to add or remove them from the role"
></SelectFieldOutlined>
   
                          

                        </div>

                        <div style={{
                            position: "absolute",
                            bottom: "10px",
                            width: "100%",
                            display: "flex",
                            justifyContent: "flex-end",
                            right: '10px',
                            gap: '10px'
                        }}>
                            <AppButton
                                type="submit"
                                className="create-btn"
                                onClick={assignRole}
                                disabled={loading}
                            >
                                {loading ? 'Assigning...' : 'Assign'}
                            </AppButton>
                            <AppButton
                                type="button"
                                className="cancel-btn"
                                onClick={() => togglePopup(false)}
                                disabled={loading}
                            >
                                Cancel
                            </AppButton>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AssignRole;