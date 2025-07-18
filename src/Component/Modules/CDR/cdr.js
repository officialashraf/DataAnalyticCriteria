import React, { useState } from 'react';
import styles from "./Cdr.module.css"
import AppButton from '../../Common/Buttton/button';


const Cdr = ({ togglePopup,handleProceed }) => {
  const [selectedOption, setSelectedOption] = useState('localStorage');
  const [selectDataType, setSelectDataType] = useState('CDR');
  // const [showPopup, setShowPopup] = useState(false);
  // const [showFileUpload, setShowFileUpload] = useState(false);
  // const [showFtpPopup, setShowFtpPopup] = useState(false);

  const options = [
    { value: 'localStorage', label: 'Upload from Local Storage', description: 'Add a file from local drive' },
    { value: 'ftpServer', label: 'Upload from FTP Server', description: 'Add Documents, Images, Videos, Recordings and more from local drive.' },
    { value: 'osintData', label: 'Import via OSINT data', description: 'Include attributes for harvesting OSINT data' },
  ];

  // const batchNames = ['New Batch 1', 'New Batch 2', 'New Batch 3'];
  const dataTypes = ['CDR', 'IPDR', 'Other'];
  // const handleProceed = () => {
   
  //   if (selectedOption === 'osintData') {
  //  togglePopupCdr(false);
  //     setShowPopup(true); // 🔹 show AddFilter2+

  //   } else if (selectedOption === 'ftpServer') {
  //     setShowFtpPopup(true);
  //   }
  //   else if (selectedOption === 'localStorage') {
  //     setShowFileUpload(true); // 🔹 open upload popup
  //   }

  // };
   const onProceedClick = () => {
    handleProceed(selectedOption);  // tabhi chalega jab prop se mila hoga
  };
  return (
    <>

      <div className={styles.popupOverlay}>
        <div className={styles.popupContainerCdr}>
          <div className={styles.popupHeaderCdr}>
            <h6>Add Resources</h6>
            <button className={styles.closeIconCdr} onClick={togglePopup}>&times;</button>
          </div>
          <div className={styles.popupBodyCdr}>
            <p>Choose an option to continue</p>
            <div className={styles.optionsListCdr}>
              {options.map((option) => (
                <label key={option.value} className={`${styles.optionItemCdr} ${selectedOption === option.value ? styles.selected : ''}`}>
                  <input
                    type="radio"
                    name="resourceOption"
                    value={option.value}
                    checked={selectedOption === option.value}
                    onChange={() => setSelectedOption(option.value)}
                  />
                  <div className={styles.optionContentCdr}>
                    <span className={styles.optionLabelCdr}>{option.label}</span>
                    <span className={styles.optionDescriptionCdr}>{option.description}</span>
                  </div>
                </label>
              ))}
            </div>

             {/* Data Type Field — only show when option is NOT 'osintData' */}
  {selectedOption !== 'osintData' && (
    <div className={styles.targetDataTypeCdr}>
      <div className={styles.selectDataTypeCdr}>
        <div className={styles.customOutlinedWrapper}>
          <label className={styles.customBadgeLabel}>Select Data Type*</label>
          <select
            className={styles.customSelectField}
            value={selectDataType}
            onChange={(e) => setSelectDataType(e.target.value)}
          >
            {dataTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <small>Selected Data Type would be applied to all resources in this batch</small>
        </div>
      </div>
    </div>
  )}
          </div>

          <div className={styles.popupFooterCdr}>
            <AppButton children={"x Cancel"} onClick={togglePopup}/>
             <AppButton children={"✓ Proceed"} onClick={onProceedClick}/>
          </div>
        </div>
      </div>
     
    </>
  );
};

export default Cdr;