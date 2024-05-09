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



    // const length = Math.max(...xCoordinates) - Math.min(...xCoordinates);
    // const breadth = Math.max(...yCoordinates) - Math.min(...yCoordinates);
    // console.log(points, 'points');
    // const topLeft = points[1];
    // const bottomRight = points[2];

    const minX = Math.round(Math.min(...points.map(point => point[1])));
    const maxX = Math.round(Math.max(...points.map(point => point[1])));
    const minY = Math.round(Math.min(...points.map(point => point[2])));
    const maxY = Math.round(Math.max(...points.map(point => point[2])));

    // Assuming X-coordinates don't change significantly (adjust if needed)
    const topLeftCorner = [minX, -maxY];
    const bottomRightCorner = [maxX, -minY];

    console.log("Top-Left X:-----------1", topLeftCorner);
    // console.log("Top-Left Y:-----------1", topLeft[1]);
    console.log("Bottom-Right:-----------1", bottomRightCorner);
    return {
      uid: annotationUID,
      SOPInstanceUID,
      points,
      metadata,
      referenceSeriesUID: SeriesInstanceUID,
      referenceStudyUID: StudyInstanceUID,
      frameNumber: 1,
      displayText: topLeftCorner,
      label: bottomRightCorner,
      toolName: metadata.toolName,
      displaySetInstanceUID: displaySet.displaySetInstanceUID,
      length,
      // breadth,
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
