import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { saveData, getData } from '../../../../../indexedDB'; // Adjust the path if necessary
import StudyItem from '../StudyItem';
import LegacyButtonGroup from '../LegacyButtonGroup';
import LegacyButton from '../LegacyButton';
import ThumbnailList from '../ThumbnailList';
import { StringNumber } from '../../types';
import axios from 'axios';

const getTrackedSeries = displaySets => {
  let trackedSeries = 0;
  displaySets.forEach(displaySet => {
    if (displaySet.isTracked) {
      trackedSeries++;
    }
  });
  return trackedSeries;
};

const StudyBrowser = ({
  tabs,
  activeTabName,
  expandedStudyInstanceUIDs,
  onClickTab,
  onClickStudy,
  onClickThumbnail,
  onDoubleClickThumbnail,
  onClickUntrack,
  activeDisplaySetInstanceUIDs,
  servicesManager,
}) => {
  const { t } = useTranslation('StudyBrowser');
  const { customizationService } = servicesManager?.services || {};
  const [hasConverted, setHasConverted] = useState(false);
  const [response, setResponse] = useState();

  useEffect(() => {
    saveData("response", response).catch(console.error);
  }, [response]);

  const getTabContent = () => {
    const tabData = tabs.find(tab => tab.name === activeTabName);
    return tabData.studies.map(
      ({ studyInstanceUid, date, description, numInstances, modalities, displaySets }) => {
        const isExpanded = expandedStudyInstanceUIDs.includes(studyInstanceUid);
        const order = ['R CC', 'L CC', 'R MLO', 'L MLO'];
        const sortedData = displaySets.sort((a, b) => {
          const seriesA = a.description.toUpperCase();
          const seriesB = b.description.toUpperCase();
          return order.indexOf(seriesA) - order.indexOf(seriesB);
        });


        const handleConvert = async () => {
          try {
            const response: any = await axios.post('http://localhost:8000/convert', {
              displaySets: displaySets,
              studies: tabData.studies
            });
            const focalnetResponse: any = await axios.post('http://localhost:8000/focalnetRun', {
              displaySets: displaySets,
              studies: tabData.studies
            });
            const clinicalResponse: any = await axios.post('http://localhost:8000/clinicalRun', {
              displaySets: displaySets,
              studies: tabData.studies
            });
            const smallmassResponse: any = await axios.post('http://localhost:8000/smallmassRun', {
              displaySets: displaySets,
              studies: tabData.studies
            });
            const densemassResponse: any = await axios.post('http://localhost:8000/densemassRun', {
              displaySets: displaySets,
              studies: tabData.studies
            });
            const mutliviewResponse: any = await axios.post('http://localhost:8000/mutliviewRun', {
              displaySets: displaySets,
              studies: tabData.studies
            });
            setResponse(response);
            if (response && response.data) {
              await saveData("focalnetResponse", focalnetResponse.data);
              await saveData("clinicalResponse", clinicalResponse.data);
              await saveData("smallmassResponse", smallmassResponse.data);
              await saveData("densemassResponse", densemassResponse.data);
              await saveData("mutliviewResponse", mutliviewResponse.data);
              await saveData("response", response.data);
            } else {
              console.error('No data received from the server');
            }
          } catch (error) {
            console.error('Error in handleConvert:', error);
          }
        }

        if (!hasConverted && displaySets?.length) {
          handleConvert();
          setHasConverted(true);
        }
        return (
          <React.Fragment key={studyInstanceUid}>
            <StudyItem
              date={date}
              description={description}
              numInstances={numInstances}
              modalities={modalities}
              trackedSeries={getTrackedSeries(sortedData)}
              isActive={isExpanded}
              onClick={() => {
                onClickStudy(studyInstanceUid);
              }}
              data-cy="thumbnail-list"
            />
            {isExpanded && displaySets && (
              <ThumbnailList
                thumbnails={sortedData}
                activeDisplaySetInstanceUIDs={activeDisplaySetInstanceUIDs}
                onThumbnailClick={onClickThumbnail}
                onThumbnailDoubleClick={onDoubleClickThumbnail}
                onClickUntrack={onClickUntrack}
              />
            )}
          </React.Fragment>
        );
      }
    );
  };

  return (
    <React.Fragment>
      <div
        className="w-100 border-[#e4b4db] bg-[#702963] flex h-16 flex-row items-center justify-center border-b p-4"
        data-cy={'studyBrowser-panel'}
      >
        <LegacyButtonGroup
          variant="outlined"
          color="secondary"
          splitBorder={false}
        >
          {tabs.map(tab => {
            const { name, label, studies } = tab;
            const isActive = activeTabName === name;
            const isDisabled = !studies.length;
            const classStudyBrowser = customizationService?.getModeCustomization(
              'class:StudyBrowser'
            ) || {
              true: 'default',
              false: 'default',
            };
            const color = classStudyBrowser[`${isActive}`];
            return (
              <LegacyButton
                key={name}
                className={'min-w-18 p-2 text-base text-white'}
                size="initial"
                color={color}
                bgColor={isActive ? 'bg-[#4d4c4d]' : 'bg-black'}
                onClick={() => {
                  onClickTab(name);
                }}
                disabled={isDisabled}
              >
                {t(label)}
              </LegacyButton>
            );
          })}
        </LegacyButtonGroup>
      </div>
      <div className="ohif-scrollbar invisible-scrollbar flex flex-1 flex-col overflow-auto">
        {getTabContent()}
      </div>
    </React.Fragment>
  );
};

StudyBrowser.propTypes = {
  onClickTab: PropTypes.func.isRequired,
  onClickStudy: PropTypes.func,
  onClickThumbnail: PropTypes.func,
  onDoubleClickThumbnail: PropTypes.func,
  onClickUntrack: PropTypes.func,
  activeTabName: PropTypes.string.isRequired,
  expandedStudyInstanceUIDs: PropTypes.arrayOf(PropTypes.string).isRequired,
  activeDisplaySetInstanceUIDs: PropTypes.arrayOf(PropTypes.string),
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      studies: PropTypes.arrayOf(
        PropTypes.shape({
          studyInstanceUid: PropTypes.string.isRequired,
          date: PropTypes.string,
          numInstances: PropTypes.number,
          modalities: PropTypes.string,
          description: PropTypes.string,
          displaySets: PropTypes.arrayOf(
            PropTypes.shape({
              displaySetInstanceUID: PropTypes.string.isRequired,
              imageSrc: PropTypes.string,
              imageAltText: PropTypes.string,
              seriesDate: PropTypes.string,
              seriesNumber: StringNumber,
              numInstances: PropTypes.number,
              description: PropTypes.string,
              componentType: PropTypes.oneOf(['thumbnail', 'thumbnailTracked', 'thumbnailNoImage'])
                .isRequired,
              isTracked: PropTypes.bool,
              dragData: PropTypes.shape({
                type: PropTypes.string.isRequired,
              }),
            })
          ),
        })
      ).isRequired,
    })
  ),
};

const noop = () => { };

StudyBrowser.defaultProps = {
  onClickTab: noop,
  onClickStudy: noop,
  onClickThumbnail: noop,
  onDoubleClickThumbnail: noop,
  onClickUntrack: noop,
};

export default StudyBrowser;
