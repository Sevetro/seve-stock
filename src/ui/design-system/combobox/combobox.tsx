import {
  Combobox as AriaCombobox,
  ComboboxItem as AriaComboboxItem,
  ComboboxList as AriaComboboxList,
  ComboboxProvider as AriaComboboxProvider
} from '@ariakit/react';
import { Select as RadixSelect } from 'radix-ui';
import { matchSorter } from 'match-sorter';
import { startTransition, useState } from 'react';
import { CheckIcon, ChevronDownIcon, LoopIcon } from '@radix-ui/react-icons';

interface ComboboxOption {
  value: string;
  label: string
}

type ComboboxOptions = ComboboxOption[]

interface ComboboxProps {
  placeholder?: string
  options: ComboboxOptions
  value: string
  setValue: React.Dispatch<React.SetStateAction<string>>
  searchPlaceholder?: string
}

export const Combobox = ({ placeholder, options, value, setValue, searchPlaceholder }: ComboboxProps) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const matches = () => {
    if (!searchValue) return options;
    const keys = ['label', 'value'];
    const matches = matchSorter(options, searchValue, { keys });

    const selectedOption = options.find(option => option.value === value);
    if (selectedOption && !matches.includes(selectedOption)) {
      matches.push(selectedOption);
    }
    return matches;
  };

  return (
    <RadixSelect.Root
      value={value}
      onValueChange={setValue}
      open={open}
      onOpenChange={setOpen}
    >
      <AriaComboboxProvider
        open={open}
        setOpen={setOpen}
        resetValueOnHide
        includesBaseElement={false}
        setValue={(value) => {
          startTransition(() => {
            setSearchValue(value);
          });
        }}
      >
        <RadixSelect.Trigger aria-label="Language" className="select">
          <RadixSelect.Value placeholder={placeholder} />
          <RadixSelect.Icon className="select-icon">
            <ChevronDownIcon />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>

        <RadixSelect.Content
          role="dialog"
          aria-label="Languages"
          position="popper"
          className="popover"
          sideOffset={4}
          alignOffset={-16}
        >
          <div className="combobox-wrapper">
            <div className="combobox-icon">
              <LoopIcon />
            </div>
            <AriaCombobox
              autoSelect
              placeholder={searchPlaceholder}
              className="combobox"
              onBlurCapture={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
            />
          </div>

          <AriaComboboxList className="listbox">
            {matches().map(({ label, value }) => (
              <RadixSelect.Item
                key={value}
                value={value}
                asChild
                className="item"
              >
                <AriaComboboxItem>
                  <RadixSelect.ItemText>{label}</RadixSelect.ItemText>
                  <RadixSelect.ItemIndicator className="item-indicator">
                    <CheckIcon />
                  </RadixSelect.ItemIndicator>
                </AriaComboboxItem>
              </RadixSelect.Item>
            ))}
          </AriaComboboxList>
        </RadixSelect.Content>
      </AriaComboboxProvider>
    </RadixSelect.Root>
  );
};