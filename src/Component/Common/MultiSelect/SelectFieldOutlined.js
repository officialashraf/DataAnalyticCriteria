import React from 'react';
import Select from 'react-select';
 // If you're using custom Option

const customStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: '#101d2b',
      color: 'white',
      boxShadow: 'none',
      border: '1px solid #0073cf',
      borderRadius: '15px',
      minHeight: '36px',
      '&:hover': {
        border: '1px solid #0073cf',
      },
    }),
  
    menu: (base) => ({
      ...base,
      backgroundColor: '#101d2b', // ⬅️ background of dropdown
        color: 'white',
      borderRadius: '15px',
      zIndex: 9999,
    }),
  
    menuList: (provided) => ({
      ...provided,
      maxHeight: '150px',
      overflowY: 'auto',
      padding: '4px 0',
      backgroundColor: '#101d2b', // ⬅️ match with menu
        borderRadius: '15px',
    }),
  
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused
          ? '#0073cf' // ⬅️ highlight color
            : '#101d2b',   // ⬅️ default bg color
      color: state.isFocused ? 'white' : 'black',
      padding: '10px 12px',
      cursor: 'pointer',
    }),
  };
  

const SelectFieldOutlined = ({
    label = 'Select',
    options = [],
    placeholder = 'Select...',
    value,
    onChange,
    isMulti = false,
    isLoading = false,
    components = {},
    hideSelectedOptions = false,
    closeMenuOnSelect = true,
    onMenuOpen,
    smallNote = '',
}) => {
    return (
        <div style={{ marginBottom: '15px' }}>
            <div style={{ position: 'relative' }}>
                <label style={{
                    position: 'absolute',
                    top: '-10px',
                    left: '12px',
                    backgroundColor: '#0073cf',
                    padding: '0 4px',
                    fontSize: '12px',
                    color: 'white',
                    borderRadius: '15px',
                    zIndex: 1,
                }}>{label}</label>
                <Select
                    options={options}
                    styles={customStyles}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    isMulti={isMulti}
                    isLoading={isLoading}
                    components={components}
                    hideSelectedOptions={hideSelectedOptions}
                    closeMenuOnSelect={closeMenuOnSelect}
                    onMenuOpen={onMenuOpen}
                />
            </div>
            {smallNote && <small style={{ color: 'white'}}>{smallNote}</small>}
        </div>
    );
};

export default SelectFieldOutlined;
