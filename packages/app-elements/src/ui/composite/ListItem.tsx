import { FlexRow, type FlexRowProps } from '#ui/internals/FlexRow'
import { removeUnwantedProps } from '#utils/htmltags'
import cn from 'classnames'
import { type FC } from 'react'

type ListItemVariant = 'list' | 'boxed'

export type ListItemProps = React.HTMLAttributes<HTMLElement> &
  Pick<FlexRowProps, 'alignItems' | 'children'> &
  Pick<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'onClick' | 'href'> & {
    /**
     * Icon component
     * Example: `<StatusIcon>` or `<RadialProgress>` or `<Avatar>`
     */
    icon?: JSX.Element
    /**
     * Icon alignment
     * @default 'top'
     */
    alignIcon?: 'top' | 'center' | 'bottom'
    /**
     * Control the horizontal padding (`x`) or vertical padding (`y`).
     * You can specify `none` to remove the padding.
     * @default 'xy'
     */
    padding?: 'xy' | 'x' | 'y' | 'none'
    /**
     * Control the padding size.
     * @default '4'
     */
    paddingSize?: '6' | '4' | '2'
    /**
     * Border style to render
     * @default 'solid'
     */
    borderStyle?: 'solid' | 'none'
    /**
     * ListItem variant: 'list' or 'boxed' with rounded borders
     * @default 'list'
     */
    variant?: ListItemVariant
    /**
     * Disabled effect
     * @default undefined
     */
    disabled?: boolean
  }

export const ListItem: FC<ListItemProps> = ({
  icon,
  children,
  className,
  padding = 'xy',
  paddingSize = '4',
  alignItems = 'center',
  alignIcon = 'top',
  borderStyle = 'solid',
  variant = 'list',
  disabled = false,
  ...rest
}) => {
  const wantedProps =
    'overflow' in rest ? removeUnwantedProps(rest, ['overflow']) : rest
  const JsxTag =
    rest.href != null ? 'a' : rest.onClick != null ? 'button' : 'div'
  const isClickable = !disabled && (rest.href != null || rest.onClick != null)

  const pySize = cn({
    'py-6': paddingSize === '6',
    'py-4': paddingSize === '4',
    'py-2': paddingSize === '2'
  })

  const pxSize = cn({
    'px-6': paddingSize === '6',
    'px-4': paddingSize === '4',
    'px-2': paddingSize === '2'
  })

  return (
    <JsxTag
      className={cn(
        'flex gap-4 w-full',
        'text-gray-800 hover:text-gray-800', // keep default text color also when used as `<a>` tag
        {
          [pySize]: padding !== 'none' && padding !== 'x',
          [pxSize]: padding !== 'none' && padding !== 'y',
          'border-b': borderStyle !== 'none',
          'rounded border': variant === 'boxed',
          'hover:bg-gray-50 focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-inset focus-visible:outline-none':
            isClickable,
          'bg-white': !disabled && variant === 'boxed',
          'bg-gray-100': disabled,
          'border-gray-200': variant === 'boxed' || disabled,
          'border-gray-100': variant === 'list',
          'text-left': wantedProps.onClick != null // to prevent standard behavior of `button` elements (with centered content)
        },
        className
      )}
      type={JsxTag === 'button' ? 'button' : undefined}
      {...wantedProps}
    >
      <div className={cn('flex gap-4 flex-1 items-center')}>
        {icon != null && (
          <div
            className={cn('flex-shrink-0', {
              // If icon is aligned to top we add a margin to simulate centered alignment
              // of icon with right content of most common case with one or two rows of text
              // like in case of ListItem Order
              'my-0.5': alignIcon === 'top',
              'self-center': alignIcon === 'center',
              'self-start': alignIcon === 'top',
              'self-end': alignIcon === 'bottom'
            })}
          >
            {icon}
          </div>
        )}
        <FlexRow alignItems={alignItems}>{children}</FlexRow>
      </div>
    </JsxTag>
  )
}

ListItem.displayName = 'ListItem'
