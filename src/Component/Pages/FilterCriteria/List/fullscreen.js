import React, { useState, useEffect } from 'react';
import '../savedCriteria.css';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import InputAdornment from '@mui/material/InputAdornment';
import { TextField, Typography } from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import { sharedSxStyles } from "../createCriteria";
import SendIcon from '@mui/icons-material/Send';
import DataTable from '../../Case/caseList';
import CriteriaCaseTable from './criteriaCaseList';
import CriteriaTransactionTable from './criteriaTransactionlist';
import SavedCriteria from '../savedCriteria';
import AddNewCriteria from '../addNewCriteria';
import {  useNavigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie'
import { toast } from 'react-toastify';
import { closePopup, setPage, setSearchResults } from '../../../../Redux/Action/criteriaAction';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';

const SearchResults = ({onClose}) => {
 
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [inputValue, setInputValue] = useState('');
  const [searchChips, setSearchChips] = useState([]);
  const [activeTab, setActiveTab] = useState('Cases');
  const [isPopupVisible, setIsPopupVisible] = useState(false);
   const { searchResults, totalPages, currentPage, totalResults } = useSelector((state) => state.search);   
// console.log("searchRresults", searchResults)


const [formData, setFormData] = useState({
  searchChips: '',
  // Add other form fields as needed
});
  //  useEffect(() => {
  //        fetchData();
  //      }, []);


  
  const openPopup = () => {
    setIsPopupVisible(true); // Pop-up ko open karne ke liye state ko true kare
  };
  const exitClick =()=>{
navigate('/cases')
  }

   const Token = Cookies.get('accessToken');
    // const fetchData = async () => {
    //   try {
    //     const response = await fetch("http://5.180.148.40:9006/api/das/criteria", {
    //       headers: {
    //         'Content-Type': 'application/json',
    //         'Authorization': `Bearer ${Token}`
    //       },
    //     });
    //     const data = await response.json();
    //     console.log("resposegetCriteria",data)
    //     setSearchChips(data.data)
    //     // if (data && data.data) {
    //     //   setSearchChips(data.data.map(item => ({ keyword: item.keyword }))); // Extract keywords
         
    //     // }
    //     console.log("chips",searchChips)
    //   } catch (error) {
    //     console.error("Error fetching data:", error);
    //   }
    
    // };
  
 
  // const handleKeyPress = (e) => {
  //   if (e.key === 'Enter' && inputValue.trim() !== '') {
  //     // Add chip and clear input
  //     if (!searchChips.includes(inputValue.trim())) {
  //       setSearchChips([...searchChips, inputValue.trim()]);
  //     }
  //     setInputValue('');
  //   }
  // };
  // Filter data dynamically as input changes
  const filteredChips = searchChips.filter((chip) =>
    typeof chip.keyword === "string" &&
    chip.keyword.toLowerCase().includes(inputValue.toLowerCase()) // Search based on stored data
  );


  // Add new chip when "Enter" is pressed
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && inputValue.trim() !== "") {
      const newChip = { keyword: inputValue.trim() }; // Add new chip structure

      // Check if chip already exists
      if (!searchChips.find((chip) => chip.keyword === newChip.keyword)) {
        setSearchChips((prev) => [...prev, newChip]); // Add new chip
      }

      setInputValue(""); // Clear input field
    }
  };
  
  // const removeChip = (chip) => {
  //   setSearchChips(searchChips.filter(item => item !== chip));
  // };
  const removeChip = (chipToRemove) => {
    const updatedChips = searchChips.filter((chip) => chip !== chipToRemove);
    setSearchChips(updatedChips); // Update state
    // onUpdatedChips(updatedChips); // Pass updated chips as props
  };
  const resetSearch = () => {
    setSearchChips([]);
    setInputValue('');
  };

  const handleSearch = async () => {
    // if (keywords || keywords.length === 0) {
    //   console.error("No keywords selected!", searchChips);
    //   return;
    // }  
    try {
      const queryObj = {
        keyword:searchChips, // Pass the array of keywords directly
      };
  
      console.log("Sending search query:", queryObj);
 
      const response = await axios.post('http://5.180.148.40:9006/api/das/search', {
        queryObj
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Token}`
        }
      });
  
      console.log("Search results:", response.data);
  
      // Dispatch the search results to the store
      dispatch(setSearchResults({
        results: response.data.results,
        total_pages: response.data.total_pages || 1
      }));
   dispatch(setPage(1));
      // Store the results locally
      localStorage.setItem('searchResults', JSON.stringify({
        results: response.data.results,
        expiry: new Date().getTime() + 24 * 60 * 60 * 1000 // Store for 24 hours
      }));
  resetSearch()
      // Clear selected chips
      setFormData(prev => ({
        ...prev,
        searchChips: [] 
      })
    
    );
//  dispatch(openPopup("saved"));
    } catch (error) {
      console.error("Error performing search:", error);
    }
  };
   
  
  return (

    <div className="search-container" style={{backgroundColor:'darkgray',height:'100%', zIndex:'1050'}}>
   <div style={{display: 'flex', justifyContent: 'space-between', aligntems: 'center', marginTop:'5px'}}>
{/* 
  <h6 >Search Results</h6 > */}
  
  
 

      <div className="search-header" style={{width:'50%'}}>
        {/* <div className="search-input-container"> */}
          {/* <span className="search-icon">
           <SearchIcon/>
          </span>
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            className="search-input"
            placeholder="Search..."
          />
       
        <button className="icon-button">
         <FilterListIcon/>
        </button> */}
        <TextField
                                    fullWidth
                                    className="com mb-3"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
               
                      <SendIcon style={{cursor:'pointer'}} onClick={handleSearch}/>
                  <TuneIcon onClick={openPopup} style={{cursor:'pointer'}} /> {/* New Card List Filter Icon */}
               
                                            </InputAdornment>
                                        ), style: {
                                            height: '38px', // Use consistent height
                                            padding: '0 8px', // Ensure uniform padding
            
                                          },
                                    }}
                                    type="text" 
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Search..."
                                    sx={sharedSxStyles}
                                />
                                {/* <button onClick={handleExit}>Exit Full Screen</button> */}
       {/* </div> */}
      </div>
      <button className="action-button" style={{padding:'0px 5px', height:'30px', marginTop:"5px"}} onClick={exitClick}>Exit FullScreen</button>
      </div>
      <div className="search-term-indicator">
        <div className="chips-container">
          {filteredChips && filteredChips.map((chip, index) => (
            <div key={index} className="search-chip">
              <span>{chip.keyword}</span>
              <button className="chip-delete-btn" onClick={() => removeChip(chip)}>
                <CloseIcon fontSize='15px'/>
              </button>
            </div>
          ))}
        </div>
        <div className="action-buttons">
          <button className="action-button" onClick={resetSearch}>RESET</button>
      
        </div>
      </div>
      
      <div className="tabs">
        <div 
         className={`tab active`} // "Cases" will always be active
          onClick={() => setActiveTab('Cases')}
        >
          Cases ({totalResults || "no results"})
        </div>
      </div>
      
      <div className="search-results"style={{height:'auto'}}>
        
        <CriteriaCaseTable/>
       
    
      
      </div>
      
      {/* <div className="view-all">
        
      </div> */}
 {isPopupVisible && <AddNewCriteria searchChips={searchChips} isPopupVisible={isPopupVisible} setIsPopupVisible={setIsPopupVisible} />}

    </div>
   
    
   
  );
};

export default SearchResults; 