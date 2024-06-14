import SUPPORTED_TOOLS from './constants/supportedTools';
import getSOPInstanceAttributes from './utils/getSOPInstanceAttributes';
import fs from 'fs';

const RectangleROI = {
  toAnnotation: measurement => { },
  toMeasurement: (
    csToolsEventDetail,
    DisplaySetService,
    CornerstoneViewportService,
    getValueTypeFromToolType
  ) => {
    const { annotation, viewportId } = csToolsEventDetail;
    alert(JSON.stringify(annotation))
    console.log(JSON.parse(JSON.stringify(annotation)), 'annotation dataaaaaa')

    // Write JSON string to a file
    fs.writeFile('annotation.json', JSON.parse(JSON.stringify(annotation)), 'utf8', err => {
      if (err) {
        console.error('Error writing JSON to file:', err);
      } else {
        console.log('Annotation data saved as annotation.json');
      }
    });
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
    console.log(points, 'we are points')
    // [
    //   [
    //     0,
    //     124.61280139939905,
    //     -129.34214082079328
    //   ],
    //   [
    //     0,
    //     154.6654388455529,
    //     -129.34214082079328
    //   ],
    //   [
    //     0,
    //     124.61280139939905,
    //     -152.71641439002406
    //   ],
    //   [
    //     0,
    //     154.6654388455529,
    //     -152.71641439002406
    //   ]
    // ];

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
    console.log(annotationUID,
      SOPInstanceUID,
      points,
      metadata,
      SeriesInstanceUID,
      StudyInstanceUID,
      topLeftCorner,
      bottomRightCorner,
      metadata.toolName, displaySet.displaySetInstanceUID,
      length, 'measuremeneeent details')
    // breadth, getValueTypeFromToolType(toolName))
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
