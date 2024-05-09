import React from 'react';
import Icon from '../Icon';
import { useTranslation } from 'react-i18next';

function NoSegmentationRow({ onSegmentationAdd }) {
  const { t } = useTranslation('SegmentationTable');
  return (
    <div
      className="group"
      onClick={onSegmentationAdd}
    >
      <div className="text-white group-hover:bg-[#702963] flex items-center rounded-[4px] group-hover:cursor-pointer">
        <div className="grid h-[28px] w-[28px] place-items-center">
          <Icon name="icon-add" />
        </div>
        <span className="text-[13px]">{t('Add segmentation')}</span>
      </div>
    </div>
  );
}

export default NoSegmentationRow;
