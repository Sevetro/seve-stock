import type { ComponentPropsWithoutRef } from 'react';

import { button } from './button.module.scss';

type ButtonProps = ComponentPropsWithoutRef<'button'>;

export const Button = ({
  children,
  type = 'button',
  ...props
}: ButtonProps) => (
  <button
    {...props}
    className={button}
    type={type}
  >
    {children}
  </button>
);