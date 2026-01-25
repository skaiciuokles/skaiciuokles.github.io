import React from 'react';
import { Label } from '@/components/ui/label';
import { SelectBase, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../ui/select';

export function Select<Value extends ValueType>({
  value,
  placeholder,
  options,
  className,
  label,
  onChange,
  id: providedId,
  ...rest
}: SelectProps<Value>) {
  const generatedId = React.useId();
  const id = providedId ?? generatedId;
  const optionMap = React.useMemo(() => new Map(options.map(option => [option.value.toString(), option])), [options]);
  const handleChange = React.useCallback(
    (value: string) => {
      const option = optionMap.get(value);
      if (option) {
        onChange?.(option.value, option);
      }
    },
    [onChange, optionMap],
  );
  return (
    <SelectBase value={value?.toString()} onValueChange={onChange ? handleChange : undefined} {...rest}>
      <div className="text-sm space-y-2">
        {label && <Label htmlFor={id}>{label}</Label>}
        <SelectTrigger className={className} id={id}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map(option => (
            <SelectItem key={option.value.toString()} value={option.value.toString()}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </div>
    </SelectBase>
  );
}

export interface SelectOption<Value extends ValueType> {
  label: string;
  value: Value;
}

type ValueType = string | number | boolean;

interface SelectProps<Value extends ValueType> extends Omit<
  React.ComponentProps<typeof SelectBase>,
  'value' | 'onValueChange'
> {
  id?: string;
  className?: string;
  placeholder?: string;
  options: SelectOption<Value>[];
  label?: React.ReactNode;
  onChange?: (value: Value, option: SelectOption<Value>) => void;
  value?: Value;
}
