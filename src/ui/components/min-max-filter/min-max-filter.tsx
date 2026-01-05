import type { ComponentPropsWithoutRef } from 'react';

interface MinMaxFilterProps {
  label: string
  valueMin: number | undefined
  valueMax: number | undefined
  setValueMin: (value: number | undefined) => void
  setValueMax: (value: number | undefined) => void
  fieldsetClassName?: ComponentPropsWithoutRef<'fieldset'>['className'];
  legendClassName?: ComponentPropsWithoutRef<'legend'>['className'];
  labelClassName?: ComponentPropsWithoutRef<'label'>['className'];
  inputClassName?: ComponentPropsWithoutRef<'input'>['className'];
}

export const MinMaxFilter = ({
  label,
  valueMin,
  setValueMin,
  valueMax,
  setValueMax,
  fieldsetClassName,
  legendClassName,
  labelClassName,
  inputClassName
}: MinMaxFilterProps) => {
  return (
    <fieldset className={fieldsetClassName}>
      <legend className={legendClassName}>{label}</legend>

      <div>
        <label className={labelClassName}>
          <span>Min:</span>
          <input
            className={inputClassName}
            type="number"
            value={valueMin ?? ''}
            onChange={e => {
              const v = e.target.value;
              setValueMin(v === '' ? undefined : Number(v));
            }}
          />
        </label>

        <label className={labelClassName}>
          <span>Max:</span>
          <input
            className={inputClassName}
            type="number"
            value={valueMax ?? ''}
            onChange={e => {
              const v = e.target.value;
              setValueMax(v === '' ? undefined : Number(v));
            }}
          />
        </label>
      </div>
    </fieldset>
  );
};