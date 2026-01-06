import { SelectBase, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../ui/select';

export function Select({ placeholder, options, className, ...rest }: SelectProps) {
  return (
    <SelectBase {...rest}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map(option => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectBase>
  );
}

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps extends React.ComponentProps<typeof SelectBase> {
  className?: string;
  placeholder?: string;
  options: SelectOption[];
}
