import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

const baseClasses =
  'text-center items-center justify-center transition duration-300 ease-in-out outline-none font-bold focus:outline-none';

const roundedClasses = {
  none: '',
  small: 'rounded',
  medium: 'rounded-md',
  large: 'rounded-lg',
  full: 'rounded-full',
};

const disabledClasses = {
  true: 'ohif-disabled',
  false: '',
};

const variantClasses = {
  text: {
    default:
      'text-white hover:bg-[#4d4c4d] hover:text-black active:opacity-80 focus:!bg-[#4d4c4d] focus:text-black',
    primary:
      'text-[#e4b4db] hover:bg-[#4d4c4d] hover:text-white active:opacity-80 focus:bg-[#4d4c4d] focus:text-white',
    secondary:
      'text-[#e4b4db] hover:bg-secondary-light hover:text-white active:opacity-80 focus:bg-secondary-light focus:text-white',
    white:
      'text-white hover:bg-white hover:text-black active:opacity-80 focus:bg-white focus:text-black',
    black:
      'text-black hover:bg-black hover:text-white focus:bg-black focus:text-white active:opacity-80',
  },
  outlined: {
    default:
      'border border-[#e4b4db] text-white hover:opacity-80 active:opacity-100 focus:opacity-80',
    primary:
      'border border-[#e4b4db] text-[#e4b4db] hover:opacity-80 active:opacity-100 focus:opacity-80',
    secondary:
      'border border-[#e4b4db] text-[#e4b4db] hover:opacity-80 active:opacity-100 focus:opacity-80',
    white: 'border border-white text-white hover:opacity-80 active:opacity-100 focus:opacity-80',
    black:
      'border border-[#e4b4db] text-white hover:bg-[#4d4c4d] focus:bg-[#4d4c4d] hover:border-black focus:border-black',
  },
  contained: {
    default: 'text-common-bright hover:opacity-80 active:opacity-100 focus:opacity-80',
    primary: 'text-white hover:opacity-80 active:opacity-100 focus:opacity-80',
    secondary: 'text-white hover:opacity-80 active:opacity-100 focus:opacity-80',
    white: 'text-black hover:opacity-80 active:opacity-100 focus:opacity-80',
    black: 'text-white hover:opacity-80 active:opacity-100 focus:opacity-80',
  },
};

const sizeClasses = {
  small: 'py-2 px-2 text-base',
  medium: 'py-3 px-3 text-lg',
  large: 'py-4 px-4 text-xl',
  initial: '',
  toolbar: 'text-lg',
};

const iconSizeClasses = {
  small: 'w-4 h-4',
  medium: 'w-5 h-5',
  large: 'w-6 h-6',
  toolbar: 'w-[28px] h-[28px]',
};

const fullWidthClasses = {
  true: 'flex w-full',
  false: 'inline-flex',
};

const IconButton = ({
  children,
  variant,
  color,
  size,
  rounded,
  disabled,
  type,
  fullWidth,
  onClick,
  className,
  id,
  ...rest
}) => {
  const buttonElement = useRef(null);

  const handleOnClick = e => {
    buttonElement.current.blur();
    onClick(e);
  };

  const padding = size === 'toolbar' ? '6px' : size === 'toolbox' ? '6px' : null;

  return (
    <button
      className={classnames(
        baseClasses,
        variantClasses[variant][color],
        roundedClasses[rounded],
        sizeClasses[size],
        fullWidthClasses[fullWidth],
        disabledClasses[disabled],
        className
      )}
      style={{
        padding,
      }}
      ref={buttonElement}
      onClick={handleOnClick}
      type={type}
      data-cy={rest['data-cy'] ?? id}
      data-tool={rest['data-tool']}
    >
      {React.cloneElement(children, {
        className: classnames(iconSizeClasses[size], 'fill-current'),
      })}
    </button>
  );
};

IconButton.defaultProps = {
  onClick: () => { },
  color: 'default',
  disabled: false,
  fullWidth: false,
  rounded: 'medium',
  size: 'medium',
  type: 'button',
  variant: 'contained',
};

IconButton.propTypes = {
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(['small', 'medium', 'large', 'initial', 'toolbar', 'toolbox']),
  rounded: PropTypes.oneOf(['none', 'small', 'medium', 'large', 'full']),
  variant: PropTypes.oneOf(['text', 'outlined', 'contained']),
  color: PropTypes.oneOf(['default', 'primary', 'secondary', 'white', 'black', 'inherit']),
  fullWidth: PropTypes.bool,
  disabled: PropTypes.bool,
  type: PropTypes.string,
  id: PropTypes.string,
  className: PropTypes.node,
  onClick: PropTypes.func,
};

export default IconButton;
