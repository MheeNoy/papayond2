'use client'
import React, { useState, useEffect } from 'react'
import ReactApexChart from 'react-apexcharts'
import { Box, Typography, Grid, TextField } from '@mui/material'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'

// สมมติว่าคุณมี API สำหรับดึงข้อมูลยอดการจองรายเดือน
// สำหรับตัวอย่างนี้ ผมจะสร้างฟังก์ชันจำลองการดึงข้อมูล
const fetchMonthlyBookings = async year => {
  // สร้างข้อมูลจำลอง
  const data = Array.from({ length: 12 }, () => Math.floor(Math.random() * 100))
  return data
}

const StackedBarChart = () => {
  const currentYear = dayjs().year()
  const [year1, setYear1] = useState(currentYear - 1) // ปีที่ 1 เริ่มต้นเป็นปีก่อนหน้า
  const [year2, setYear2] = useState(currentYear) // ปีที่ 2 เริ่มต้นเป็นปีปัจจุบัน
  const [series, setSeries] = useState([])

  const options = {
    chart: {
      type: 'bar',
      toolbar: {
        show: true
      },
      zoom: {
        enabled: true
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        dataLabels: {
          position: 'top'
        }
      }
    },
    dataLabels: {
      enabled: false
    },
    xaxis: {
      categories: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
    },
    legend: {
      position: 'top'
    },
    fill: {
      opacity: 1
    },
    yaxis: {
      title: {
        text: 'จำนวนการจอง'
      }
    },
    colors: ['#008FFB', '#00E396']
  }

  // ฟังก์ชันสำหรับอัปเดตข้อมูลเมื่อปีที่เลือกเปลี่ยนแปลง
  useEffect(() => {
    const updateData = async () => {
      // ดึงข้อมูลยอดการจองสำหรับปีที่เลือก
      const data1 = await fetchMonthlyBookings(year1)
      const data2 = await fetchMonthlyBookings(year2)

      // อัปเดต series
      setSeries([
        {
          name: `ปี ${year1}`,
          data: data1
        },
        {
          name: `ปี ${year2}`,
          data: data2
        }
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
              value={dayjs().set('year', year1)}
              onChange={date => {
                if (date) {
                  setYear1(date.year())
                }
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
              value={dayjs().set('year', year2)}
              onChange={date => {
                if (date) {
                  setYear2(date.year())
                }
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
