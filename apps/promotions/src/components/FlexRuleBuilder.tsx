
import type { Promotion } from '#types'
import {
  Button,
  Card,
  Icon,
  ListItem,
  RuleEngine,
  Section,
  Spacer,
  Text,
  toast,
  useCoreSdkProvider,
  useOverlay
} from '@commercelayer/app-elements'
import type { FlexPromotion } from '@commercelayer/sdk'
import { useState } from 'react'

type PromotionRules = { rules: Array<{ id: string; name: string }> }

export function SectionFlexRules({
  promotion
}: {
  promotion: Extract<Promotion, FlexPromotion>
}): React.JSX.Element {
  const { Overlay, open, close } = useOverlay({ queryParam: 'rule-builder' })
  const [promotionRules, setPromotionRules] = useState<PromotionRules>(promotion.rules as PromotionRules)
  const { sdkClient } = useCoreSdkProvider()

  const hasRules = promotionRules.rules.length > 0

  const emptyList = (
    <ListItem
      alignIcon='center'
      icon={<Icon name='sliders' size={32} />}
      paddingSize='6'
      variant='boxed'
    >
      <Text>
        Define the application rules to target specific orders for the promotion.
      </Text>
      <Button
        alignItems='center'
        size='small'
        variant='secondary'
        onClick={() => {
          open()
        }}
      >
        <Icon name='plus' size={16} />
        Rule
      </Button>
    </ListItem>
  )

  return (
    <Section
      title='Apply when'
      border='none'
      actionButton={
        hasRules ? (
          <Button
            type='button'
            onClick={() => {
              open()
            }}
            variant='secondary'
            size='mini'
            alignItems='center'
          >
            <Icon name='pencilSimple' />
            Edit
          </Button>
        ) : null
      }
    >
      <Overlay fullWidth={true}>
        <header style={{ height: '64px' }} className='border-b border-gray-200 flex items-center justify-between px-6'>
          <div className='flex items-center gap-3'>
            <img src="https://data.commercelayer.app/assets/logos/glyph/black/commercelayer_glyph_black.svg" alt='Commerce Layer glyph in black' width={28} />
            <Text size='regular' weight='semibold'>Rules</Text>
          </div>
          <div className='flex items-center gap-6'>
            <a href='https://docs.commercelayer.io/rules-engine' target='_blank' style={{ height: '36px', alignContent: 'center' }} className='border-r px-4'>
              <Text size='small' variant='info' weight='semibold' className='flex items-center gap-1'>
                <Icon name='question' size={16} />
                Do you need help?
              </Text>
            </a>
            
            <Button
              variant='link'
              alignItems='center'
              onClick={() => {
                setPromotionRules(promotion.rules as PromotionRules)
                close()
              }}
            >
              <Icon name='arrowLeft' />
              <Text size='small' weight='semibold'>
                Back to promotion
              </Text>
            </Button>

            <Button
              size='small'
              onClick={async () => {
                  console.log('Saving rules', promotionRules)
                  await sdkClient.flex_promotions.update({
                    id: promotion.id,
                    rules: promotionRules
                  }).catch((error) => {
                    const title = error?.errors?.[0]?.title
                    toast(title ?? 'An error occurred', { type: 'error' })

                    throw error
                  })
                  close()
                }}
              >
              Save rules
            </Button>
          </div>
        </header>
        <div style={{ height: 'calc(100vh - 64px)' }} className='overflow-y-auto'>
          <RuleEngine defaultValue={JSON.stringify(promotionRules)} defaultCodeEditorVisible onChange={(rules) => {
            setPromotionRules(rules as PromotionRules)
          }} />
        </div>
      </Overlay>
      {
        hasRules ? (
          <Card backgroundColor='light' overflow='visible' gap='4'>
            {promotionRules.rules.map((item, index) => {
              const idx = `#${(index + 1).toString().padStart(2, '0')}`
              return (
                <Spacer key={item.id} top={index > 0 ? '2' : undefined}>
                  <Card overflow='visible' gap='4'>
                    <ListItem padding='none' borderStyle='none'>
                      <div>
                        <b className='pr-4'>{idx}</b> {item.name}
                      </div>
                    </ListItem>
                  </Card>
                </Spacer>
              )
            })}
          </Card>
        ) : emptyList
      }
    </Section>
  )
}