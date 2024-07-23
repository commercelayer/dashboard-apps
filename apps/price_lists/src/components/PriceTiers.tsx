import { appRoutes } from '#data/routes'
import { makePrice } from '#mocks'
import type { PriceTierType } from '#types'
import { getPriceTierSdkResource } from '#utils/priceTiers'
import {
  Button,
  Icon,
  ListItem,
  Section,
  Table,
  Text,
  Th,
  Tr,
  type IconProps
} from '@commercelayer/app-elements'
import type { Price } from '@commercelayer/sdk'
import type { FC } from 'react'
import type { KeyedMutator } from 'swr'
import { Link, useLocation, useRoute } from 'wouter'
import { TableItemPriceTier } from './TableItemPriceTier'

interface PriceTierConfigItem {
  buttonCardCtaPathName: 'priceFrequencyTierNew' | 'priceVolumeTierNew'
  buttonCardText: string
  buttonCardIcon: IconProps['name']
}

type PriceTierConfig = Record<PriceTierType, PriceTierConfigItem>

const priceTiersConfig: PriceTierConfig = {
  frequency: {
    buttonCardCtaPathName: 'priceFrequencyTierNew',
    buttonCardText:
      'Establish variable pricing for specific intervals based on the frequency of purchase.',
    buttonCardIcon: 'calendarBlank'
  },
  volume: {
    buttonCardCtaPathName: 'priceVolumeTierNew',
    buttonCardText:
      'Enable flexible price adjustments based on the quantities purchased.',
    buttonCardIcon: 'stack'
  }
}

interface Props {
  price: Price
  mutatePrice: KeyedMutator<Price>
  type: PriceTierType
}

export const PriceTiers: FC<Props> = ({
  price = makePrice(),
  mutatePrice,
  type
}) => {
  const [, setLocation] = useLocation()
  const [, params] = useRoute<{ priceListId: string; priceId: string }>(
    appRoutes.priceDetails.path
  )
  const priceListId = params?.priceListId ?? ''
  const tierLabel = `${type.charAt(0).toUpperCase()}${type.slice(1)}`
  const sectionTitle = `${tierLabel} pricing`
  const sdkResource = getPriceTierSdkResource(type)
  const priceTiers = price[sdkResource]
  const buttonCardCtaPathName = priceTiersConfig[type].buttonCardCtaPathName

  return (
    <Section
      title={sectionTitle}
      border='none'
      actionButton={
        priceTiers != null &&
        priceTiers.length > 0 && (
          <Link
            href={appRoutes[buttonCardCtaPathName].makePath({
              priceListId,
              priceId: price.id
            })}
            asChild
          >
            <Button
              variant='secondary'
              size='mini'
              alignItems='center'
              aria-label='Add tier'
            >
              <Icon name='plus' />
              Tier
            </Button>
          </Link>
        )
      }
    >
      {price[sdkResource] == null || price[sdkResource]?.length === 0 ? (
        <ListItem
          variant='boxed'
          paddingSize='6'
          alignIcon='center'
          icon={<Icon name={priceTiersConfig[type].buttonCardIcon} size={32} />}
        >
          <Text>{priceTiersConfig[type].buttonCardText}</Text>
          <Button
            alignItems='center'
            variant='secondary'
            size='small'
            onClick={() => {
              setLocation(
                appRoutes[buttonCardCtaPathName].makePath({
                  priceListId,
                  priceId: price.id
                })
              )
            }}
          >
            <Icon name='plus' size={16} />
            {tierLabel} tier
          </Button>
        </ListItem>
      ) : (
        <Table
          thead={
            <Tr>
              <Th>Name</Th>
              <Th>Up to</Th>
              <Th>Price</Th>
              <Th> </Th>
            </Tr>
          }
          tbody={
            <>
              {priceTiers?.map((tier) => (
                <TableItemPriceTier
                  key={tier.id}
                  resource={tier}
                  type={type}
                  mutatePrice={mutatePrice}
                />
              ))}
            </>
          }
        />
      )}
    </Section>
  )
}
