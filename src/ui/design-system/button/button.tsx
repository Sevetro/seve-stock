import type { PropsWithChildren } from 'react';

import { button } from './button.module.scss';

interface ButtonProps extends PropsWithChildren {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  size?: number
}

export const Button = ({ children, onClick }: ButtonProps) => (
  <button onClick={onClick} className={button}>
    {children}
  </button>
);