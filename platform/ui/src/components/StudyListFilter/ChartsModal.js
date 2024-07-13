// src/components/ChartsModal.js
import React from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

const ChartsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const rocData = {
    labels: [0, 0.2, 0.4, 0.6, 0.8, 1],
    datasets: [
      {
        label: 'ROC Curve',
        data: [0, 0.1, 0.4, 0.7, 0.85, 1],
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        fill: false,
      },
    ],
  };

  const iouData = {
    labels: [0, 0.2, 0.4, 0.6, 0.8, 1],
    datasets: [
      {
        label: 'IoU Curve',
        data: [0, 0.3, 0.5, 0.6, 0.75, 0.85],
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 2,
        fill: false,
      },
    ],
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">ROC and IoU Curves</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">&times;</button>
        </div>
        <div className="mb-6">
          <Line data={rocData} />
        </div>
        <div>
          <Line data={iouData} />
        </div>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Close
        </button>
      </div>
    </div>
  )
};

export default ChartsModal;
