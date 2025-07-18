import "../Case/tableGlobal.css";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import AddRole from "./addRole";
import DetailsPermission from "./details_Permission";
import AssignRole from "./asignRole";
import EditRole from "./editRole";
import Loader from "../Layout/loader";
import TableModal from "../../Common/Table/table";
import AppButton from "../../Common/Buttton/button";

const RolesPermission = () => {

    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [showPopupB, setShowPopupB] = useState(false);
    const [showPopupC, setShowPopupC] = useState(false);
    const [showPopupD, setShowPopupD] = useState(false);
    const [loading, setLoading] = useState(false);
    const [popupDetails, setPopupDetails] = useState(null);

    // const togglePopup = () => {
    //     setShowPopup(prev => !prev);
    // };
    const [selectedRoleId, setSelectedRoleId] = useState(null);
    const togglePopup = () => {
        setShowPopup(prev => !prev);
    };
    const toggleDetailsPopup = (roleId) => {
        setSelectedRoleId(roleId);
        setShowPopupB(prev => !prev);
    };

    const togglePopupC = (details) => {
        setPopupDetails(details);
        setShowPopupC(prev => !prev);
    };
    const togglePopupD = (details) => {
        setPopupDetails(details);
        setShowPopupD(prev => !prev);
    };

    const fetchRoles = async () => {
        try {
            setLoading(true);
            const token = Cookies.get("accessToken");
            const response = await axios.get(`${window.runtimeConfig.REACT_APP_API_USER_MAN}/api/user-man/v1/role`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            console.log("resposne from roles", response)
            setData(response.data);
            console.log("data from roles", response)
            setFilteredData(response.data);
        } catch (error) {
            if (error.response && error.response.data && error.response.data.detail) {
                toast.error(error.response.data.detail);
            } else {
                console.error("An error occurred:", error.message);
            }
            console.error(error);
        } finally {
            setLoading(false);
        }
    };





    useEffect(() => {

        fetchRoles();

        const handleDatabaseUpdated = () => {
            fetchRoles();
        };

        window.addEventListener("databaseUpdated", handleDatabaseUpdated);
        return () => {
            window.removeEventListener("databaseUpdated", handleDatabaseUpdated);
        };
    }, []);

    const confirmDelete = (role) => {
        toast((t) => (
            <div>
                <p>Are you sure you want to delete {role} role?</p>
                <button className='custom-confirm-button' onClick={() => { deleteRole(role); toast.dismiss(t.role); }} style={{ padding: "4px 1px", fontSize: "12px", width: "20%" }}>Yes</button>
                <button className='custom-confirm-button' onClick={() => toast.dismiss(t.role)} style={{ padding: "4px 1px", fontSize: "12px", width: "20%" }} >No</button> </div>),
            {
                autoClose: false, closeOnClick: false, draggable: false, style: {
                    position: 'fixed',
                    top: '300px',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '100%',
                    zIndex: 9999,
                    background: '#101D2B',
                    color: "#d2d2d2"
                }
            },)
    };
    const deleteRole = async (role) => {
        const token = Cookies.get("accessToken");
        if (!token) {
            console.error("No token found in cookies.");
            return;
        }
        try {

            const response = await axios.delete(`${window.runtimeConfig.REACT_APP_API_USER_MAN}/api/user-man/v1/role/${role}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
            window.dispatchEvent(new Event("databaseUpdated"));
            toast.success(`Role ${role} deleted successfully`)
            console.log("Role Deleted:", response.data);

            // After successful deletion, fetch the updated data
            //fetchData(); // Optionally refresh data after deletion

        } catch (err) {
            // Error handling based on the type of error
            console.error('Error during login:', err);

            if (err.response) {

                toast.error(err.response?.data?.detail || 'Something went wrong. Please try again');

            } else if (err.request) {
                // No response from the server
                toast.error('No response from the server. Please check your connection');
            } else {
                // Unknown error occurred
                toast.error('An unknown error occurred. Please try again');
            }
        }
    };

    if (loading) {
        return <Loader />
    }
    const roleColumns = [
        { key: "id", label: "Role ID" },
        { key: "role", label: "Roles" },
        { key: "created_on", label: "Created On" },
        { key: "created_by", label: "Created By" },
        { key: "modified_on", label: "Edited On" },
        { key: "modified_by", label: "Edited By" },

    ];

    return (
        <>
            {data && data.length > 0 ? (
                <div>
                    {/* <FaArrowLeft
                                style={{
                                    cursor: 'pointer', margin: '0px 40px 0px 38px',
                                    fontSize: '18px'
                                }}

                                onClick={() => navigate('/admin')}
                            /> */}
                    <TableModal
                        title="Role Dashboard"
                        data={data}
                        columns={roleColumns}
                        onRowAction={{
                            details: (row) => toggleDetailsPopup(row.id),
                            delete: (row) => confirmDelete(row.role),
                            edit: (row) => togglePopupC(row.role),
                            assign: (row) => togglePopupD(row)
                        }}
                        onAddClick={() => togglePopup()}
                        idPrefix="ROLE"
                        btnTitle=" + Add New Role"
                    />
                </div>


            ) : (
                <div className="resourcesContainer" style={{ border: 'none' }}>
                    <h3 className="title">Let's Get Started!</h3>
                    <p className="content">Add roles to get started</p>
                    {/* <button className='add-btn' title='Add New Case' onClick={togglePopup}><Plus size={20} />Add New Roles</button> */}
                    <AppButton onClick={togglePopup} children={" + Add New Role"} />
                </div>
            )
            }
            {showPopup && <AddRole togglePopup={togglePopup} />}
            {showPopupB && <DetailsPermission roleId={selectedRoleId} toggleDetails={toggleDetailsPopup} />}
            {showPopupC && <EditRole togglePopup={togglePopupC} details={popupDetails} />}
            {showPopupD && <AssignRole togglePopup={togglePopupD} details={popupDetails} />}
        </>
    );
};

export default RolesPermission;
{/*<div className="data-table-container">
                    <div className="top-header" style={{ marginTop: "10px" }}>
                        <Col xs={1} className="d-flex align-items-center justify-content-flex-start" style={{ width: "300px", minWidth: "300px" }}>
                            <FaArrowLeft
                                style={{
                                    cursor: 'pointer', margin: '0px 40px 0px 38px',
                                    fontSize: '18px'
                                }}

                                onClick={() => navigate('/admin')}
                            />
                            <div className="search-bar1" style={{ width: '100%' }}>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search"
                                    value={searchTerm}
                                    onChange={handleSearch}
                                />
                            </div> 
                        </Col>
                        <div className="header-icons">
                            <button className="add-btn" onClick={togglePopup}>
                                <Plus size={14} style={{ marginRight: "5px" }} />
                                Add New Role
                            </button>
                        </div> 
                    </div>

                    <div className="data-table" style={{ minHeight: isDropdownOpen ? "250px" : "auto" }}>
                        <Table striped bordered hover variant="light">
                            <thead>
                                <tr>
                                    <th onClick={() => handleSort('role')} style={{ cursor: 'pointer', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span>Roles</span>
                                            {getSortIcon('role')}
                                        </div>
                                    </th>
                                    <th onClick={() => handleSort('created_by')} style={{ cursor: 'pointer', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span>Created By</span>
                                            {getSortIcon('created_by')}
                                        </div>
                                    </th>
                                    <th onClick={() => handleSort('created_on')} style={{ cursor: 'pointer', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span>Created On</span>
                                            {getSortIcon('created_on')}
                                        </div>
                                    </th>
                                    <th style={{ textAlign: 'center' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData && filteredData.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.role}</td>
                                        <td>{item.created_by}</td>
                                        <td>{item.created_on}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <Dropdown onToggle={(isOpen) => setIsDropdownOpen(isOpen)}>
                                                <Dropdown.Toggle
                                                    className="menu-button"
                                                    style={{
                                                        background: "none",
                                                        border: "none",
                                                        cursor: "pointer"
                                                    }}
                                                >
                                                    <FiMoreVertical size={16} />
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu className="custom-dropdown-menu">
                                                    <Dropdown.Item onClick={() => toggleDetailsPopup(item.id)}>Details</Dropdown.Item>

                                                    <Dropdown.Item
                                                        onClick={() => confirmDelete(item.role)}
                                                    >Delete</Dropdown.Item>

                                                    <Dropdown.Item onClick={() => togglePopupC(item.role)}>Edit</Dropdown.Item>


                                                    <Dropdown.Item onClick={() => togglePopupD(item)}>Assign Permissions</Dropdown.Item>
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div> 
                      </div>*/}