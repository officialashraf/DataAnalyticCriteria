import { useState, useEffect } from "react";
// import {
//   Table,
//   InputGroup,
//   FormControl,
//   Dropdown,
//   Badge,
//   Button,
// } from "react-bootstrap";
// import { Search, Plus, FileEarmarkPlus } from "react-bootstrap-icons";
// import { ArrowDropDown, ArrowDropUp } from "@mui/icons-material";
import axios from "axios";
// import "./tableGlobal.css";
import CreateCase from "./createCase";
import Cookies from "js-cookie";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import CaseDetails from "./caseDetails";
import EditCase from "./editCase";
import { useDispatch } from "react-redux";
import { setCaseData } from "../../../Redux/Action/caseAction";
import Loader from "../Layout/loader";
import { SET_PAGINATION } from "../../../Redux/Constants/filterConstant";
import TableModal from "../../Common/Table/table";
import AppButton from "../../Common/Buttton/button";
import { useTranslation } from 'react-i18next';

const DataTable = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [data, setData] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [showPopupA, setShowPopupA] = useState(false);
  const [showPopupB, setShowPopupB] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fix for t is not a function error in toast confirmDelete
  const toastConfirmDelete = (id, title) => {
    toast(
      (toastInstance) => (
        <div>
          <p>{t("confirm_delete_case", { title })}</p>
          <button
            className="custom-confirm-button"
            onClick={() => {
              deleteCase(id, title);
              toast.dismiss(toastInstance.id);
            }}
            style={{ padding: "4px 1px", fontSize: "12px", width: "20%" }}
          >
            {t("yes")}
          </button>
          <button
            className="custom-confirm-button"
            onClick={() => toast.dismiss(toastInstance.id)}
            style={{ padding: "4px 1px", fontSize: "12px", width: "20%" }}
          >
            {t("no")}
          </button>
        </div>
      ),
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        style: {
          position: "fixed",
          top: "300px",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "100%",
          zIndex: 9999,
          background: '#101D2B',
          color: '#d2d2d2'
        },
      }
    );
  };
  // const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // const onFieldClick = (item) => {
  //   dispatch(setCaseData(item));
  //   const caseId = item.id; // Set the case data in Redux store
  //   navigate(`/cases/${caseId}`); // Navigate to the new page
  // };

  useEffect(() => {
    if (location.pathname === "/cases") {
      dispatch({
        type: SET_PAGINATION,
        payload: { page: 1 }, // Explicitly set page to 1
      });
    }
  }, [location.pathname, dispatch]);

  const fetchCaseData = async () => {
    try {
      setLoading(true);
      const Token = Cookies.get("accessToken");
      const response = await axios.get(
        `${window.runtimeConfig.REACT_APP_API_CASE_MAN}/api/case-man/v1/case`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Token}`,
          },
        }
      );
      console.log("API Response:", response.data);

      setData(response.data.data);
      setFilteredData(response.data.data);
      console.log("data", response.data);
    } catch (error) {
      toast.error(error.response?.data?.detail || t("error.fetching_data"));
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaseData();
    const handleDatabaseUpdate = () => {
      fetchCaseData();
    };

    window.addEventListener("databaseUpdated", handleDatabaseUpdate);

    return () => {
      window.removeEventListener("databaseUpdated", handleDatabaseUpdate);
    };
  }, []);

  const confirmDelete = (id, title) => {
    toastConfirmDelete(id, title);
  };

  const deleteCase = async (id, title) => {
    //const caseId = parseInt(id.replace("CASE", ""), 10);
    const token = Cookies.get("accessToken");
    if (!token) {
      console.error("No token found in cookies.");
      return;
    }
    try {
      const authToken = Cookies.get("accessToken"); // Read the token from cookies
      const response = await axios.delete(
        `${window.runtimeConfig.REACT_APP_API_CASE_MAN}/api/case-man/v1/case/${id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      window.dispatchEvent(new Event("databaseUpdated"));
      toast.success(t("case_deleted_success", { title }));
      console.log("Case Deleted:", response.data);
    } catch (error) {
      toast.error(error.response?.data?.detail || t("error.deleting_case"));
      console.error("Error deleting case:", error);
    }
  };

  const getUserData = async () => {
    const token = Cookies.get("accessToken");
    try {
      const response = await axios.get(
        `${window.runtimeConfig.REACT_APP_API_USER_MAN}/api/user-man/v1/user`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const user = response.data;
      setUsers(user); // Update the state with usered data
      console.log("users", user);
    } catch (error) {
      console.error("There was an error usering the data!", error);
    }
  };
  useEffect(() => {
    getUserData(); // Call the getUserData function
  }, []);

  // const handleSearch = (event) => {
  //   const searchValue = event.target.value;
  //   setSearchTerm(searchValue);

  //   const filtered = data.filter((item) => {
  //     return Object.values(item).some((value) => {
  //       return String(value ?? "") // convert null/undefined to empty string
  //         .toLowerCase()
  //         .includes(searchValue.toLowerCase());
  //     });
  //   });
  //   setFilteredData(filtered);
  // };
  const togglePopup = () => {
    setShowPopup((prev) => !prev);
  };
  const togglePopupB = (item) => {
    setShowPopupB((prev) => !prev);
    setSelectedData(item);
  };
  const togglePopupA = (item) => {
    setShowPopupA((prev) => !prev);
    setSelectedData(item.id);
  };

  // const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // const handleSort = (key) => {
  //   let direction = "asc";
  //   if (sortConfig.key === key && sortConfig.direction === "asc") {
  //     direction = "desc";
  //   }
  //   setSortConfig({ key, direction });

  //   const sortedData = [...filteredData].sort((a, b) => {
  //     if (typeof a[key] === "number" && typeof b[key] === "number") {
  //       return direction === "asc" ? a[key] - b[key] : b[key] - a[key];
  //     } else {
  //       const aValue = a[key] ?? null;
  //       const bValue = b[key] ?? null;
  //       if (aValue === null && bValue === null) return 0;
  //       if (aValue === null) return 1;
  //       if (bValue === null) return -1;
  //       if (aValue < bValue) {
  //         return direction === "asc" ? -1 : 1;
  //       }
  //       if (aValue > bValue) {
  //         return direction === "asc" ? 1 : -1;
  //       }
  //       return 0;
  //     }
  //   });
  //   setFilteredData(sortedData);
  // };
  if (loading) {
    return <Loader />;
  }
  const caseColumns = [
    { key: "id", label: t("case_id"), render: (val) => `CASE${String(val).padStart(4, "0")}` },
    { key: "title", label: t("title") },
    { key: "description", label: t("description") },
    { key: "created_on", label: t("created_on") },
    { key: "created_by", label: t("created_by") },
    { key: "assignee", label: t("assignee") },
    { key: "watchers", label: t("watchers") },
    { key: "modified_on", label: t("edited_on") },
    { key: "modified_by", label: t("edited_by") },
    {
      key: "status", label: t("status"),
      render: (val) => (
        <span
          style={{
            backgroundColor: "#FFC107",
            color: "#000",
            padding: "2px 6px",
            borderRadius: "12px",
            fontSize: "11px",
            whiteSpace: "nowrap",
          }}
        >
          {val}
        </span>
      )
    }
  ];

  return (
    <>
      {data && data.length > 0 ? (
        <div>
          <TableModal
            title={t("case_details")}
            data={data}
            columns={caseColumns}
            onRowClick={(row) => {
              dispatch(setCaseData(row));
              console.log('Row clicked:', row);
              const caseId = row.id
              navigate(`/cases/${caseId}`);
            }}
            enableRowClick={true}
            onRowAction={{
              edit: (row) => togglePopupB(row),
              delete: (row) => confirmDelete(row.id, row.title),
              details: (row) => togglePopupA(row),
            }}
            idPrefix="CASE"
            btnTitle={`+ ${t("add_new_case")}`}
            onAddClick={() => togglePopup()}
          />
        </div>
      ) : (
        <div className="resourcesContainer" style={{ border: "none" }}>
          <h3 className="title">{t("lets_get_started")}</h3>
          <p className="content">{t("add_cases_to_get_started")}</p>
          <AppButton onClick={togglePopup} children={`+ ${t("add_new_case")}`} />
        </div>
      )}
      {showPopup && <CreateCase togglePopup={togglePopup} />}
      {showPopupB && <EditCase item={selectedData} togglePopup={togglePopupB} />}
      {showPopupA && (
        <CaseDetails caseId={selectedData} users={users} togglePopupA={togglePopupA} />
      )}
    </>
  );
};

export default DataTable;
