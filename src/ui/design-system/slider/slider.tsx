import { Slider as RadixSlider } from 'radix-ui';

import { sliderRange, sliderRoot, sliderThumb, sliderTrack } from './slider.module.scss';

interface SliderProps {
  value: number[]
  onValueChange: (value: number[]) => void
  max: number
  defaultValue: number[]
  aria?: string
}

export const Slider = ({ value, onValueChange, max, defaultValue, aria }: SliderProps) => (
  <form>
    <RadixSlider.Root
      value={value}
      onValueChange={onValueChange}
      className={sliderRoot}
      defaultValue={defaultValue}
      max={max}
      step={1}
    >
      <RadixSlider.Track className={sliderTrack}>
        <RadixSlider.Range className={sliderRange} />
      </RadixSlider.Track>

      <RadixSlider.Thumb className={sliderThumb} aria-label={aria} />
    </RadixSlider.Root>
  </form>
);