import {
  memo, startTransition, useEffect, useRef, useState
} from 'react';
import {
  Combobox as AriaCombobox,
  ComboboxItem as AriaComboboxItem,
  ComboboxList as AriaComboboxList,
  ComboboxProvider as AriaComboboxProvider
} from '@ariakit/react';
import { Select as RadixSelect } from 'radix-ui';
import { matchSorter } from 'match-sorter';
import { CheckIcon, ChevronDownIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons';

import {
  combobox, comboboxIcon, comboboxWrapper, emptyOptions, item, itemIndicator, listbox, popover, trigger,
  triggerIcon, triggerOpen
} from './combobox.module.scss';

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
  width?: number;
  triggerAria?: string
  contentAria?: string
}

export const Combobox = memo(({
  placeholder, options, value, setValue, width,
  searchPlaceholder, triggerAria, contentAria
}: ComboboxProps) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        const list = listRef.current;
        if (!list) return;

        const active = list.querySelector('[data-highlighted]');
        if (active instanceof HTMLElement) {
          active.scrollIntoView({ block: 'center', behavior: 'auto' });
        }
      });
    }
  }, [open]);

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
        <RadixSelect.Trigger
          className={`${trigger} ${open ? triggerOpen : ''} ${options.length === 0 ? emptyOptions : ''}`}
          style={{ width: width ?? 'auto' }}
          aria-label={triggerAria}
        >
          <RadixSelect.Value placeholder={placeholder} />
          <RadixSelect.Icon className={triggerIcon}>
            <ChevronDownIcon />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>

        <RadixSelect.Content
          role="dialog"
          aria-label={contentAria}
          position="popper"
          className={popover}
          sideOffset={4}
        >
          <div className={comboboxWrapper}>
            <div className={comboboxIcon}>
              <MagnifyingGlassIcon />
            </div>
            <AriaCombobox
              autoSelect
              placeholder={searchPlaceholder}
              className={combobox}
              onBlurCapture={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
            />
          </div>

          <AriaComboboxList className={listbox} ref={listRef}>
            {matches().map(({ label, value }) => (
              <RadixSelect.Item
                key={value}
                value={value}
                asChild
                className={item}
              >
                <AriaComboboxItem>
                  <RadixSelect.ItemIndicator className={itemIndicator}>
                    <CheckIcon />
                  </RadixSelect.ItemIndicator>
                  <RadixSelect.ItemText>{label}</RadixSelect.ItemText>
                </AriaComboboxItem>
              </RadixSelect.Item>
            ))}
          </AriaComboboxList>
        </RadixSelect.Content>
      </AriaComboboxProvider>
    </RadixSelect.Root>
  );
});