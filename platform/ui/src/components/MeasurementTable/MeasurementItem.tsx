import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import Icon from '../Icon';

const MeasurementItem = ({
  uid,
  index,
  label,
  displayText,
  isActive,
  onClick,
  onEdit,
  onDelete,
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const [isIndexHovering, setIsIndexHovering] = useState(false);

  const onEditHandler = event => {
    event.stopPropagation();
    onEdit({ uid, isActive, event });
  };

  const onDeleteHandler = event => {
    event.stopPropagation();
    onDelete({ uid, isActive, event });
  };

  const onClickHandler = event => onClick({ uid, isActive, event });

  const onMouseEnter = () => setIsHovering(true);
  const onMouseLeave = () => setIsHovering(false);

  return (
    <div
      className={classnames(
        'group flex cursor-pointer border border-transparent bg-black outline-none transition duration-300',
        {
          'border-[#e4b4db] overflow-hidden rounded': isActive,
        }
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClickHandler}
      role="button"
      tabIndex="0"
      data-cy={'measurement-item'}
    >
      <div
        className={classnames('w-6 py-1 text-center text-base transition duration-300', {
          'bg-[#4d4c4d] active text-black': isActive,
          'bg-[#702963] text-[#e4b4db] group-hover:bg-[#1a0000]': !isActive,
        })}
        onMouseEnter={() => setIsIndexHovering(true)}
        onMouseLeave={() => setIsIndexHovering(false)}
      >
        {isIndexHovering ? (
          <Icon
            name="close"
            className={classnames(
              'mx-auto mt-1 w-[10px] text-center transition duration-500 hover:opacity-80',
              {
                'bg-[#4d4c4d] text-black': isActive,
                'bg-[#702963] text-[#e4b4db] group-hover:bg-[#1a0000]': !isActive,
              }
            )}
            onClick={onDeleteHandler}
          />
        ) : (
          <span>{index}</span>
        )}
      </div>
      <div className="relative flex flex-1 flex-col py-1 pl-2 pr-1">
        <span className="text-[#e4b4db] mb-1 text-base">{label}</span>
      </div>
    </div>
  );
};

MeasurementItem.propTypes = {
  uid: PropTypes.oneOfType([PropTypes.number.isRequired, PropTypes.string.isRequired]),
  index: PropTypes.number.isRequired,
  label: PropTypes.string,
  displayText: PropTypes.array.isRequired,
  isActive: PropTypes.bool,
  onClick: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

MeasurementItem.defaultProps = {
  isActive: false,
};

export default MeasurementItem;
