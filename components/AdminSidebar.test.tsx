import { render, screen } from '@testing-library/react'
import AdminSidebar from './AdminSidebar'
import { AuthUser } from '@/services/authService'

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

describe('AdminSidebar', () => {
  const mockUser: AuthUser = {
    id: 1,
    username: 'testuser',
    roleName: 'EMPLOYEE',
    fullName: 'Test Employee',
    email: 'test@example.com',
    phone: '123456789',
    roleId: 2,
    userType: 'INTERNAL',
    token: 'fake-token'
  }

  it('renders Chụp ảnh chấm công link for EMPLOYEE role', () => {
    render(<AdminSidebar user={mockUser} sidebarOpen={true} />)
    const link = screen.getByText(/Chụp ảnh chấm công/i)
    expect(link).toBeInTheDocument()
    expect(link.closest('a')).toHaveAttribute('href', '/admin/attendance/today-tasks')
  })

  it('does not render Chụp ảnh chấm công link for ADMIN role', () => {
    const adminUser: AuthUser = { ...mockUser, roleName: 'ADMIN' }
    render(<AdminSidebar user={adminUser} sidebarOpen={true} />)
    const link = screen.queryByText(/Chụp ảnh chấm công/i)
    expect(link).not.toBeInTheDocument()
  })
})
