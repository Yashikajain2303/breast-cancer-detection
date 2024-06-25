import * as cornerstone from '@cornerstonejs/core';
import * as cornerstoneTools from '@cornerstonejs/tools';
import { addTool } from '@cornerstonejs/tools';

cornerstoneTools.extension.defineExtension('customLayout', {
  populateContextMenu: populateContextMenu, // Function to add an option to the context menu
  onViewportUpdated: onViewportUpdated // Function to handle viewport updates
});

function populateContextMenu(menu, options) {
  menu.push({
    label: 'Apply Custom Layout',
    minWidth: 170,
    render: function (element) {
      element.textContent = 'Apply Custom Layout';
    },
    onActive: function () {
      const element = options.element;
      const viewport = cornerstone.getViewport(element);
      applyCustomLayout(viewport);
    }
  });
}

document.getElementById('focalnetDino').addEventListener('click', function () {
  const element = document.getElementById('cornerstoneElement');
  const referenceLinesTool = cornerstoneTools.ReferenceLinesTool.createNew(element);

  // Optional: Configure tool properties
  cornerstoneTools.ReferenceLinesTool.setColor('red');
  cornerstoneTools.ReferenceLinesTool.setWidth(2);

  // Add the tool to the viewport
  addTool(referenceLinesTool);
});

function applyCustomLayout(viewport) {
  const element = viewport.element;
  const enabledElements = cornerstone.getEnabledElements();

  // Check if there are exactly four enabled elements (images)
  if (enabledElements.length !== 4) {
    console.error('Custom layout requires exactly four images');
    return;
  }

  const width = element.clientWidth;
  const height = element.clientHeight;

  // Assuming image information is available for positioning
  const imageInfo = [
    { imageId: 'RCC_Image_ID', position: 'top-left' },
    { imageId: 'LCC_Image_ID', position: 'top-right' },
    { imageId: 'RMLO_Image_ID', position: 'bottom-left' },
    { imageId: 'LMLO_Image_ID', position: 'bottom-right' }
  ];

  // Loop through enabled elements and position them based on imageInfo
  for (const enabledElement of enabledElements) {
    const imageId = enabledElement.getImage().data.sopInstanceUid;
    const position = imageInfo[imageId];

    if (position) {
      enabledElement.canvas.style.position = 'absolute';
      enabledElement.canvas.style.top = `${position.top}px`;
      enabledElement.canvas.style.left = `${position.left}px`;
    } else {
      console.warn(`Image with SOP Instance UID '${imageId}' not found in layout definition`);
    }
  }

  cornerstone.updateImage(viewport.element);
}

function onViewportUpdated(e) {
  const viewport = e.detail.viewport;
  applyCustomLayout(viewport);
  cornerstoneTools.extension.enableExtension('customLayout');
}
