import type { Promotion } from '#types'
import {
  Button,
  Card,
  Hr,
  Icon,
  isMockedId,
  ListItem,
  RuleEngine,
  Section,
  Spacer,
  Text,
  toast,
  useCoreSdkProvider,
  useOverlay,
  useTokenProvider
} from '@commercelayer/app-elements'
import type { FlexPromotion } from '@commercelayer/sdk'
import { useEffect, useState } from 'react'

interface PromotionRules {
  rules: Array<{ id: string; name: string }>
}

export function SectionFlexRules({
  promotion,
  onChange
}: {
  promotion: Extract<Promotion, FlexPromotion>
  onChange?: (rules: PromotionRules) => void
}): React.JSX.Element {
  const isNewPromotion = isMockedId(promotion.id)
  const { Overlay, open, close } = useOverlay({ queryParam: 'rule-builder' })
  const [promotionRules, setPromotionRules] = useState<PromotionRules>(
    promotion.rules as PromotionRules
  )
  const [ruleIsSet, setRuleIsSet] = useState(!isNewPromotion)
  const { sdkClient } = useCoreSdkProvider()
  const {
    settings: { accessToken, organizationSlug, domain }
  } = useTokenProvider()

  const hasRulesToShow = promotionRules.rules.length > 0 && ruleIsSet

  useEffect(
    function handlePromotionRulesChange() {
      onChange?.(promotionRules)
    },
    [promotionRules]
  )

  const emptyList = (
    <ListItem
      alignIcon='center'
      icon={<Icon name='treeView' size={32} />}
      paddingSize='6'
      variant='boxed'
    >
      <Text>
        Start by selecting the actions to apply, then define the conditions that
        will trigger them.
      </Text>
      <Button
        type='button'
        alignItems='center'
        size='small'
        variant='secondary'
        onClick={() => {
          open()
        }}
      >
        <Icon name='plus' size={16} />
        Add rules
      </Button>
    </ListItem>
  )

  const ruleListCard = (
    <Card overflow='visible' gap='4'>
      {promotionRules.rules.map((item, index, arr) => {
        const idx = `#${(index + 1).toString().padStart(2, '0')}`
        return (
          <div key={item.id}>
            <div>
              <b className='pr-4'>{idx}</b> {item.name}
            </div>
            {index < arr.length - 1 ? (
              <Spacer top='4' bottom='4'>
                <Hr style={{ borderStyle: 'dashed' }} />
              </Spacer>
            ) : null}
          </div>
        )
      })}
    </Card>
  )

  const ruleList = hasRulesToShow ? (
    isNewPromotion ? (
      ruleListCard
    ) : (
      <Card backgroundColor='light' overflow='visible' gap='4'>
        {ruleListCard}
      </Card>
    )
  ) : (
    emptyList
  )

  return (
    <Section
      title='Rules'
      border='none'
      actionButton={
        hasRulesToShow ? (
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
      <Overlay fullWidth>
        <header
          style={{ height: '64px' }}
          className='border-b border-gray-200 flex items-center justify-between px-6'
        >
          <div className='flex items-center gap-3'>
            <img
              src='https://data.commercelayer.app/assets/logos/glyph/black/commercelayer_glyph_black.svg'
              alt='Commerce Layer glyph in black'
              width={28}
            />
            <Text size='regular' weight='semibold'>
              Rules
            </Text>
          </div>
          <div className='flex items-center gap-6'>
            <a
              href='https://docs.commercelayer.io/rules-engine'
              target='_blank'
              style={{ height: '36px', alignContent: 'center' }}
              className='border-r px-4'
              rel='noreferrer'
            >
              <Text
                size='small'
                variant='info'
                weight='semibold'
                className='flex items-center gap-1'
              >
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
              onClick={() => {
                if (isNewPromotion) {
                  void fetch(
                    `https://${organizationSlug}.${domain}/api/rules/check`,
                    {
                      method: 'POST',
                      headers: {
                        Accept: 'application/vnd.api+json',
                        'Content-Type': 'application/vnd.api+json',
                        Authorization: `Bearer ${accessToken}`
                      },
                      body: JSON.stringify({
                        rules: promotionRules.rules,
                        payload: [{}]
                      })
                    }
                  )
                    .then(async (res) => await res.json())
                    .then((json) => {
                      if ('errors' in json && json.errors.length > 0) {
                        const detail: string | undefined =
                          json?.errors?.[0]?.detail
                        toast(detail ?? 'An error occurred', { type: 'error' })
                        return json
                      }

                      setRuleIsSet(true)
                      close()
                    })
                    .catch((error) => {
                      const title: string | undefined =
                        error?.errors?.[0]?.title
                      toast(title ?? 'An error occurred', { type: 'error' })

                      throw error
                    })
                } else {
                  void sdkClient.flex_promotions
                    .update({
                      id: promotion.id,
                      rules: promotionRules
                    })
                    .then((_promotion) => {
                      // setPromotionRules(promotion.rules as PromotionRules)
                      setRuleIsSet(true)
                      close()
                    })
                    .catch((error) => {
                      const title: string | undefined =
                        error?.errors?.[0]?.title
                      toast(title ?? 'An error occurred', { type: 'error' })

                      throw error
                    })
                }
              }}
            >
              Save rules
            </Button>
          </div>
        </header>
        <div
          style={{ height: 'calc(100vh - 64px)' }}
          className='overflow-y-auto'
        >
          <RuleEngine
            schemaType='order-rules'
            defaultValue={JSON.stringify(promotionRules)}
            defaultCodeEditorVisible
            onChange={(rules) => {
              setPromotionRules(rules as PromotionRules)
            }}
          />
        </div>
      </Overlay>
      {ruleList}
    </Section>
  )
}
