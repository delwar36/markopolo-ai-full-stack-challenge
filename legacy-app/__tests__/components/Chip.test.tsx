import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Chip from '@/components/ui/Chip'

describe('Chip Component', () => {
  const mockOnRemove = jest.fn()

  beforeEach(() => {
    mockOnRemove.mockClear()
  })

  it('renders chip with label and icon', () => {
    render(
      <Chip
        label="Test Label"
        icon="🏷️"
        onRemove={mockOnRemove}
      />
    )

    expect(screen.getByText('Test Label')).toBeInTheDocument()
    expect(screen.getByText('🏷️')).toBeInTheDocument()
  })

  it('renders with dataSource variant by default', () => {
    render(
      <Chip
        label="Test Label"
        icon="🏷️"
        onRemove={mockOnRemove}
      />
    )

    const chip = screen.getByText('Test Label').closest('div')
    expect(chip).toHaveClass('bg-green-100')
  })

  it('renders with channel variant when specified', () => {
    render(
      <Chip
        label="Test Label"
        icon="📧"
        onRemove={mockOnRemove}
        variant="channel"
      />
    )

    const chip = screen.getByText('Test Label').closest('div')
    expect(chip).toHaveClass('bg-purple-100')
  })

  it('calls onRemove when remove button is clicked', () => {
    render(
      <Chip
        label="Test Label"
        icon="🏷️"
        onRemove={mockOnRemove}
      />
    )

    const removeButton = screen.getByLabelText('Remove Test Label')
    fireEvent.click(removeButton)

    expect(mockOnRemove).toHaveBeenCalledTimes(1)
  })

  it('has proper accessibility attributes', () => {
    render(
      <Chip
        label="Test Label"
        icon="🏷️"
        onRemove={mockOnRemove}
      />
    )

    const removeButton = screen.getByLabelText('Remove Test Label')
    expect(removeButton).toBeInTheDocument()
  })
})
