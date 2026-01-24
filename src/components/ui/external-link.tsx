import { cva, type VariantProps } from 'class-variance-authority';

const linkVariants = cva('', {
  variants: {
    color: {
      blue: 'text-blue-600 hover:text-blue-700',
      lightBlue: 'text-blue-400 hover:text-blue-500',
    },
  },
});

export function ExternalLink({
  className,
  blank = true,
  color = blank ? 'blue' : undefined,
  href,
  ...rest
}: ExternalLinkProps) {
  return (
    <a
      href={href}
      className={linkVariants({ color, className })}
      {...(blank ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...rest}
    />
  );
}

type BaseLinkProps = Omit<React.ComponentProps<'a'>, 'color'>;

export interface ExternalLinkProps extends BaseLinkProps, VariantProps<typeof linkVariants> {
  href: string;
  blank?: boolean;
}
