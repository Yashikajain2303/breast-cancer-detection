import { getData, saveData } from '../../../../../indexedDB';
import React, { useState } from 'react';
import axios from 'axios'

const DialogBox = ({ title, children, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleChange = (event) => {
    const newValue = event.target.value;
    setInputValue(newValue);
  };

  const handleClose = async () => {
    onClose();
    const displaySets = await getData('displaySets');
    const studies = await getData('studies');
    const response: any = await axios.post('http://localhost:8000/convert', {
      displaySets: displaySets,
      studies: studies,
      clinicalHistory: inputValue
    });
    const clinicalResponse: any = await axios.post('http://localhost:8000/clinicalRun', {
      displaySets: displaySets,
      studies: studies,
      clinicalHistory: inputValue
    });
    if (response) {
      await saveData("clinicalResponse", clinicalResponse.data);
      await saveData("response", response.data);
    } else {
      console.error('No data received from the server');
    }
    // window.localStorage.setItem('clinicalHistory', inputValue);
  }

  return (
    <div className={`mt-[50%] fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 transition duration-300 ease-in-out `}>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden w-full max-w-md p-4">
        <div className="flex justify-between items-center pb-3 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>
          <button type="button" onClick={handleClose} className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            x
          </button>
        </div>
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-indigo-500 focus:border-indigo-600"
        />
        <div className="mt-4 flex justify-end space-x-2" onClick={handleClose}>
          <button className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800'>Submit</button>
        </div>
      </div>
    </div>
  );
};

export default DialogBox;
