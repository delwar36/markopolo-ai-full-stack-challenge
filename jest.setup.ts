import '@testing-library/jest-dom'

// --- Mock Next.js Router (App Router) ---
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}))

// --- Mock Next.js Image component ---
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    const React = require('react')
    return React.createElement('img', { ...props, alt: props.alt || '' })
  },
}))

// --- Mock window.matchMedia ---
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// --- Mock IntersectionObserver ---
class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.IntersectionObserver = MockIntersectionObserver as any

// --- Mock ResizeObserver ---
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = MockResizeObserver as any

// --- Mock crypto.randomUUID ---
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn(() => 'test-uuid-123'),
  },
})

// --- Mock Fetch API Request/Response ---
global.Request = jest.fn().mockImplementation((url: string, init?: RequestInit) => ({
  url,
  method: init?.method || 'GET',
  headers: new Map(Object.entries(init?.headers || {})),
  json: jest.fn().mockResolvedValue(
    init?.body ? JSON.parse(init.body as string) : {}
  ),
})) as any

global.Response = jest.fn().mockImplementation((body?: string, init?: ResponseInit) => ({
  status: init?.status || 200,
  statusText: init?.statusText || 'OK',
  headers: new Map(Object.entries(init?.headers || {})),
  json: jest.fn().mockResolvedValue(body ? JSON.parse(body) : {}),
  text: jest.fn().mockResolvedValue(body || ''),
})) as any

// Add static Response.json() for convenience
;(global.Response as any).json = jest.fn().mockImplementation(
  (data: any, init?: ResponseInit) => ({
    status: init?.status || 200,
    statusText: init?.statusText || 'OK',
    headers: new Map(Object.entries(init?.headers || {})),
    json: jest.fn().mockResolvedValue(data),
    text: jest.fn().mockResolvedValue(JSON.stringify(data)),
  })
)

// --- Mock NextResponse ---
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((data: any, init?: ResponseInit) => ({
      status: init?.status || 200,
      statusText: init?.statusText || 'OK',
      headers: new Map(Object.entries(init?.headers || {})),
      json: jest.fn().mockResolvedValue(data),
      text: jest.fn().mockResolvedValue(JSON.stringify(data)),
    })),
  },
  NextRequest: jest.fn().mockImplementation((url: string, init?: RequestInit) => ({
    url,
    method: init?.method || 'GET',
    headers: new Map(Object.entries(init?.headers || {})),
    json: jest.fn().mockResolvedValue(
      init?.body ? JSON.parse(init.body as string) : {}
    ),
    text: jest.fn().mockResolvedValue(init?.body || ''),
  })),
}))

// --- Mock app-specific components (avoid import errors in tests) ---
jest.mock('@/components/forms/DataSourceConfigModal', () => {
  return function MockDataSourceConfigModal({
    isOpen,
    onClose,
    dataSource,
    onConnect,
  }: any) {
    const React = require('react')
    
    return isOpen ? React.createElement('div', { 'data-testid': 'datasource-config-modal' },
      React.createElement('div', null, `Configure ${dataSource?.name}`),
      React.createElement('button', {
        onClick: () => onConnect(dataSource, { apiKey: 'test-key' }),
        'data-testid': 'confirm-config'
      }, 'Connect'),
      React.createElement('button', {
        onClick: onClose,
        'data-testid': 'close-modal'
      }, 'Close')
    ) : null
  }
})

jest.mock('@/components/forms/ChannelConfigModal', () => {
  return function MockChannelConfigModal({
    isOpen,
    onClose,
    channel,
    onSelect,
  }: any) {
    const React = require('react')
    
    return isOpen ? React.createElement('div', { 'data-testid': 'channel-config-modal' },
      React.createElement('div', null, `Configure ${channel?.name}`),
      React.createElement('button', {
        onClick: () => onSelect(channel, { frequency: 'daily' }),
        'data-testid': 'confirm-config'
      }, 'Confirm'),
      React.createElement('button', {
        onClick: onClose,
        'data-testid': 'close-modal'
      }, 'Close')
    ) : null
  }
})
