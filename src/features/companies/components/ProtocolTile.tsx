import type { ReactNode } from 'react'
import { FACTORY_META, protocolMeta } from '../protocols'

// Фирменный знак AnyDesk: две шеврон-стрелки, монохром в цвет плитки.
function AnyDeskMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={3.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="6,5 13,12 6,19" />
      <polyline points="12,5 19,12 12,19" />
    </svg>
  )
}

// Щит с замочной скважиной — как иконка VPN в Windows.
function VpnMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3l7 2.8v5.2c0 4.8-3.2 8.3-7 9.9-3.8-1.6-7-5.1-7-9.9V5.8L12 3z" />
      <circle cx="12" cy="10.5" r="1.7" fill="currentColor" stroke="none" />
      <path d="M12 12.2v2.8" />
    </svg>
  )
}

// OpenVPN: навесной замок — корпус, дужка и штрих-замочник.
function OpenVpnMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
      <path d="M12 14v2.5" />
    </svg>
  )
}

// Контур: ноутбук с терминальным приглашением «>_» (по иконке с сайта).
function KonturMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="4" y="4.5" width="16" height="11.5" rx="1.5" />
      <path d="M2.5 19.5h19" />
      <path d="M8 8.5l2.5 2.25L8 13" />
      <path d="M12.5 13H16" />
    </svg>
  )
}

// WireGuard: молния — «быстрый туннель».
function WireGuardMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  )
}

// RuDesktop: монитор со стрелкой подключения — удалённый доступ к столу.
function RuDesktopMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="12.5" rx="2" />
      <path d="M12 16.5V20" />
      <path d="M8.5 20h7" />
      <path d="M8 10.25h6.5" />
      <path d="M12.5 7.75L15 10.25l-2.5 2.5" />
    </svg>
  )
}

// VNC: монитор с курсором — протокол передаёт экран и мышь.
function VncMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="12.5" rx="2" />
      <path d="M12 16.5V20" />
      <path d="M8.5 20h7" />
      <path d="M10 7.5v6.8l1.9-1.7 1.1 2.5 1.6-.7-1.1-2.5h2.5z" fill="currentColor" stroke="none" />
    </svg>
  )
}

// RustDesk: шестерёнка — отсылка к Rust.
function RustDeskMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 5v2.2" />
      <path d="M12 16.8V19" />
      <path d="M5 12h2.2" />
      <path d="M16.8 12H19" />
      <path d="M7.05 7.05l1.56 1.56" />
      <path d="M15.39 15.39l1.56 1.56" />
      <path d="M16.95 7.05l-1.56 1.56" />
      <path d="M8.61 15.39l-1.56 1.56" />
    </svg>
  )
}

// Ammyy Admin: кейс-тулбокс — админский инструмент.
function AmmyyMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="4" y="9" width="16" height="10" rx="2" />
      <path d="M9 9V7.5a3 3 0 0 1 6 0V9" />
      <path d="M4 13h16" />
    </svg>
  )
}

// Свой тип: слайдеры-настройки.
function CustomMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 7h3" />
      <path d="M11 7h9" />
      <circle cx="9" cy="7" r="2" />
      <path d="M4 12h9" />
      <path d="M17 12h3" />
      <circle cx="15" cy="12" r="2" />
      <path d="M4 17h1" />
      <path d="M9 17h11" />
      <circle cx="7" cy="17" r="2" />
    </svg>
  )
}

// Запасной знак для неизвестных типов: штекер питания.
function PlugMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 3.5V8" />
      <path d="M15 3.5V8" />
      <path d="M7 8h10v3.5a5 5 0 0 1-10 0z" />
      <path d="M12 16.5v4" />
    </svg>
  )
}

// Возвращает знак типа; для неизвестных типов — запасной штекер.
function protocolMark(type: string): ReactNode {
  switch (type) {
    case 'anydesk':
      return <AnyDeskMark />
    case 'vpn':
      return <VpnMark />
    case 'openvpn':
      return <OpenVpnMark />
    case 'kontur':
      return <KonturMark />
    case 'wireguard':
      return <WireGuardMark />
    case 'rudesktop':
      return <RuDesktopMark />
    case 'vnc':
      return <VncMark />
    case 'rustdesk':
      return <RustDeskMark />
    case 'ammyy':
      return <AmmyyMark />
    case 'custom':
      return <CustomMark />
    case 'rdp':
      return null // RDP остаётся с эмодзи 🖥️
    default:
      return <PlugMark />
  }
}

// Плитка протокола: знак в цвет плитки; эмодзи остаются только
// для запасной плитки «без подключения» (🏭).
export default function ProtocolTile({ type }: { type: string | null }) {
  const meta = type ? protocolMeta(type) : FACTORY_META
  const mark = type ? protocolMark(type) : null
  return (
    <span className={`tile ${meta.bg}`} title={`Протокол: ${meta.label}`}>
      {mark ?? meta.emoji}
    </span>
  )
}