import { Select as RadixSelect } from 'radix-ui';
import { CheckIcon, ChevronDownIcon } from '@radix-ui/react-icons';

import {
  selectContent, selectIcon, selectItem, selectItemIndicator, trigger, triggerOpen, selectViewport
} from './select.module.scss';
import { useState } from 'react';

interface SelectOption {
  value: string
  label: string
}

export type SelectOptions = SelectOption[]

interface SelectProps {
  placeholder?: string
  value: string
  setValue: React.Dispatch<React.SetStateAction<string>>
  options: SelectOption[]
  width?: number
  triggerAria?: string
}

export const Select = ({ placeholder, value, setValue, options, width, triggerAria }: SelectProps) => {
  const [open, setOpen] = useState(false);
  return (
    <RadixSelect.Root open={open} onOpenChange={setOpen} value={value} onValueChange={setValue}>
      <RadixSelect.Trigger className={`${trigger} ${open ? triggerOpen : ''}`} style={{ width: width ?? 'auto' }} aria-label={triggerAria}>
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon className={selectIcon}>
          <ChevronDownIcon />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>

      <RadixSelect.Portal>
        <RadixSelect.Content className={selectContent} position='popper' align='center' sideOffset={5}>
          <RadixSelect.Viewport className={selectViewport}>
            {options.map(({ label, value }) =>
              <SelectItem className={selectItem} key={value} value={value}>{label}</SelectItem>
            )}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
};

type SelectItemProps = React.ComponentPropsWithRef<typeof RadixSelect.Item>;

const SelectItem = ({ children, ...props }: SelectItemProps) => (
  <RadixSelect.Item
    {...props}
  >
    <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
    <RadixSelect.ItemIndicator className={selectItemIndicator}>
      <CheckIcon />
    </RadixSelect.ItemIndicator>
  </RadixSelect.Item>
);