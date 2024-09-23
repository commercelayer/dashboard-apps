import { Section, Spacer, type AvatarProps } from '@commercelayer/app-elements'
import type { GiftCard } from '@commercelayer/sdk'
import type { FC } from 'react'

export const DetailsImage: FC<{ giftCard: GiftCard }> = ({ giftCard }) => {
  if (!isValidImageURL(giftCard.image_url)) return null

  return (
    <Section title='Image'>
      <Spacer top='6'>
        <img
          src={giftCard.image_url}
          alt='Gift card'
          style={{
            maxWidth: '100%',
            maxHeight: '200px'
          }}
        />
      </Spacer>
    </Section>
  )
}

function isValidImageURL(
  url: GiftCard['image_url']
): url is AvatarProps['src'] {
  if (url == null) {
    return false
  }
  return (
    url.startsWith('https://') ||
    url.startsWith('//') ||
    url.startsWith('data:image/')
  )
}
