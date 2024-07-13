import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

import LegacyButton from '../LegacyButton';
import Icon from '../Icon';
import Papa from 'papaparse';
import Typography from '../Typography';
import InputGroup from '../InputGroup';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

const StudyListFilter = ({
  filtersMeta,
  filterValues,
  onChange,
  clearFilters,
  isFiltering,
  numOfStudies,
  onUploadClick,
  getDataSourceConfigurationComponent,
}) => {
  const { t } = useTranslation('StudyList');
  const { sortBy, sortDirection } = filterValues;
  const filterSorting = { sortBy, sortDirection };
  const [instances, setInstances] = useState<any>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const setFilterSorting = sortingValues => {
    onChange({
      ...filterValues,
      ...sortingValues,
    });
  };
  const isSortingEnabled = numOfStudies > 0 && numOfStudies <= 100;

  const fetchInstances = () => {
    axios.get('http://localhost:8000/api/instances')
      .then(response => {
        console.log(response?.data, 'this is response data')
        setInstances(response?.data);
      })
      .catch(error => {
        console.error('Error fetching the instances:', error);
      });
  };
  if (instances?.length) {
    if (instances?.length === 0) {
      alert('No instances to export');
      return;
    }

    const fields = [
      'FileSize',
      'FileUuid',
      'ID',
      'IndexInSeries',
      'Labels',
      'MainDicomTags.InstanceNumber',
      'MainDicomTags.SOPInstanceUID',
      'ParentSeries',
      'Type'
    ];

    const csv = Papa.unparse(instances);

    // Create a blob and trigger download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'instances.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
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
    <React.Fragment>
      <div>
        <div className="bg-black">
          <div className="container relative mx-auto flex flex-col pt-5">
            <div className="mb-5 flex flex-row justify-between">
              <div className="flex min-w-[1px] shrink flex-row items-center gap-6">
                <Typography
                  variant="h6"
                  className="text-white"
                >
                  {t('StudyList')}
                </Typography>
                {getDataSourceConfigurationComponent && getDataSourceConfigurationComponent()}
                {onUploadClick && (
                  <div
                    className="text-white flex cursor-pointer items-center gap-2 self-center text-lg font-semibold"
                    onClick={onUploadClick}
                  >
                    <Icon name="icon-upload"></Icon>
                    <span>{t('Upload')}</span>
                  </div>
                )}
              </div>
              <div className="flex h-[34px] flex-row items-center">
                {/* TODO revisit the completely rounded style of button used for clearing the study list filter - for now use LegacyButton*/}
                {isFiltering && (
                  <LegacyButton
                    rounded="full"
                    variant="outlined"
                    color="primaryActive"
                    border="primaryActive"
                    className="mx-8"
                    startIcon={<Icon name="cancel" />}
                    onClick={clearFilters}
                  >
                    {t('ClearFilters')}
                  </LegacyButton>
                )}
                <div className='reverse-180'>
                  <Icon name="icon-upload"></Icon>
                </div>
                <Typography
                  variant="h6"
                  className="text-white flex cursor-pointer items-center gap-2 self-center text-lg font-semibold mx-4"
                  onClick={fetchInstances}
                >
                  {`${t('Export')} `}
                  <Typography
                    variant="h6"
                    className="text-white flex cursor-pointer items-center gap-2 self-center text-lg font-semibold mx-4"
                    onClick={() => setIsModalOpen(true)}
                  >
                    {`${t('Draw ROC & IOU curve')} `}
                  </Typography>
                  {isModalOpen &&
                    // <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    //   <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full mx-4">
                    //     <div className="flex justify-between items-center mb-4">
                    //       <h2 className="text-2xl font-semibold">ROC and IoU Curves</h2>
                    //       <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-800">&times;</button>
                    //     </div>
                    //     <div className="mb-6">
                    //       <Line data={rocData} />
                    //     </div>
                    //     <div>
                    //       <Line data={iouData} />
                    //     </div>
                    //     <button
                    //       onClick={() => setIsModalOpen(false)}
                    //       className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
                    //     >
                    //       Close
                    //     </button>
                    //   </div>
                    // </div>

                    <div
                      className={`fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50`}
                      onClick={() => setIsModalOpen(false)}
                    >
                      <div
                        className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full mx-4 overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex justify-between items-center mb-4">
                          <h2 className="text-2xl font-semibold">ROC and IoU Curves</h2>
                          <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-800">&times;</button>
                        </div>
                        <div className="mb-6">
                          <Line data={rocData} />
                        </div>
                        <div >
                          <Line data={iouData} />
                        </div>
                        <button
                          onClick={() => setIsModalOpen(false)}
                          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  }
                </Typography>
                <Typography
                  variant="h6"
                  className="text-[#e4b4db]"
                >
                  {`${t('Number of studies')}: `}
                </Typography>
                <Typography
                  variant="h6"
                  className="mr-2"
                  data-cy={'num-studies'}
                >
                  {numOfStudies > 100 ? '>100' : numOfStudies}
                </Typography>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="sticky -top-1 z-10 mx-auto border-b-4 border-black">
        <div className="bg-[#702963] pt-3 pb-3">
          <InputGroup
            inputMeta={filtersMeta}
            values={filterValues}
            onValuesChange={onChange}
            sorting={filterSorting}
            onSortingChange={setFilterSorting}
            isSortingEnabled={isSortingEnabled}
          />
        </div>
        {numOfStudies > 100 && (
          <div className="container m-auto">
            <div className="bg-[#4d4c4d] rounded-b py-1 text-center text-base">
              <p className="text-white">{t('Filter list to 100 studies or less to enable sorting')}</p>
            </div>
          </div>
        )}
      </div>
    </React.Fragment>
  );
};

StudyListFilter.propTypes = {
  filtersMeta: PropTypes.arrayOf(
    PropTypes.shape({
      /** Identifier used to map a field to it's value in `filterValues` */
      name: PropTypes.string.isRequired,
      /** Friendly label for filter field */
      displayName: PropTypes.string.isRequired,
      /** One of the supported filter field input types */
      inputType: PropTypes.oneOf(['Text', 'MultiSelect', 'DateRange', 'None']).isRequired,
      isSortable: PropTypes.bool.isRequired,
      /** Size of filter field in a 12-grid system */
      gridCol: PropTypes.oneOf([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]).isRequired,
      /** Options for a "MultiSelect" inputType */
      option: PropTypes.arrayOf(
        PropTypes.shape({
          value: PropTypes.string,
          label: PropTypes.string,
        })
      ),
    })
  ).isRequired,
  filterValues: PropTypes.object.isRequired,
  numOfStudies: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  clearFilters: PropTypes.func.isRequired,
  isFiltering: PropTypes.bool.isRequired,
  onUploadClick: PropTypes.func,
  getDataSourceConfigurationComponent: PropTypes.func,
};

export default StudyListFilter;
