import React, { ReactNode, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

import NavBar from '../NavBar';
import Svg from '../Svg';
import Icon from '../Icon';
import IconButton from '../IconButton';
import Dropdown from '../Dropdown';
import HeaderPatientInfo from '../HeaderPatientInfo';
import { PatientInfoVisibility } from '../../types/PatientInfoVisibility';

function Header({
  children,
  menuOptions,
  isReturnEnabled,
  onClickReturnButton,
  isSticky,
  WhiteLabeling,
  showPatientInfo = PatientInfoVisibility.VISIBLE_COLLAPSED,
  servicesManager,
  ...props
}): ReactNode {
  const { t } = useTranslation('Header');

  // TODO: this should be passed in as a prop instead and the react-router-dom
  // dependency should be dropped
  const onClickReturn = () => {
    if (isReturnEnabled && onClickReturnButton) {
      onClickReturnButton();
    }
  };

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState('');
  const options = [
    { id: 0, label: 'Focalnet Dino' },
    { id: 1, label: 'Multiview' },
    { id: 2, label: 'Dense Mass' },
    { id: 3, label: 'Small Mass' },
    { id: 4, label: 'Clinical History' }
  ];

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleSelect = (item) => {
    setSelectedItem(item);
    localStorage.setItem('items', JSON.stringify(item));
    setDropdownOpen(false);
  };

  const clearSelection = () => {
    setSelectedItem('');
    setDropdownOpen(false);
  };

  return (
    <NavBar
      isSticky={isSticky}
      {...props}
    >
      <div className="relative h-[48px] items-center ">
        <div className="absolute left-0 top-1/2 flex -translate-y-1/2 items-center">
          <div
            className={classNames(
              'mr-3 inline-flex items-center',
              isReturnEnabled && 'cursor-pointer'
            )}
            onClick={onClickReturn}
            data-cy="return-to-work-list"
          >
            {isReturnEnabled && (
              <Icon
                name="chevron-left"
                className="text-white w-8"
              />
            )}
            <div className="ml-1 text-white">
              Breast Cancer Detection by IITD/AIIMS
              {/* {WhiteLabeling?.createLogoComponentFn?.(React, props) || <Svg name="logo-ohif" />} */}
            </div>
          </div>
        </div>
        {/* <div className="absolute top-1/2 left-[211px]  h-8 w-20 -translate-y-1/2">{future left component}</div> */}
        <div className="absolute flex left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform">
          <div className="flex items-center justify-center space-x-2">{children}</div>
          {children &&
            <div className="relative text-left min-w-[120px]">
              <div>
                <button
                  type="button"
                  className="flex items-center justify-center mt-[10px] w-full min-w-[120px] justify-center rounded-md bg-[#702963] whitespace-nowrap text-sm font-semibold text-white shadow-sm hover:bg-white-50"
                  id="menu-button"
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                  onClick={toggleDropdown}
                >
                  <svg
                    className="mr-2 h-5 w-5 text-gray-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
                  </svg>
                  {selectedItem || 'Select AI Tools'}
                  <svg
                    className="-mr-1 ml-2 h-5 w-5 text-gray-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>

              {dropdownOpen && (
                <div className="absolute right-0 z-10 mt-2 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1 min-w-max" role="none">
                    {options.map((option) => (
                      <button
                        key={option.id}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        role="menuitem"
                        onClick={() => handleSelect(option.label)}
                      >
                        {option.label}
                      </button>
                    ))}
                    {selectedItem && (
                      <button
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        onClick={clearSelection}
                      >
                        Clear Selection
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          }
        </div>
        <div className="absolute right-0 top-1/2 flex -translate-y-1/2 select-none items-center">
          {(showPatientInfo === PatientInfoVisibility.VISIBLE ||
            showPatientInfo === PatientInfoVisibility.VISIBLE_COLLAPSED) && (
              <HeaderPatientInfo servicesManager={servicesManager} />
            )}
          <div className="border-primary-dark mx-1.5 h-[25px] border-r"></div>
          <div className="flex-shrink-0">
            <Dropdown
              id="options"
              showDropdownIcon={false}
              list={menuOptions}
              alignment="right"
            >
              <IconButton
                id={'options-settings-icon'}
                variant="text"
                color="inherit"
                size="initial"
                className="text-white hover:bg-[#702963] h-full w-full"
              >
                <Icon name="icon-settings" />
              </IconButton>
            </Dropdown>
          </div>
        </div>
      </div>
    </NavBar>
  );
}

Header.propTypes = {
  menuOptions: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      icon: PropTypes.string,
      onClick: PropTypes.func.isRequired,
    })
  ),
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  isReturnEnabled: PropTypes.bool,
  isSticky: PropTypes.bool,
  onClickReturnButton: PropTypes.func,
  WhiteLabeling: PropTypes.object,
  showPatientInfo: PropTypes.string,
  servicesManager: PropTypes.object,
};

Header.defaultProps = {
  isReturnEnabled: true,
  isSticky: false,
};

export default Header;
