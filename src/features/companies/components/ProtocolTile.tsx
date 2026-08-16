import { ProtocolMark } from './protocol-icons'
import { FACTORY_META, protocolMeta } from '../protocols'

export default function ProtocolTile({ type }: { type: string | null }) {
  const meta = type ? protocolMeta(type) : FACTORY_META
  return (
    <span className={`tile ${meta.bg}`} title={`Протокол: ${meta.label}`}>
      {type ? <ProtocolMark type={type} /> : meta.emoji}
    </span>
  )
}