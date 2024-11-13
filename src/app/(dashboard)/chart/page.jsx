'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Box, Typography, Grid, TextField } from '@mui/material'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'

// ใช้ Dynamic Import สำหรับ ReactApexChart เพื่อป้องกันการเข้าถึง window ใน Server-Side
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })

// สมมติว่าคุณมี API สำหรับดึงข้อมูลยอดการจองรายเดือน
const fetchMonthlyBookings = async year => {
  // คุณสามารถแทนที่โค้ดนี้ด้วยการเรียก API จริง
  const data = Array.from({ length: 12 }, () => Math.floor(Math.random() * 100))
  return data
}

const StackedBarChart = () => {
  const currentYear = dayjs().year()
  const [year1, setYear1] = useState(currentYear - 1)
  const [year2, setYear2] = useState(currentYear)
  const [series, setSeries] = useState([])

  const options = {
    chart: {
      type: 'bar',
      toolbar: { show: true },
      zoom: { enabled: true }
    },
    plotOptions: {
      bar: { horizontal: false, dataLabels: { position: 'top' } }
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
    },
    legend: { position: 'top' },
    fill: { opacity: 1 },
    yaxis: { title: { text: 'จำนวนการจอง' } },
    colors: ['#008FFB', '#00E396']
  }

  useEffect(() => {
    const updateData = async () => {
      const data1 = await fetchMonthlyBookings(year1)
      const data2 = await fetchMonthlyBookings(year2)

      setSeries([
        { name: `ปี ${year1}`, data: data1 },
        { name: `ปี ${year2}`, data: data2 }
      ])
    }

    updateData()
  }, [year1, year2])

  return (
    <Box>
      <Typography variant='h5' gutterBottom>
        เปรียบเทียบยอดการจองรายเดือนระหว่างปี {year1} และ {year2}
      </Typography>

      {/* ส่วนของตัวเลือกปี */}
      <Grid container spacing={2} mb={4}>
        <Grid item xs={12} md={6}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              views={['year']}
              label='เลือกปีที่ 1'
              value={dayjs().year(year1)}
              onChange={date => {
                if (date) setYear1(date.year())
              }}
              renderInput={params => <TextField {...params} fullWidth />}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12} md={6}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              views={['year']}
              label='เลือกปีที่ 2'
              value={dayjs().year(year2)}
              onChange={date => {
                if (date) setYear2(date.year())
              }}
              renderInput={params => <TextField {...params} fullWidth />}
            />
          </LocalizationProvider>
        </Grid>
      </Grid>

      {/* แสดงกราฟ */}
      {series.length > 0 ? (
        <ReactApexChart options={options} series={series} type='bar' height={500} />
      ) : (
        <Typography variant='body1'>กำลังโหลดข้อมูล...</Typography>
      )}
    </Box>
  )
}

export default StackedBarChart
