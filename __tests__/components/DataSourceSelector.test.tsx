import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import DataSourceSelector from '@/components/selectors/DataSourceSelector'
import { DataSource } from '@/types'

describe('DataSourceSelector Component', () => {
  const mockOnConnect = jest.fn()
  const mockConnectedSources: DataSource[] = []

  beforeEach(() => {
    mockOnConnect.mockClear()
  })

  it('renders all available data sources', () => {
    render(
      <DataSourceSelector
        onConnect={mockOnConnect}
        connectedSources={mockConnectedSources}
      />
    )

    expect(screen.getByText('Data Sources')).toBeInTheDocument()
    expect(screen.getByText('Google Tag Manager')).toBeInTheDocument()
    expect(screen.getByText('Facebook Pixel')).toBeInTheDocument()
    expect(screen.getByText('Google Ads Tag')).toBeInTheDocument()
  })

  it('shows data source descriptions', () => {
    render(
      <DataSourceSelector
        onConnect={mockOnConnect}
        connectedSources={mockConnectedSources}
      />
    )

    expect(screen.getByText('Track website interactions and user behavior')).toBeInTheDocument()
    expect(screen.getByText('Track conversions and optimize ad delivery')).toBeInTheDocument()
    expect(screen.getByText('Track Google Ads performance and conversions')).toBeInTheDocument()
  })

  it('shows data source icons', () => {
    render(
      <DataSourceSelector
        onConnect={mockOnConnect}
        connectedSources={mockConnectedSources}
      />
    )

    expect(screen.getByText('🏷️')).toBeInTheDocument()
    expect(screen.getByText('📘')).toBeInTheDocument()
    expect(screen.getByText('🎯')).toBeInTheDocument()
  })

  it('shows "Not Connected" status for unconnected sources', () => {
    render(
      <DataSourceSelector
        onConnect={mockOnConnect}
        connectedSources={mockConnectedSources}
      />
    )

    const notConnectedElements = screen.getAllByText('Not Connected')
    expect(notConnectedElements).toHaveLength(3)
  })

  it('shows "Connected" status for connected sources', () => {
    const connectedSources: DataSource[] = [
      { id: 'gtm', name: 'Google Tag Manager', description: 'Track website interactions and user behavior', icon: '🏷️', connected: true }
    ]

    render(
      <DataSourceSelector
        onConnect={mockOnConnect}
        connectedSources={connectedSources}
      />
    )

    expect(screen.getByText('Connected')).toBeInTheDocument()
  })

  it('opens configuration modal when clicking unconnected data source', () => {
    render(
      <DataSourceSelector
        onConnect={mockOnConnect}
        connectedSources={mockConnectedSources}
      />
    )

    const gtmSource = screen.getByText('Google Tag Manager').closest('div')
    fireEvent.click(gtmSource!)

    expect(screen.getByTestId('datasource-config-modal')).toBeInTheDocument()
    expect(screen.getByText('Configure Google Tag Manager')).toBeInTheDocument()
  })

  it('calls onConnect when confirming data source configuration', () => {
    render(
      <DataSourceSelector
        onConnect={mockOnConnect}
        connectedSources={mockConnectedSources}
      />
    )

    // Open modal
    const gtmSource = screen.getByText('Google Tag Manager').closest('div')
    fireEvent.click(gtmSource!)

    // Confirm configuration
    const connectButton = screen.getByTestId('confirm-config')
    fireEvent.click(connectButton)

    expect(mockOnConnect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'gtm', name: 'Google Tag Manager' }),
      { apiKey: 'test-key' }
    )
  })

  it('closes modal when close button is clicked', () => {
    render(
      <DataSourceSelector
        onConnect={mockOnConnect}
        connectedSources={mockConnectedSources}
      />
    )

    // Open modal
    const gtmSource = screen.getByText('Google Tag Manager').closest('div')
    fireEvent.click(gtmSource!)

    expect(screen.getByTestId('datasource-config-modal')).toBeInTheDocument()

    // Close modal
    const closeButton = screen.getByTestId('close-modal')
    fireEvent.click(closeButton)

    expect(screen.queryByTestId('datasource-config-modal')).not.toBeInTheDocument()
  })

  it('calls onConnect directly when clicking already connected data source', () => {
    const connectedSources: DataSource[] = [
      { id: 'gtm', name: 'Google Tag Manager', description: 'Track website interactions and user behavior', icon: '🏷️', connected: true }
    ]

    render(
      <DataSourceSelector
        onConnect={mockOnConnect}
        connectedSources={connectedSources}
      />
    )

    const gtmSource = screen.getByText('Google Tag Manager').closest('div')
    fireEvent.click(gtmSource!)

    expect(mockOnConnect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'gtm', name: 'Google Tag Manager' })
    )
    expect(screen.queryByTestId('datasource-config-modal')).not.toBeInTheDocument()
  })
})
