import Image from 'next/image'
import logo from '../../../public/apollo-logo.png'

export function ApolloLogo() {
  return <div style={{ background: '#fff', borderRadius: 12, padding: 20, width: '100%', maxWidth: 320, margin: '0 auto' }}>
    <Image src={logo} alt="Apollo Vidhyalayam" priority style={{ display: 'block', width: '100%', height: 'auto' }} />
  </div>
}
