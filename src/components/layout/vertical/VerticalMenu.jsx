'use client'

import React, { useState, useEffect } from 'react'

import { useTheme } from '@mui/material/styles'
import PerfectScrollbar from 'react-perfect-scrollbar'

import { useSession, getSession } from 'next-auth/react'

import LinearProgress from '@mui/material/LinearProgress'

import Box from '@mui/material/Box'
import axios from 'axios'

import { Menu, MenuItem, SubMenu } from '@menu/vertical-menu'
import { useSettings } from '@core/hooks/useSettings'
import useVerticalNav from '@menu/hooks/useVerticalNav'
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

const RenderExpandIcon = ({ open, transitionDuration }) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='tabler-chevron-right' />
  </StyledVerticalNavExpandIcon>
)

const menuItems = [
  { href: '/home', icon: 'tabler-smart-home', label: 'หน้าแรก' },
  {
    label: 'การทำงาน',
    icon: 'tabler-file-export',
    children: [
      { href: '/order_list', icon: 'tabler-clipboard-list', label: 'รายการสั่งจอง', permission: '1' },
      {
        href: '/reservation_information',
        icon: 'tabler-shopping-cart',
        label: 'ข้อมูลการสั่งจอง',
        permission: '2'
      },
      {
        href: '/record_film_number_and_reservation',
        icon: 'tabler-printer',
        label: 'บันทึกเลขฟิลม์และใบจอง',
        permission: '3'
      },
      {
        href: '/list_of_group_photos',
        icon: 'tabler-camera',
        label: 'บันทึกรายการถ่ายภาพหมู่',
        permission: '4'
      },
      {
        href: '/record_parcel_number',
        icon: 'tabler-package',
        label: 'บันทึกเลขพัสดุ',
        permission: '5'
      },
      {
        href: '/online_order',
        icon: 'tabler-package',
        label: 'การสั่งซื้อจากออนไลน์',
        permission: '21'
      }
    ]
  },
  {
    label: 'รายงาน',
    children: [
      {
        href: '/parcel_address',
        icon: 'tabler-smart-home',
        label: 'พิมพ์ที่อยู่พัสดุ',
        permission: '6'
      },
      {
        href: '/group_photo_report',
        icon: 'tabler-shopping-cart-up',
        label: 'รายงานรูปหมู่สี',
        permission: '7'
      },
      {
        href: '/film_number_report',
        icon: 'tabler-shopping-cart-up',
        label: 'รายงานชุดและเลขฟิลม์',
        permission: '17'
      },
      {
        href: '/parcel_number_report',
        icon: 'tabler-shopping-cart-up',
        label: 'รายงานเลขพัสดุ',
        permission: '18'
      }
    ]
  },
  {
    label: 'บันทึกข้อมูลหลัก',
    children: [
      {
        href: '/university',
        icon: 'tabler-smart-home',
        label: 'รายชื่อมหาวิทยาลัย',
        permission: '8'
      },
      {
        href: '/prefix_of_name',
        icon: 'tabler-shopping-cart-up',
        label: 'คำนำหน้าชื่อ',
        permission: '9'
      }
    ]
  },
  {
    label: 'จัดการ',
    children: [
      {
        href: '/set_the_price_frame',
        icon: 'tabler-smart-home',
        label: 'กำหนดค่ากรอบราคา',
        permission: '10'
      },
      {
        href: '/import_data',
        icon: 'tabler-shopping-cart-up',
        label: 'Import Data',
        permission: '11'
      },
      {
        href: '/export_data',
        icon: 'tabler-shopping-cart-up',
        label: 'Export Data',
        permission: '12'
      },
      {
        href: '/policy',
        icon: 'tabler-shopping-cart-up',
        label: 'ผู้ใช้งาน',
        permission: '13'
      }
    ]
  },
  {
    label: 'กำหนดตัวเลือก',
    children: [
      {
        href: '/available_sets',
        icon: 'tabler-smart-home',
        label: 'กำหนดชุดที่สามารถใช้ได้',
        permission: '14'
      }
    ]
  }
]

const VerticalMenu = ({ scrollMenu }) => {
  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()
  const { settings } = useSettings()
  const { isBreakpointReached } = useVerticalNav()
  const [userPermissions, setUserPermissions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [session, setSession] = useState(null)

  const { transitionDuration } = verticalNavOptions
  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  // Define scrollWrapperProps based on isBreakpointReached
  const scrollWrapperProps = isBreakpointReached
    ? {
        className: 'bs-full overflow-y-auto overflow-x-hidden',
        onScroll: container => scrollMenu(container, false)
      }
    : {
        options: { wheelPropagation: false, suppressScrollX: true },
        onScrollY: container => scrollMenu(container, true)
      }

  useEffect(() => {
    const checkSession = async () => {
      try {
        const currentSession = await getSession()
        setSession(currentSession)
      } catch (error) {
        console.error('Error getting session:', error)
        setError('Failed to get session')
      }
    }
    checkSession()
  }, [])

  useEffect(() => {
    const fetchUserPermissions = async () => {
      if (session?.user?.id) {
        try {
          setIsLoading(true)
          const response = await axios.get('/api/permission/menu')
          const userData = response.data.find(user => user.user_id === session.user.id)
          
          if (userData) {
            setUserPermissions(userData.keymenu || [])
          } else {
            throw new Error('User data not found')
          }
        } catch (error) {
          console.error('Error fetching permissions:', error)
          setError('Failed to fetch permissions')
        } finally {
          setIsLoading(false)
        }
      } else {
        setUserPermissions([])
        setIsLoading(false)
      }
    }
    fetchUserPermissions()
  }, [session])

  const hasPermission = requiredPermission => {
    // console.log('Checking permission:', requiredPermission)
    // console.log('User permissions:', userPermissions)
    return !requiredPermission || userPermissions.includes(requiredPermission)
  }

  const renderMenuItem = item => {
    if (!hasPermission(item.keymenu)) {
      console.log('No permission for:', item.label)
      return null
    }

    if (item.children) {
      const visibleChildren = item.children.filter(child => hasPermission(child.keymenu))
        // const visibleChildren = item.children
      if (visibleChildren.length === 0) {
        return null
      }

      return (
        <SubMenu key={item.label} className='font-bold' label={item.label}>
          {visibleChildren.map(renderMenuItem)}

          
        </SubMenu>
      )
    }

    return (
      <MenuItem key={item.href} href={item.href} icon={<i className={item.icon} />}>
        <b>{item.label}</b>
      </MenuItem>
    )
  }

  if (isLoading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    )
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  
  return (
    <ScrollWrapper {...scrollWrapperProps}>
      <Menu
        popoutMenuOffset={{ mainAxis: 23 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme, settings)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='tabler-circle text-xs' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        {menuItems.map(renderMenuItem)}
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
