import { GET } from '@/app/api/health/route'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    $queryRaw: jest.fn(),
  },
}))

import { prisma } from '@/lib/prisma'

describe('/api/health', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return healthy status when database is connected', async () => {
    // Mock successful database query
    ;(prisma.$queryRaw as jest.Mock).mockResolvedValue([{ '?column?': 1 }])

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({
      status: 'healthy',
      timestamp: expect.any(String),
      database: 'connected',
    })
    expect(prisma.$queryRaw).toHaveBeenCalled()
  })

  it('should return unhealthy status when database connection fails', async () => {
    // Mock database query failure
    const error = new Error('Connection failed')
    ;(prisma.$queryRaw as jest.Mock).mockRejectedValue(error)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(503)
    expect(data).toEqual({
      status: 'unhealthy',
      timestamp: expect.any(String),
      database: 'disconnected',
      error: 'Database connection failed',
    })
  })

  it('should include timestamp in response', async () => {
    ;(prisma.$queryRaw as jest.Mock).mockResolvedValue([{ '?column?': 1 }])

    const response = await GET()
    const data = await response.json()

    expect(data.timestamp).toBeDefined()
    expect(new Date(data.timestamp)).toBeInstanceOf(Date)
  })
})
