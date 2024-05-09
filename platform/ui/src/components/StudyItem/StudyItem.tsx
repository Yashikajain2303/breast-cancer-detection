import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { useTranslation } from 'react-i18next';

import Icon from '../Icon';

const baseClasses =
  'first:border-0 border-t border-[#e4b4db] cursor-pointer select-none outline-none';

const StudyItem = ({
  date,
  description,
  numInstances,
  modalities,
  trackedSeries,
  isActive,
  onClick,
}) => {
  const { t } = useTranslation('StudyItem');
  return (
    <div
      className={classnames(
        isActive ? 'bg-[#702963]' : 'hover:bg-[#1a0000] bg-black',
        baseClasses
      )}
      onClick={onClick}
      onKeyDown={onClick}
      role="button"
      tabIndex="0"
    >
      <div className="flex flex-1 flex-col px-4 pb-2">
        <div className="flex flex-row items-center justify-between pt-2 pb-2">
          <div className="text-base text-white">{date}</div>
          <div className="flex flex-row items-center text-base text-[#e4b4db]">
            <Icon
              name="group-layers"
              className="mx-2 w-4 text-[#e4b4db]"
            />
            {numInstances}
          </div>
        </div>
        <div className="flex flex-row py-1">
          <div className="pr-5 text-xl text-[#e4b4db]">{modalities}</div>
          <div className="truncate-2-lines break-words text-base text-[#e4b4db]">{description}</div>
        </div>
      </div>
      {!!trackedSeries && (
        <div className="flex-2 flex">
          <div
            className={classnames(
              'bg-[#1a0000] mt-2 flex flex-row py-1 pl-2 pr-4 text-base text-white ',
              isActive
                ? 'border-[#e4b4db] flex-1 justify-center border-t'
                : 'mx-4 mb-4 rounded-sm'
            )}
          >
            <Icon
              name="tracked"
              className="text-[#e4b4db] mr-2 w-4"
            />
            {t('Tracked series', { trackedSeries: trackedSeries })}
          </div>
        </div>
      )}
    </div>
  );
};

StudyItem.propTypes = {
  date: PropTypes.string.isRequired,
  description: PropTypes.string,
  modalities: PropTypes.string.isRequired,
  numInstances: PropTypes.number.isRequired,
  trackedSeries: PropTypes.number,
  isActive: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};

export default StudyItem;
