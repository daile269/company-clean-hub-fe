import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import NotificationsPage from './page'
import { authService } from '@/services/authService'
import { notificationService } from '@/services/notificationService'

const mockPush = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

jest.mock('@/services/notificationService', () => {
  const types = [
    'WORK_TIME_CONFLICT', 'NEW_EMPLOYEE_CREATED', 'MISSING_VERIFICATION_PHOTO',
    'INSUFFICIENT_STAFF', 'CONTRACT_EXPIRING', 'ASSIGNMENT_OVER_BUDGET',
    'TEMPORARY_OVER_5_DAYS', 'CHECKIN_OUTSIDE_RADIUS',
  ]
  const meta: any = {}
  const labels: any = {}
  types.forEach((t) => {
    meta[t] = { icon: '🔔', color: '#000', bg: '#fff', border: '#ccc' }
    labels[t] = t
  })
  return {
    notificationService: {
      getUnreadCount: jest.fn(),
      getAllPaginated: jest.fn(),
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
    },
    NotificationTypeMeta: meta,
    NotificationTypeLabels: labels,
  }
})

jest.mock('@/services/authService', () => ({
  authService: { getCurrentUser: jest.fn() },
}))
jest.mock('@/services/permissionService', () => ({
  permissionService: { hasPermission: jest.fn(() => false) },
}))

const qlt1User = {
  id: 1,
  username: 'qlt1',
  roleName: 'QLT1',
  fullName: 'QLT1 User',
  email: 'qlt1@x.com',
  phone: '1',
  roleId: 1,
  userType: 'INTERNAL',
  token: 't',
}

beforeEach(() => {
  jest.clearAllMocks()
  ;(authService.getCurrentUser as jest.Mock).mockReturnValue(qlt1User)
  ;(notificationService.getUnreadCount as jest.Mock).mockResolvedValue(0)
  ;(notificationService.getAllPaginated as jest.Mock).mockResolvedValue({
    content: [], page: 0, pageSize: 15, totalElements: 0, totalPages: 0, first: true, last: true,
  })
})

describe('NotificationsPage navigation', () => {
  it('AC-NAV.5 — TEMPORARY_OVER_5_DAYS ưu tiên điều hướng đến contract dù có refEmployeeId', async () => {
    ;(notificationService.getAllPaginated as jest.Mock).mockResolvedValue({
      content: [
        {
          id: 1,
          type: 'TEMPORARY_OVER_5_DAYS',
          typeDescription: 'x',
          title: 'Cảnh báo nhân viên làm tạm thời',
          message: 'quá số ngày',
          refEmployeeId: 7,
          refAssignmentId: null,
          refContractId: 42,
          isRead: false,
          createdAt: new Date().toISOString(),
        },
      ],
      page: 0, pageSize: 15, totalElements: 1, totalPages: 1, first: true, last: true,
    })

    render(<NotificationsPage />)

    await waitFor(() =>
      expect(screen.getByText('Cảnh báo nhân viên làm tạm thời')).toBeInTheDocument(),
    )

    fireEvent.click(screen.getByText('Cảnh báo nhân viên làm tạm thời'))

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/admin/contracts/42'))
    expect(mockPush).not.toHaveBeenCalledWith('/admin/employees/7')
  })
})
