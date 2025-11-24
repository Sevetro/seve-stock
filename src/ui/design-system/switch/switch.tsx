import { Switch as RadixSwitch } from 'radix-ui';
import clsx from 'clsx';

import {
  switchDisabled, switchLoading, switchRoot, switchThumb, switchThumbDisabled, switchThumbLoading
} from './switch.module.scss';

interface SwitchProps {
  checked: boolean
  onCheckedChange: (value: boolean) => void
  disabled?: boolean
  loading?: boolean
}

export const Switch = ({ checked, onCheckedChange, disabled, loading }: SwitchProps) => (
  <form>
    <RadixSwitch.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      className={clsx(switchRoot, disabled && switchDisabled, loading && switchLoading)}
      disabled={disabled}
    >
      <RadixSwitch.Thumb
        className={clsx(switchThumb, disabled && switchThumbDisabled, loading && switchThumbLoading)}
      />
    </RadixSwitch.Root>
  </form>
);