import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { Tooltip, Icon, ViewportActionArrows, useViewportGrid } from '@ohif/ui';
import { annotation } from '@cornerstonejs/tools';
import { useTrackedMeasurements } from './../getContextModule';
import { BaseVolumeViewport, Enums } from '@cornerstonejs/core';
import { useTranslation } from 'react-i18next';
import { getData } from '../../../../indexedDB';

function TrackedCornerstoneViewport(props) {

  const { displaySets, viewportId, servicesManager, extensionManager } = props;
  const {
    measurementService,
    cornerstoneViewportService,
    viewportGridService,
    viewportActionCornersService,
  } = servicesManager.services;

  const displaySet = displaySets[0];
  const { t } = useTranslation('Common');
  const [viewportGrid] = useViewportGrid();
  const { activeViewportId } = viewportGrid;
  const [trackedMeasurements, sendTrackedMeasurementsEvent] = useTrackedMeasurements();
  const [isTracked, setIsTracked] = useState(false);
  const [trackedMeasurementUID, setTrackedMeasurementUID] = useState(null);
  const [viewportElem, setViewportElem] = useState(null);
  const { trackedSeries } = trackedMeasurements.context;
  const { SeriesInstanceUID } = displaySet;

  const updateIsTracked = useCallback(() => {
    const viewport = cornerstoneViewportService.getCornerstoneViewport(viewportId);
    if (viewport instanceof BaseVolumeViewport) {
      const currentImageId = viewport?.getCurrentImageId();
      if (!currentImageId) {
        if (isTracked) {
          setIsTracked(false);
        }
        return;
      }
    }
    if (trackedSeries.includes(SeriesInstanceUID) !== isTracked) {
      setIsTracked(!isTracked);
    }
  }, [isTracked, trackedMeasurements, viewportId, SeriesInstanceUID]);

  const onElementEnabled = useCallback(
    evt => {
      if (evt.detail.element !== viewportElem) {
        evt.detail.element?.addEventListener(
          Enums.Events.VOLUME_VIEWPORT_NEW_VOLUME,
          updateIsTracked
        );
        setViewportElem(evt.detail.element);
      }
    },
    [updateIsTracked, viewportElem]
  );

  const onElementDisabled = useCallback(() => {
    viewportElem?.removeEventListener(Enums.Events.VOLUME_VIEWPORT_NEW_VOLUME, updateIsTracked);
  }, [updateIsTracked, viewportElem]);

  useEffect(updateIsTracked, [updateIsTracked]);
  useEffect(() => {
    localStorage.setItem('manualBoundingBoxCoordinates', '');
  }, [])
  useEffect(() => {
    const { unsubscribe } = cornerstoneViewportService.subscribe(
      cornerstoneViewportService.EVENTS.VIEWPORT_DATA_CHANGED,
      props => {
        if (props.viewportId !== viewportId) {
          return;
        }
        updateIsTracked();
      }
    );
    return () => {
      unsubscribe();
    };
  }, [updateIsTracked, viewportId]);

  useEffect(() => {
    if (isTracked) {
      annotation.config.style.setViewportToolStyles(viewportId, {
        global: {
          lineDash: '',
        },
      });
      cornerstoneViewportService.getRenderingEngine().renderViewport(viewportId);
      return;
    }
    annotation.config.style.setViewportToolStyles(viewportId, {
      global: {
        lineDash: '4,4',
      },
    });
    cornerstoneViewportService.getRenderingEngine().renderViewport(viewportId);
    return () => {
      annotation.config.style.setViewportToolStyles(viewportId, {});
    };
  }, [isTracked]);

  useEffect(() => {
    const added = measurementService.EVENTS.MEASUREMENT_ADDED;
    const addedRaw = measurementService.EVENTS.RAW_MEASUREMENT_ADDED;
    const subscriptions = [];
    [added, addedRaw].forEach(evt => {
      subscriptions.push(
        measurementService.subscribe(evt, ({ source, measurement }) => {
          const { activeViewportId } = viewportGridService.getState();
          if (viewportId === activeViewportId) {
            const { referenceStudyUID: StudyInstanceUID, referenceSeriesUID: SeriesInstanceUID, uid: measurementId } = measurement;
            sendTrackedMeasurementsEvent('SET_DIRTY', { SeriesInstanceUID });
            sendTrackedMeasurementsEvent('TRACK_SERIES', {
              viewportId,
              StudyInstanceUID,
              SeriesInstanceUID,
              measurementId,
            });
          }
        }).unsubscribe
      );
    });
    return () => {
      subscriptions.forEach(unsub => {
        unsub();
      });
    };
  }, [measurementService, sendTrackedMeasurementsEvent, viewportId, viewportGridService]);

  const switchMeasurement = useCallback(
    direction => {
      const newTrackedMeasurementUID = _getNextMeasurementUID(
        direction,
        servicesManager,
        trackedMeasurementUID,
        trackedMeasurements
      );
      if (!newTrackedMeasurementUID) {
        return;
      }
      setTrackedMeasurementUID(newTrackedMeasurementUID);
      measurementService.jumpToMeasurement(viewportId, newTrackedMeasurementUID);
    },
    [measurementService, servicesManager, trackedMeasurementUID, trackedMeasurements, viewportId]
  );

  useEffect(() => {
    const statusComponent = _getStatusComponent(isTracked, t);
    const arrowsComponent = _getArrowsComponent(
      isTracked,
      switchMeasurement,
      viewportId === activeViewportId
    );
    viewportActionCornersService.setComponents([
      {
        viewportId,
        id: 'viewportStatusComponent',
        component: statusComponent,
        indexPriority: -100,
        location: viewportActionCornersService.LOCATIONS.topLeft,
      },
      {
        viewportId,
        id: 'viewportActionArrowsComponent',
        component: arrowsComponent,
        indexPriority: 0,
        location: viewportActionCornersService.LOCATIONS.topRight,
      },
    ]);
  }, [activeViewportId, isTracked, switchMeasurement, viewportActionCornersService, viewportId]);

  const [storedValue, setStoredValue] = useState(null);
  const modelType = localStorage.getItem('items');
  useEffect(() => {
    const checkLocalStorage = async () => {
      const storedValue = await getData("response");
      console.log(storedValue, 'storedValue')
      if (storedValue) {
        setStoredValue(storedValue);
        clearInterval(checkInterval);
      }
    };
    const checkInterval = setInterval(checkLocalStorage, 10000);
    return () => clearInterval(checkInterval);
  }, []);

  const [isDrawing, setIsDrawing] = useState(false);
  const [startCoords, setStartCoords] = useState({ x: 0, y: 0 });
  const [currentCoords, setCurrentCoords] = useState({ x: 0, y: 0 });
  const [boundingBoxes, setBoundingBoxes] = useState([]);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleMouseDown = (event) => {
    if (!imageLoaded) return;
    const rect = event.target.getBoundingClientRect();
    setStartCoords({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
    setCurrentCoords({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
    setIsDrawing(true);
  };

  const handleMouseMove = (event) => {
    if (!isDrawing || !imageLoaded) return;
    const rect = event.target.getBoundingClientRect();
    setCurrentCoords({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  };

  const handleMouseUp = () => {
    if (!imageLoaded) return;
    setIsDrawing(false);
    setBoundingBoxes([...boundingBoxes, { start: startCoords, end: currentCoords }]);
  };

  useEffect(() => {
    if (boundingBoxes.length > 0) {
      localStorage.setItem('manualBoundingBoxCoordinates', JSON.stringify(boundingBoxes));
    }
  }, [boundingBoxes]);

  useEffect(() => {
    if (!storedValue) return;
    const img = new Image();
    img.src = storedValue?.message[displaySet?.SeriesDescription]?.img;
    img.onload = () => setImageLoaded(true);
  }, [storedValue, displaySet]);

  // const removeBoundingBox = (index) => {
  //   const updatedBoxes = [...boundingBoxes];
  //   updatedBoxes.splice(index, 1);
  //   setBoundingBoxes(updatedBoxes);
  // };

  const getBoundingBoxStyle = (start, end, index: null) => {
    const left = Math.min(start.x, end.x);
    const top = Math.min(start.y, end.y);
    const width = Math.abs(end.x - start.x);
    const height = Math.abs(end.y - start.y);

    return {
      position: 'absolute',
      border: '2px solid #702963',
      left,
      top,
      width,
      height,
      cursor: 'pointer', // Optional: Change cursor to pointer when hovering over bounding box
      // Adding a cross icon (assuming you have an icon component)
      padding: '2px',
      // backgroundColor: 'white',
      // display: 'flex',
      // justifyContent: 'center',
      // alignItems: 'center',
      // borderRadius: '50%',
      // boxShadow: '0 0 5px rgba(0, 0, 0, 0.3)',
      // textAlign: 'center',
      // Cross icon style
      crossIcon: {
        width: '12px',
        height: '12px',
        cursor: 'pointer',
      },
      // onClick: removeBox(index),
    };
  };

  const getCornerstoneViewport = () => {
    const { component: Component } = extensionManager.getModuleEntry(
      '@ohif/extension-cornerstone.viewportModule.cornerstone'
    );
    return (
      <Component
        {...props}
        onElementEnabled={onElementEnabled}
        onElementDisabled={onElementDisabled}
      />
    );
  };

  const removeBoundingBox = (index) => {
    const updatedBoxes = [...boundingBoxes];
    updatedBoxes.splice(index, 1);
    setBoundingBoxes(updatedBoxes);
  };

  return (
    <div className="relative flex h-full w-full flex-row overflow-hidden">
      {storedValue && modelType?.length > 0 ? (
        <>
          <img
            src={storedValue?.message[displaySet?.SeriesDescription]?.img}
            alt="Annotated"
            style={{ display: 'block' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          />
          {boundingBoxes.map((box, index: any) => (
            <div key={index} style={getBoundingBoxStyle(box.start, box.end, index)}>
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  backgroundColor: 'white',
                  color: '#702963',
                  opacity: "0.5",
                  fontSize: '10px',
                  lineHeight: '10px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
                onClick={() => removeBoundingBox(index)}
              >
                x
              </div>
            </div>
          ))}
          {isDrawing && (
            <div style={getBoundingBoxStyle(startCoords, currentCoords, null)}></div>
          )}
        </>
      ) : (
        getCornerstoneViewport()
      )}
    </div>

  );
}

TrackedCornerstoneViewport.propTypes = {
  displaySets: PropTypes.arrayOf(PropTypes.object.isRequired).isRequired,
  viewportId: PropTypes.string.isRequired,
  dataSource: PropTypes.object,
  children: PropTypes.node,
  customProps: PropTypes.object,
};

TrackedCornerstoneViewport.defaultProps = {
  customProps: {},
};

function _getNextMeasurementUID(
  direction,
  servicesManager,
  trackedMeasurementId,
  trackedMeasurements
) {
  const { measurementService, viewportGridService } = servicesManager.services;
  const measurements = measurementService.getMeasurements();

  const { activeViewportId, viewports } = viewportGridService.getState();
  const { displaySetInstanceUIDs: activeViewportDisplaySetInstanceUIDs } =
    viewports.get(activeViewportId);

  const { trackedSeries } = trackedMeasurements.context;

  const filteredMeasurements = measurements.filter(
    m =>
      trackedSeries.includes(m.referenceSeriesUID) &&
      activeViewportDisplaySetInstanceUIDs.includes(m.displaySetInstanceUID)
  );

  if (!filteredMeasurements.length) {
    return;
  }

  const measurementCount = filteredMeasurements.length;

  const uids = filteredMeasurements.map(fm => fm.uid);
  let measurementIndex = uids.findIndex(uid => uid === trackedMeasurementId);

  if (measurementIndex === -1) {
    measurementIndex = 0;
  } else {
    measurementIndex += direction;
    if (measurementIndex < 0) {
      measurementIndex = measurementCount - 1;
    } else if (measurementIndex === measurementCount) {
      measurementIndex = 0;
    }
  }

  const newTrackedMeasurementId = uids[measurementIndex];

  return newTrackedMeasurementId;
}

const _getArrowsComponent = (isTracked, switchMeasurement, isActiveViewport) => {
  if (!isTracked) {
    return null;
  }

  return (
    <ViewportActionArrows
      onArrowsClick={direction => switchMeasurement(direction)}
      className={isActiveViewport ? 'visible' : 'invisible group-hover:visible'}
    ></ViewportActionArrows>
  );
};

function _getStatusComponent(isTracked, t) {
  if (!isTracked) {
    return null;
  }

  return (
    <div className="relative">
      <Tooltip
        position="bottom-left"
        content={
          <div className="flex py-2">
            <div className="flex pt-1">
              <Icon name="info-link" className="text-[#e4b4db] w-4" />
            </div>
            <div className="ml-4 flex">
              <span className="text-common-light text-base">
                {isTracked ? (
                  <>{t('Series is tracked and can be viewed in the measurement panel')}</>
                ) : (
                  <>{t('Measurements for untracked series will not be shown in the measurements panel')}</>
                )}
              </span>
            </div>
          </div>
        }
      >
        <Icon name={'viewport-status-tracked'} className="text-white" />
      </Tooltip>
    </div>
  );
}

export default TrackedCornerstoneViewport;
