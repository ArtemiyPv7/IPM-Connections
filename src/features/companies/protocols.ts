// Единое описание протоколов: подпись, эмодзи и цвет плитки.
// Цвета — только из существующей палитры (blue/sky/green/red/amber/ink).
export interface ProtocolMeta {
  label: string
  emoji: string
  bg: string
}

// Запасная плитка: завод без подключений или неизвестный тип.
export const FACTORY_META: ProtocolMeta = {
  label: 'Без подключения',
  emoji: '🏭',
  bg: 'bg-ink/10 text-gray',
}

const PROTOCOLS: Record<string, ProtocolMeta> = {
  // AnyDesk рендерится фирменным знаком в ProtocolTile; эмодзи — запасной.
  anydesk: { label: 'AnyDesk', emoji: '🖥️', bg: 'bg-red/15 text-red' },
  // RDP — компьютер: так выглядит иконка удалённого рабочего стола в Windows.
  rdp: { label: 'RDP', emoji: '🖥️', bg: 'bg-blue/15 text-blue' },
  vpn: { label: 'VPN', emoji: '🔒', bg: 'bg-green/15 text-green' },
  openvpn: { label: 'OpenVPN', emoji: '🛡️', bg: 'bg-green/15 text-green' },
  wireguard: { label: 'WireGuard', emoji: '⚡', bg: 'bg-amber/15 text-amber' },
  vnc: { label: 'VNC', emoji: '🔗', bg: 'bg-sky/15 text-sky' },
  rudesktop: { label: 'RuDesktop', emoji: '🪆', bg: 'bg-red/15 text-red' },
  rustdesk: { label: 'RustDesk', emoji: '🦀', bg: 'bg-amber/15 text-amber' },
  ammyy: { label: 'Ammyy Admin', emoji: '🧰', bg: 'bg-sky/15 text-sky' },
  kontur: { label: 'Контур', emoji: '📄', bg: 'bg-ink/10 text-gray' },
  custom: { label: 'Свой тип', emoji: '🔧', bg: 'bg-ink/10 text-gray' },
}

export function protocolMeta(type: string): ProtocolMeta {
  return PROTOCOLS[type] ?? { label: type, emoji: '🔌', bg: 'bg-ink/10 text-gray' }
}