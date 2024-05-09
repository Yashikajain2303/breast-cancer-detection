import React, { createContext, useContext, useState } from 'react';

const MeasurementContext = createContext();

export const MeasurementProvider = ({ children }) => {
  const [measurements, setMeasurements] = useState([]);

  const addMeasurement = (newMeasurement) => {
    setMeasurements([...measurements, newMeasurement]);
  };

  return (
    <MeasurementContext.Provider value={{ measurements, addMeasurement }}>
      {children}
    </MeasurementContext.Provider>
  );
};

export const useMeasurement = () => useContext(MeasurementContext);
