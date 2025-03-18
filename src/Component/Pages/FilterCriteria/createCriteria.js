import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import DatePickera from './datepicker';
import { Search, Send, Tune, CalendarToday } from '@mui/icons-material';
import { Checkbox, FormControlLabel, InputAdornment, TextField } from '@mui/material';
import '../FilterCriteria/createCriteria.css';
import { customStyles } from '../Case/createCase';
import RecentCriteria from './recentCriteria';
import SavedCriteria from './savedCriteria';
import axios from 'axios';
import Cookies from 'js-cookie';
import {  toast } from 'react-toastify';

export const sharedSxStyles = {
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      border: 'none',
    },
    '&:hover fieldset': {
      border: 'none',
    },
    '&.Mui-focused fieldset': {
      border: 'none',
    },
  },
  '& .MuiInputBase-root': {
    boxShadow: 'none',
  }
};

const CreateCriteria = ({ togglePopup, setShowPopup, handleCreateCase }) => {
  const Token = Cookies.get('accessToken');
  const [formData, setFormData] = useState({
    searchQuery: '',
    datatype: [],
    filetype: [],
    caseIds: [],
    includeArchived: false,
    latitude: '',
    longitude: ''
  });
  const [showPopupR, setShowPopupR] = useState(false);
  const [showPopupS, setShowPopupS] = useState(false);
  const [showPopupD, setShowPopupD] = useState(false);
  const [selectedDates, setSelectedDates] = useState({
    startDate: null,
    endDate: null,
    startTime: { hours: 16, minutes: 30 },
    endTime: { hours: 16, minutes: 30 }
  });
  const [caseOptions, setCaseOptions] = useState([]);
  const [fileTypeOptions, setFileTypeOptions] = useState([]);
  const [savedCriteria, setSavedCriteria] = useState(null);

  // Fetch case IDs on component mount
  useEffect(() => {
    fetchCaseData();
    fetchFileTypes();
  }, []);

  // Fetch case data from API
  const fetchCaseData = async () => {
    try {
      const response = await axios.get('http://5.180.148.40:9001/api/case-man/v1/case', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Token}`
        },
      });
      
      // Format the response data for react-select
      const caseOptionsFormatted = response.data.data.map(caseItem => ({
        value: caseItem.id,
        label: `${caseItem.id} - ${caseItem.title || 'Untitled'}`
      }));
      
      setCaseOptions(caseOptionsFormatted);
    } catch (error) {
      console.error('Error fetching case data:', error);
    }
  };

  // Fetch file types from API
  const fetchFileTypes = async () => {
    try {
      const response = await axios.get('http://5.180.148.40:9002/api/osint-man/v1/platforms', {
        headers: {
          'Authorization': `Bearer ${Token}`
        },
      });
      console.log("response", response.data.data)
      // Format the response data for react-select
      const fileTypeOptionsFormatted = response.data.data.map(platform => ({
        value: platform,  // Use the platform value directly if it's a string
        label: platform   // Use the platform value directly if it's a string
      }));
      
      setFileTypeOptions(fileTypeOptionsFormatted);
    } catch (error) {
      console.error('Error fetching file types:', error);
    }
  };

  // Save criteria to API
  const saveCriteria = async () => {
    try {
      const criteriaPaylod = {
        keyword: formData.searchQuery,
        case_id: formData.caseIds && formData.caseIds.length > 0 ? formData.caseIds[0].value.toString(): "",
        file_type: formData.filetype && formData.filetype.length > 0 ? formData.filetype[0].value : "",
        latitude: formData.latitude || "",
        longitude: formData.longitude || "",
        start_time: selectedDates.startDate ? `${selectedDates.startDate.toISOString().split('T')[0]}T${String(selectedDates.startTime.hours).padStart(2, '0')}:${String(selectedDates.startTime.minutes).padStart(2, '0')}:00` : "",
        end_time: selectedDates.endDate ? `${selectedDates.endDate.toISOString().split('T')[0]}T${String(selectedDates.endTime.hours).padStart(2, '0')}:${String(selectedDates.endTime.minutes).padStart(2, '0')}:00` : ""
      };
       console.log("criteria Payloaad", criteriaPaylod)
      const response = await axios.post('http://5.180.148.40:9006/api/das/criteria', criteriaPaylod, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Token}`
        },
      });
      
              toast.success("Criteria saved successfully");
      console.log('Criteria saved successfully:', response.data);
      setSavedCriteria(response.data);
      // You might want to show a success message or handle the response in some way
    } catch (error) {
      console.error('Error saving criteria:', error);
    }
  };

  // Handle checkbox change for saving criteria
  const handleSaveCriteriaChange = (e) => {
    setFormData(prev => ({ ...prev, includeArchived: e.target.checked }));
    
    // If checkbox is checked, save the criteria
    // if (e.target.checked) {
    //   saveCriteria();
    // }
  };

  // Handle search submission
  const handleSearch = async (e) => {
    e.preventDefault();
   
    console.log(e);
    try {
      if (formData.includeArchived) {
        await saveCriteria(); // Ensure saveCriteria executes if checked
      }
      // Prepare the query array with one object per file type
      const queryArray = formData.filetype.map(type => ({
        unified_case_id: formData.caseIds && formData.caseIds.length > 0 ? formData.caseIds[0].value : "",
        unified_type: type.value,
        site_keywordsmatched: formData.searchQuery,
        start_time: selectedDates.startDate ? `${selectedDates.startDate.toISOString().split('T')[0]}T${String(selectedDates.startTime.hours).padStart(2, '0')}:${String(selectedDates.startTime.minutes).padStart(2, '0')}:00` : "",
        end_time: selectedDates.endDate ? `${selectedDates.endDate.toISOString().split('T')[0]}T${String(selectedDates.endTime.hours).padStart(2, '0')}:${String(selectedDates.endTime.minutes).padStart(2, '0')}:00` : ""
      }));
      console.log("search[ayload",queryArray)
      
      const response = await axios.post('http://5.180.148.40:9006/api/das/search', {
        query: queryArray
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Token}`
        },
      });
    
      
      console.log('Search results:', response.data);
      setFormData({
        searchQuery: '',
        datatype: [],
        filetype: [],
        caseIds: [],
        includeArchived: false,
        latitude: '',
        longitude: ''
      });

      // Handle the search results (e.g., pass them to a parent component)
      if (handleCreateCase) {
        handleCreateCase(response.data);
      }
     
    //   if (typeof togglePopup === 'function') {
    //     togglePopup(); // Close the first popup
    // }
    
    // Ensure second popup only opens if first one is closed
    setTimeout(() => {
        if (!showPopupR) {
            setShowPopupR(true);
        }
    }, 300);
    
    } catch (error) {
      console.error('Error performing search:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Toggle popup visibility
  const togglePopupA = () => {
    setShowPopupD(!showPopupD);
  };
  
  const togglePopupR = () => {
    setShowPopupR(!showPopupR);
  };
  
  const togglePopupS = () => {
    setShowPopupS(true);
  };

  // Handle data from DatePicker
  const handleDateSelection = (dateData) => {
    setSelectedDates(dateData);
    togglePopupA(); // Close popup after selection
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'No date selected';
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };



  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <button className="close-icon" onClick={togglePopup}>
          &times;
        </button>
        <div className="popup-content">
          <h5>Create Criteria</h5>
          <form onSubmit={handleSearch}>
            {/* Search Bar with Icons */}
            <label>Search</label>
            <TextField
              fullWidth
              className="com mb-3"
              name="searchQuery"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Send onClick={togglePopupR} style={{ cursor: 'pointer' }} />
                    <Tune onClick={togglePopupS} style={{ cursor: 'pointer' }} />
                  </InputAdornment>
                ),
                style: {
                  height: '38px',
                  padding: '0 8px',
                },
              }}
              placeholder="Search..."
              value={formData.searchQuery}
              onChange={handleInputChange}
              sx={sharedSxStyles}
            />

            {/* Datatype Dropdown (Multi Select) */}
            <div className="mb-3">
              <label>Datatype</label>
              <Select
                isMulti
                options={fileTypeOptions}
                styles={customStyles}
                className="com"
                value={formData.datatype}
                onChange={(selected) => setFormData(prev => ({ ...prev, datatype: selected }))}
                placeholder="Select Datatype"
              />
            </div>

            {/* Filetype Dropdown (Multi Select) */}
            <div className="mb-3">
              <label>Filetype</label>
              <Select
                isMulti
                options={fileTypeOptions}
                styles={customStyles}
                className="com"
                value={formData.filetype}
                onChange={(selected) => setFormData(prev => ({ ...prev, filetype: selected }))}
                placeholder="Select Filetypes"
              />
            </div>

            {/* Case Selection Field */}
            <div className="mb-3">
              <label>Case</label>
              <Select
                isMulti
                options={caseOptions}
                styles={customStyles}
                className="com"
                value={formData.caseIds}
                onChange={(selected) => setFormData(prev => ({ ...prev, caseIds: selected }))}
                placeholder="Select Cases"
              />
            </div>

            {/* DatePicker */}
            <div className="mb-3">
              <label>DatePicker</label>
              <TextField
                fullWidth
                className="com mb-3"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <CalendarToday style={{ cursor: 'pointer' }} onClick={togglePopupA} />
                    </InputAdornment>
                  ),
                  style: {
                    height: '38px',
                    padding: '0 8px',
                  },
                }}
                placeholder="Select Date..."
                value={
                  selectedDates.startDate && selectedDates.endDate
                    ? `${formatDate(selectedDates.startDate)} to ${formatDate(selectedDates.endDate)}`
                    : formatDate(selectedDates.startDate || selectedDates.endDate)
                }
                readOnly
                sx={sharedSxStyles}
              />
            </div>

            {/* Location Fields */}
            <label>Focus your search to a particular location or area</label>
            <div className="mb-3 d-flex">
              <TextField
                name="latitude"
                placeholder="Latitude"
                className="com mb-3 me-2"
                value={formData.latitude}
                onChange={handleInputChange}
                InputProps={{
                  style: {
                    height: '38px',
                    padding: '0 8px',
                  },
                }}
                sx={sharedSxStyles}
              />
              <TextField
                name="longitude"
                placeholder="Longitude"
                className="com mb-3"
                value={formData.longitude}
                onChange={handleInputChange}
                InputProps={{
                  style: {
                    height: '38px',
                    padding: '0 8px',
                  },
                }}
                sx={sharedSxStyles}
              />
            </div>
            <h5 className="mb-3">SELECT ON MAP</h5>

            {/* Save Criteria Checkbox */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.includeArchived}
                  onChange={handleSaveCriteriaChange}
                  
                 
                />
              }
              label="Save this search"
              className="mb-3"
            />

            {/* Submit Button */}
            <div className="button-container" style={{ textAlign: 'center' }}>
              <button
                type="submit"
                style={{ width: '100%', height: '30px' }}
                className="add-btn"
               
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Popup components */}
      {showPopupD && (
        <DatePickera
          onSubmit={handleDateSelection}
          initialDates={selectedDates}
          onClose={togglePopupA}
        />
      )}
      
      {showPopupR && (
        <RecentCriteria
          onClose={togglePopupR}
        />
      )}
      
      {showPopupS && (
        <SavedCriteria
          onClose={togglePopupS}
          setShowPopup={setShowPopup}
        />
      )}
    </div>
  );
};

export default CreateCriteria;