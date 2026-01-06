import { cn } from '@/lib/utils';
import type { SimpleIcon as SimpleIconType } from 'simple-icons';

export function SimpleIcon({ icon, ...rest }: SimpleIconProps) {
  return (
    <svg className={cn('size-4', rest.className)} viewBox="0 0 24 24" fill={icon.hex} {...rest}>
      <title>{icon.title}</title>
      <path d={icon.path} />
    </svg>
  );
}

interface SimpleIconProps extends React.SVGProps<SVGSVGElement> {
  icon: SimpleIconType;
}
