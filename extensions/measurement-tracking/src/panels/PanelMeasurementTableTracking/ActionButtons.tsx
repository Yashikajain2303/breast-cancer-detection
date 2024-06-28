import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, ButtonEnums } from '@ohif/ui';
import dcmjs from 'dcmjs';

function ActionButtons({ onExportClick, onCreateReportClick, disabled, data }) {
  const { t } = useTranslation('MeasurementTable');
  const [formData, setFormData] = useState({
    indications: '',
    findings: '',
    histopathology: '',
    annotations: data.map(() => ({
      biradScore: null,
      lesionType: null,
    })),
  });
  const [errors, setErrors] = useState({
    findings: false,
    indications: false,
  });

  const handleChange = (e) => {
    const { name, value, dataset } = e.target;
    if (dataset.index !== undefined) {
      setFormData((prevState) => {
        const updatedAnnotations = [...prevState.annotations];
        updatedAnnotations[dataset.index] = {
          ...updatedAnnotations[dataset.index],
          [name]: value,
        };
        return {
          ...prevState,
          annotations: updatedAnnotations,
        };
      });
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { indications, findings, histopathology, annotations } = formData;

    // Basic validation
    let hasError = false;
    const newErrors = {
      findings: false,
      indications: false,
    };

    if (!indications) {
      newErrors.indications = true;
      hasError = true;
    }

    if (!findings) {
      newErrors.findings = true;
      hasError = true;
    }

    setErrors(newErrors);

    if (hasError) {
      return;
    }

    // Log or handle the submission data
    const submissionData = data.map((item, index) => ({
      topLeft: item.baseDisplayText,
      bottomRight: item.baseLabel,
      biradScore: annotations[index]?.biradScore,
      lesionType: annotations[index]?.lesionType,
    }));

    console.log('Indications:', indications);
    console.log('Findings:', findings);
    console.log('Histopathology:', histopathology);
    console.log('Annotations:', submissionData);
  };

  const isSubmitDisabled = formData.findings.trim() === '' || formData.indications.trim() === '';
  const manualBoundingBoxCoordinates = localStorage.getItem('manualBoundingBoxCoordinates');
  return (
    <div className="m-2">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col mb-6 space-y-4">
          <div className="text-white">
            {data.map((item, index) => (
              <div key={index} className="ohif-scrollbar max-h-112 overflow-auto p-4 bg-gray-800 rounded-lg shadow-md border border-gray-700 mb-4">
                <p className="text-green-400 font-semibold text-sm">Annotation No. {index + 1}</p>
                <p className="mb-2 text-sm">
                  <span className="text-blue-300">Top Left:</span> [{item.baseDisplayText[0]}, {item.baseDisplayText[1]}]
                  <br />
                  <span className="text-blue-300">Bottom Right:</span> [{item.baseLabel[0]}, {item.baseLabel[1]}]
                </p>

                <div className="form-group">
                  <div className=" items-center mb-2">
                    <div className="flex flex-col mr-4">
                      <p className="text-yellow-300 font-medium text-sm">Birad Score:</p>
                      {[1, 2, 3, 4, 5, 6].map((score) => (
                        <label key={score} className="flex items-center">
                          <input
                            type="radio"
                            name={`biradScore${index}`}
                            value={score}
                            className="mr-1"
                            data-index={index}
                            onChange={handleChange}
                          />
                          <span className="text-white text-sm">{score}</span>
                        </label>
                      ))}
                    </div>

                    <div className="flex flex-col">
                      <p className="text-yellow-300 font-medium text-sm">Lesion Type:</p>
                      {['Mass', 'Calcification'].map((type) => (
                        <label key={type} className="mr-4 flex items-center">
                          <input
                            type="radio"
                            name={`lesionType${index}`}
                            value={type}
                            className="mr-1"
                            data-index={index}
                            onChange={handleChange}
                          />
                          <span className="text-white text-sm">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mb-4">
            <label className="block text-white mb-1">Add Indications*:</label>
            <input
              className={`w-full p-2 text-black rounded-md border border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.indications && 'border-red-500'}`}
              type="text"
              name="indications"
              value={formData.indications}
              onChange={handleChange}
              aria-label="Indications"
            />
            {errors.indications && (
              <p className="error-message text-red-500 text-sm mt-1">{t('Please enter your indications.')}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-white mb-1">Add Findings*:</label>
            <input
              className={`w-full p-2 text-black rounded-md border border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.findings && 'border-red-500'}`}
              type="text"
              name="findings"
              value={formData.findings}
              onChange={handleChange}
              aria-label="Findings"
            />
            {errors.findings && (
              <p className="error-message text-red-500 text-sm mt-1">{t('Please enter your findings.')}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-white mb-1">Histopathology(Biopsy Results):</label>
            <input
              className="p-2 text-black"
              type="text"
              value={formData.histopathology}
              onChange={(e) => handleChange('histopathology', e.target.value)}
              aria-label="Histopathology (Biopsy Results)"
            />
          </div>
          <Button
            className="m-2 ml-0"
            type={ButtonEnums.type.secondary}
            size={ButtonEnums.size.small}
            disabled={isSubmitDisabled}
            onClick={handleSubmit}
          >
            {t('Submit')}
          </Button>
        </div>
      </form>
    </div>
  );
}

ActionButtons.propTypes = {
  onExportClick: PropTypes.func,
  onCreateReportClick: PropTypes.func,
  disabled: PropTypes.bool,
};

ActionButtons.defaultProps = {
  onExportClick: () => alert('Export'),
  onCreateReportClick: () => alert('Create Report'),
  disabled: false,
};

export default ActionButtons;
