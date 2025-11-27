import { Toast as RadixToast } from 'radix-ui';

import {
  toastClose, toastDescription, toastRoot, toastTitle
} from './toast.module.scss';
import { XIcon } from '../icons/x-icon';

interface ToastProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
}

export const Toast = ({ open, onOpenChange, title, description }: ToastProps) =>
(
  <RadixToast.Root
    open={open}
    onOpenChange={onOpenChange}
    className={toastRoot}
  >
    <RadixToast.Title className={toastTitle}>{title}</RadixToast.Title>

    <RadixToast.Description className={toastDescription}>
      {description}
    </RadixToast.Description>

    <RadixToast.Close
      className={toastClose}
      aria-label="Close"
    >
      <XIcon />
    </RadixToast.Close>
  </RadixToast.Root>
);