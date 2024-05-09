import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, ButtonEnums } from '@ohif/ui';
import dcmjs from 'dcmjs';

function ActionButtons({ onExportClick, onCreateReportClick, disabled, data }) {
  const { t } = useTranslation('MeasurementTable');
  const [biradsScore, setBiradsScore] = useState({ left: 0, right: 0 });
  const [formData, setFormData] = useState({
    indications: '',
    findings: '',
    histopathology: '',
  });
  const [errors, setErrors] = useState({
    findings: false,
    indications: false,
  });
  const [formLayout, setFormLayout] = useState(false);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: value.trim() === '' });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const hasErrors = Object.values(errors).some((error) => error);

    if (!hasErrors) {
      const StudyInstanceUID = data[0]?.uid;
      if (StudyInstanceUID) {
        const studyDirPath = `/json_reports/${StudyInstanceUID}/`;
        const jsonFileName = `form_data_${Date.now()}.json`;
        const jsonFilePath = `${studyDirPath}/${jsonFileName}`;

        // Create JSON object with form data
        const formDataJson = JSON.stringify({
          formData,
          coordinates: data.map(item => ({
            topLeft: item.baseDisplayText,
            bottomRight: item.baseLabel
          }))
        });

        // Create a new Blob with the JSON data
        const jsonBlob = new Blob([formDataJson], { type: 'application/json' });

        // Save the JSON file
        saveFile(jsonBlob, jsonFilePath);
      }
    }
    setFormLayout(false);
  };

  // Function to save file
  const saveFile = (blob, filePath) => {
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', filePath);

    // Simulate a click on the anchor element to trigger the download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
  };

  const options = Array.from({ length: 7 }, (_, i) => i);

  const isSubmitDisabled = formData.findings.trim() === '' || formData.indications.trim() === '';

  return (
    <div className="">
      <div className="flex overflow-y-auto">
        <Button
          onClick={onExportClick}
          disabled={disabled}
          type={ButtonEnums.type.secondary}
          size={ButtonEnums.size.small}
        >
          {t('Export')}
        </Button>
        <Button
          className="ml-2"
          onClick={onCreateReportClick}
          type={ButtonEnums.type.secondary}
          size={ButtonEnums.size.small}
          disabled={disabled}
        >
          {t('Create Annotation')}
        </Button>
      </div>
      <Button
        className="m-2 ml-0"
        onClick={() => setFormLayout(true)}
        type={ButtonEnums.type.secondary}
        size={ButtonEnums.size.small}
        disabled={formLayout}
      >
        {t('Birads Score, Findings & Indications')}
      </Button>
      {formLayout && (
        <form onSubmit={handleSubmit}>
          <div className="flex mb-6 ">
            <div className="text-white">
              {data.map((item, index) => (
                <div key={index}>
                  <p className="text-green">Annotation No. {index + 1}</p>
                  Top Left: [{item.baseDisplayText[0]}, {item.baseDisplayText[1]}]<br />
                  Bottom Right: [{item.baseLabel[0]}, {item.baseLabel[1]}]
                </div>
              ))}
              <label className="text-white">Add indications*:</label>
              <input
                className="p-2 text-black"
                type="text"
                value={formData.indications}
                onChange={(e) => handleChange('indications', e.target.value)}
                aria-label="Indications"
              />
              {errors.indications && (
                <p className="error-message text-red-500">{t('Please enter your indications.')}</p>
              )}
              <label className="text-white">Add findings*:</label>
              <input
                className="p-2 text-black"
                type="text"
                value={formData.findings}
                onChange={(e) => handleChange('findings', e.target.value)}
                aria-label="Findings"
              />
              {errors.findings && (
                <p className="error-message text-red-500">{t('Please enter your findings.')}</p>
              )}
            </div>
          </div>
          <div className="">
            <label className="text-white">Histopathology(Biopsy Results):</label>
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
        </form>
      )}
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
