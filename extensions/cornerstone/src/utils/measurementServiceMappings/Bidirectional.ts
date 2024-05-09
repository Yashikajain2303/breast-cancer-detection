import SUPPORTED_TOOLS from './constants/supportedTools';
import getSOPInstanceAttributes from './utils/getSOPInstanceAttributes';

const RectangleROI = {
  toAnnotation: measurement => { },
  toMeasurement: (
    csToolsEventDetail,
    DisplaySetService,
    CornerstoneViewportService,
    getValueTypeFromToolType
  ) => {
    const { annotation, viewportId } = csToolsEventDetail;
    const { metadata, data, annotationUID } = annotation;

    if (!metadata || !data) {
      console.warn('Rectangle ROI tool: Missing metadata or data');
      return null;
    }

    const { toolName, referencedImageId } = metadata;
    const validToolType = SUPPORTED_TOOLS.includes(toolName);

    if (!validToolType) {
      throw new Error('Tool not supported');
    }

    const { SOPInstanceUID, SeriesInstanceUID, StudyInstanceUID } = getSOPInstanceAttributes(
      referencedImageId,
      CornerstoneViewportService,
      viewportId
    );

    let displaySet;

    if (SOPInstanceUID) {
      displaySet = DisplaySetService.getDisplaySetForSOPInstanceUID(
        SOPInstanceUID,
        SeriesInstanceUID
      );
    } else {
      displaySet = DisplaySetService.getDisplaySetsForSeries(SeriesInstanceUID);
    }

    const { points } = data.handles;

    const xCoordinates = points.map(point => point[1]);
    const yCoordinates = points.map(point => point[2]);

    const length = Math.max(...xCoordinates) - Math.min(...xCoordinates);
    const breadth = Math.max(...yCoordinates) - Math.min(...yCoordinates);

    return {
      uid: annotationUID,
      SOPInstanceUID,
      points,
      metadata,
      referenceSeriesUID: SeriesInstanceUID,
      referenceStudyUID: StudyInstanceUID,
      frameNumber: 1,
      toolName: metadata.toolName,
      displaySetInstanceUID: displaySet.displaySetInstanceUID,
      length,
      breadth,
      type: getValueTypeFromToolType(toolName),
    };
  },
};

function getDisplayText(mappedAnnotations, displaySet) {
  if (!mappedAnnotations || !mappedAnnotations.length) {
    return '';
  }

  const displayText = [];

  mappedAnnotations.forEach(mappedAnnotation => {
    const { length, breadth } = mappedAnnotation;

    if (!length || !breadth) {
      return;
    }

    const roundedLength = Math.round(length * 100) / 100; // Round to 2 decimal places
    const roundedBreadth = Math.round(breadth * 100) / 100; // Round to 2 decimal places

    displayText.push(`Length: ${roundedLength} mm, Breadth: ${roundedBreadth} mm`);
  });

  return displayText.join('\n');
}

export { RectangleROI as default, getDisplayText };
