import React, { useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { InputBase, type InputBaseProps } from '@/components/ui/input';

export function Input(props: NumberInputProps): React.JSX.Element;
export function Input(props: TextInputProps): React.JSX.Element;
export function Input({ label, className, value, type, onChange, id: providedId, ...rest }: InputProps) {
  const generatedId = React.useId();
  const id = providedId ?? generatedId;
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!onChange) return;

      let parsedValue: number | string | undefined = e.target.value;
      if (type === 'number') {
        parsedValue = parsedValue === '' ? undefined : Number(parsedValue);
      }
      // Can't narrow the type, so have to cast here
      onChange(parsedValue as never, e);
    },
    [onChange, type],
  );

  return (
    <div className="w-full">
      {label && (
        <Label htmlFor={id} className="mb-2 block text-left font-bold">
          {label}
        </Label>
      )}
      <InputBase id={id} value={value ?? ''} className={className} type={type} onChange={handleChange} {...rest} />
    </div>
  );
}

type BaseProps = Omit<InputBaseProps, 'onChange' | 'type'> & {
  label?: React.ReactNode;
};

type NumberInputProps = BaseProps & {
  type: 'number';
  value?: number;
  onChange?: (value: number | undefined, event: React.ChangeEvent<HTMLInputElement>) => void;
};

type TextInputProps = BaseProps & {
  type?: Exclude<React.ComponentProps<typeof InputBase>['type'], NumberInputProps['type']>;
  value?: string;
  onChange?: (value: string, event: React.ChangeEvent<HTMLInputElement>) => void;
};

type InputProps = NumberInputProps | TextInputProps;
