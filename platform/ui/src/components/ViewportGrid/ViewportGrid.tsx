import React from 'react';
import PropTypes from 'prop-types';

function ViewportGrid({ numRows, numCols, layoutType, children }) {
  // Make a copy of the children array
  const modifiedChildren = [...children];
  const order = ['R CC', 'L CC', 'R MLO', 'L MLO'];
  modifiedChildren[1].sort((a, b) => {
    const seriesA = a?.props?.children?.props?.children?.props?.displaySets[0]?.SeriesDescription.toUpperCase();
    const seriesB = b?.props?.children?.props?.children?.props?.displaySets[0]?.SeriesDescription.toUpperCase();
    return order.indexOf(seriesA) - order.indexOf(seriesB);
  });
  if (numCols === 2 && numRows === 2) {
    modifiedChildren[1].forEach(child => {
      const seriesDescription = child.props.children.props.children.props.displaySets[0]?.SeriesDescription.toUpperCase();
      let customStyle = {};

      // Set customStyle based on the seriesDescription
      switch (seriesDescription) {
        case 'R CC':
          customStyle = {
            position: "absolute",
            top: "0.2%",
            left: "0.2%",
            width: "49.7%",
            height: "49.7%"
          };
          break;
        case 'L CC':
          customStyle = {
            position: "absolute",
            top: "0.2%",
            left: "50.2%",
            width: "49.7%",
            height: "49.7%"
          };
          break;
        case 'R MLO':
          customStyle =
          {
            position: "absolute",
            top: "50.2%",
            left: "0.2%",
            width: "49.7%",
            height: "49.7%"
          }
          break;
        case 'L MLO':
          customStyle = {
            position: "absolute",
            top: "50.2%",
            left: "50.2%",
            width: "49.7%",
            height: "49.7%"
          }
          break;
        default:
          customStyle = {
            position: "absolute"
          }
        // {
        //   width: "99.7%",
        //   height: "99.7%",
        //   left: "50.2%",
        //   position: "absolute",
        //   top: "0.2%",

        // }
        // case: 'L MLO':
        // Add more cases for 'R MLO' and 'L MLO' if necessary

      }

      // Clone the child and add customStyle
      modifiedChildren[1][modifiedChildren[1].indexOf(child)] = React.cloneElement(child, {
        ...child.props,
        customStyle: { ...child.props.style, ...customStyle }
      });
    });
  }

  return (
    <div
      data-cy="viewport-grid"
      style={{
        position: 'relative',
        height: '100%',
        width: '100%',
      }}
    >
      {modifiedChildren}
    </div>
  );
}

ViewportGrid.propTypes = {
  numRows: PropTypes.number.isRequired,
  numCols: PropTypes.number.isRequired,
  layoutType: PropTypes.string,
  children: PropTypes.arrayOf(PropTypes.node).isRequired,
};

export default ViewportGrid;
