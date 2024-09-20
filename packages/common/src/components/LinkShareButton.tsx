import {
  Button,
  Dropdown,
  DropdownItem,
  Icon
} from '@commercelayer/app-elements'

interface Props {
  email?: {
    to?: string | null
    subject: string
    body: string
  }
  whatsapp?: {
    number?: string | null
    text: string
  }
}

export const LinkShareButton = ({ email, whatsapp }: Props): JSX.Element => {
  return (
    <Dropdown
      dropdownLabel={
        <Button variant='primary' size='small' alignItems='center'>
          <Icon name='shareFat' size={16} />
          Share
        </Button>
      }
      dropdownItems={
        <>
          {email != null ? (
            <DropdownItem
              icon='envelopeSimple'
              label='Email'
              href={encodeURI(
                `mailto:${email.to ?? ''}?subject=${email.subject}&body=${email.body}`
              )}
            />
          ) : null}
          {whatsapp != null ? (
            <DropdownItem
              icon='whatsappLogo'
              label='Whatsapp'
              target='_blank'
              href={encodeURI(
                `https://api.whatsapp.com/send?phone=${whatsapp.number ?? ''}&text=${whatsapp.text}`
              )}
            />
          ) : null}
        </>
      }
    />
  )
}
