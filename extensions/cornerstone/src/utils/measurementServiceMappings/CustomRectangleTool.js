import React, { useRef, useState, useEffect } from 'react';
import * as cornerstone from '@cornerstonejs/core';
import * as cornerstoneTools from '@cornerstonejs/tools';

const CustomRectangleTool = () => {
  const elementRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [startCoords, setStartCoords] = useState(null);
  const [currentCoords, setCurrentCoords] = useState(null);

  useEffect(() => {
    if (elementRef.current) {
      const element = elementRef.current;
      cornerstone.enable(element);

      const handleMouseMove = (event) => {
        if (startCoords) {
          setCurrentCoords([event.offsetX, event.offsetY]);
          element.dispatchEvent(new CustomEvent('rectangleUpdated'));
        }
      };

      const handleMouseUp = (event) => {
        if (startCoords) {
          const endCoords = [event.offsetX, event.offsetY];
          const rectangleData = calculateRectangle(startCoords, endCoords);
          setStartCoords(null);
          setCurrentCoords(null);
        }
      };

      element.addEventListener('mousedown', (event) => setStartCoords([event.offsetX, event.offsetY]));
      element.addEventListener('mousemove', handleMouseMove);
      element.addEventListener('mouseup', handleMouseUp);

      return () => {
        element.removeEventListener('mousedown', (event) => setStartCoords([event.offsetX, event.offsetY]));
        element.removeEventListener('mousemove', handleMouseMove);
        element.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [elementRef]);

  const activate = () => {
    if (elementRef.current) {
      setIsActive(true);
      elementRef.current.style.cursor = 'crosshair';
    }
  };

  const deactivate = () => {
    if (elementRef.current) {
      setIsActive(false);
      elementRef.current.style.cursor = 'default';
    }
  };

  const calculateRectangle = (startCoords, endCoords) => {
    const width = Math.abs(endCoords[0] - startCoords[0]);
    const height = Math.abs(endCoords[1] - startCoords[1]);
    const length = Math.max(width, height);
    const breadth = Math.min(width, height);
    return {
      startX: startCoords[0],
      startY: startCoords[1],
      endX: endCoords[0],
      endY: endCoords[1],
      width,
      height,
      length,
      breadth
    };
  };

  return (
    <div ref={elementRef} style={{ width: '500px', height: '400px' }} />
  );
};

export default CustomRectangleTool;
