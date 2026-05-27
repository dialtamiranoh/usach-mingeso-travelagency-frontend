import httpclient from '../http-common'

const getSalesReport = (startDate, endDate) =>
    httpclient.get(`api/reports/sales?startDate=${startDate}&endDate=${endDate}`)

const getPackageRanking = (startDate, endDate) =>
    httpclient.get(`api/reports/ranking?startDate=${startDate}&endDate=${endDate}`)

const ReportService = { getSalesReport, getPackageRanking }

export default ReportService