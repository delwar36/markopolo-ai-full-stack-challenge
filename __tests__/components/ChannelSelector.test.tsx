import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import ChannelSelector from '@/components/selectors/ChannelSelector'
import { Channel } from '@/types'

describe('ChannelSelector Component', () => {
  const mockOnSelect = jest.fn()
  const mockSelectedChannels: Channel[] = []

  beforeEach(() => {
    mockOnSelect.mockClear()
  })

  it('renders all available channels', () => {
    render(
      <ChannelSelector
        onSelect={mockOnSelect}
        selectedChannels={mockSelectedChannels}
      />
    )

    expect(screen.getByText('Channels')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('SMS')).toBeInTheDocument()
    expect(screen.getByText('Push Notifications')).toBeInTheDocument()
    expect(screen.getByText('WhatsApp')).toBeInTheDocument()
  })

  it('shows channel descriptions', () => {
    render(
      <ChannelSelector
        onSelect={mockOnSelect}
        selectedChannels={mockSelectedChannels}
      />
    )

    expect(screen.getByText('Send targeted email campaigns')).toBeInTheDocument()
    expect(screen.getByText('Send text message notifications')).toBeInTheDocument()
    expect(screen.getByText('Send mobile and web push notifications')).toBeInTheDocument()
    expect(screen.getByText('Send WhatsApp business messages')).toBeInTheDocument()
  })

  it('shows channel icons', () => {
    render(
      <ChannelSelector
        onSelect={mockOnSelect}
        selectedChannels={mockSelectedChannels}
      />
    )

    expect(screen.getByText('📧')).toBeInTheDocument()
    expect(screen.getByText('📱')).toBeInTheDocument()
    expect(screen.getByText('🔔')).toBeInTheDocument()
    expect(screen.getByText('💬')).toBeInTheDocument()
  })

  it('shows "Not Selected" status for unselected channels', () => {
    render(
      <ChannelSelector
        onSelect={mockOnSelect}
        selectedChannels={mockSelectedChannels}
      />
    )

    const notSelectedElements = screen.getAllByText('Not Selected')
    expect(notSelectedElements).toHaveLength(4)
  })

  it('shows "Selected" status for selected channels', () => {
    const selectedChannels: Channel[] = [
      { id: 'email', name: 'Email', description: 'Send targeted email campaigns', icon: '📧', enabled: true }
    ]

    render(
      <ChannelSelector
        onSelect={mockOnSelect}
        selectedChannels={selectedChannels}
      />
    )

    expect(screen.getByText('Selected')).toBeInTheDocument()
  })

  it('opens configuration modal when clicking unselected channel', () => {
    render(
      <ChannelSelector
        onSelect={mockOnSelect}
        selectedChannels={mockSelectedChannels}
      />
    )

    const emailChannel = screen.getByText('Email').closest('div')
    fireEvent.click(emailChannel!)

    expect(screen.getByTestId('channel-config-modal')).toBeInTheDocument()
    expect(screen.getByText('Configure Email')).toBeInTheDocument()
  })

  it('calls onSelect when confirming channel configuration', () => {
    render(
      <ChannelSelector
        onSelect={mockOnSelect}
        selectedChannels={mockSelectedChannels}
      />
    )

    // Open modal
    const emailChannel = screen.getByText('Email').closest('div')
    fireEvent.click(emailChannel!)

    // Confirm configuration
    const confirmButton = screen.getByTestId('confirm-config')
    fireEvent.click(confirmButton)

    expect(mockOnSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'email', name: 'Email' }),
      { frequency: 'daily' }
    )
  })

  it('closes modal when close button is clicked', () => {
    render(
      <ChannelSelector
        onSelect={mockOnSelect}
        selectedChannels={mockSelectedChannels}
      />
    )

    // Open modal
    const emailChannel = screen.getByText('Email').closest('div')
    fireEvent.click(emailChannel!)

    expect(screen.getByTestId('channel-config-modal')).toBeInTheDocument()

    // Close modal
    const closeButton = screen.getByTestId('close-modal')
    fireEvent.click(closeButton)

    expect(screen.queryByTestId('channel-config-modal')).not.toBeInTheDocument()
  })

  it('calls onSelect directly when clicking already selected channel', () => {
    const selectedChannels: Channel[] = [
      { id: 'email', name: 'Email', description: 'Send targeted email campaigns', icon: '📧', enabled: true }
    ]

    render(
      <ChannelSelector
        onSelect={mockOnSelect}
        selectedChannels={selectedChannels}
      />
    )

    const emailChannel = screen.getByText('Email').closest('div')
    fireEvent.click(emailChannel!)

    expect(mockOnSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'email', name: 'Email' })
    )
    expect(screen.queryByTestId('channel-config-modal')).not.toBeInTheDocument()
  })
})
