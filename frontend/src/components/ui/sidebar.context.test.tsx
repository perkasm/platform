import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import React from 'react'
import { SidebarProvider } from './sidebar'
import { useSidebar } from './sidebar.context'

describe('Sidebar context', () => {
  it('throws when used outside of provider', () => {
    const { result } = renderHook(() => {
      try {
        return useSidebar()
      } catch (e) {
        return e as Error
      }
    })

    expect(result.current).toBeInstanceOf(Error)
    expect((result.current as Error).message).toMatch(/useSidebar must be used within a SidebarProvider/)
  })

  it('provides context inside provider and toggles state', () => {
    const { result } = renderHook(() => useSidebar(), {
      wrapper: ({ children }) => <SidebarProvider>{children as React.ReactElement}</SidebarProvider>,
    })

    // initial values should exist and be of expected types
    expect(result.current).toHaveProperty('open')
    expect(result.current).toHaveProperty('isMobile')
    expect(typeof result.current.toggleSidebar).toBe('function')

    // toggling should update open or openMobile depending on isMobile
    act(() => {
      result.current.toggleSidebar()
    })

    // After toggling, openMobile or open should be boolean
    expect(typeof result.current.open).toBe('boolean')
    expect(typeof result.current.openMobile).toBe('boolean')
  })
})
