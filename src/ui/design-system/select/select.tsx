import { Select as RadixSelect } from 'radix-ui';
import { ChevronDownIcon } from "@radix-ui/react-icons";

import { selectContent, selectItem, selectTrigger } from './select.module.scss';

interface SelectOption {
  value: string
  label: string
}

export type SelectOptions = SelectOption[]

interface SelectProps {
  placeholder?: string
  options: SelectOption[]
}

export const Select = ({ placeholder, options }: SelectProps) => (
  <RadixSelect.Root>
    <RadixSelect.Trigger className={selectTrigger}>
      <RadixSelect.Value placeholder={placeholder} />
      <RadixSelect.Icon>
        <ChevronDownIcon />
      </RadixSelect.Icon>
    </RadixSelect.Trigger>

    <RadixSelect.Portal>
      <RadixSelect.Content className={selectContent}>
        <RadixSelect.Viewport>
          {options.map(({ label, value }) => <SelectItem className={selectItem} key={value} value={value}>{label}</SelectItem>)}
        </RadixSelect.Viewport>
      </RadixSelect.Content>
    </RadixSelect.Portal>
  </RadixSelect.Root>
);

type SelectItemProps = React.ComponentPropsWithRef<typeof RadixSelect.Item>;

const SelectItem = ({ children, ...props }: SelectItemProps) => (
  <RadixSelect.Item
    {...props}
  >
    <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
  </RadixSelect.Item>
);