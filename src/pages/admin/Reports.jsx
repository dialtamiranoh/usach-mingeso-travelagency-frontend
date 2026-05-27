import { useState } from 'react'
import { useKeycloak } from '@react-keycloak/web'
import ReportService from '../../services/report.service'
import { FaChartBar, FaTrophy, FaSearch } from 'react-icons/fa'

const Reports = () => {
    const { keycloak, initialized } = useKeycloak()
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [activeReport, setActiveReport] = useState('sales')
    const [salesData, setSalesData] = useState([])
    const [rankingData, setRankingData] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [generated, setGenerated] = useState(false)

    const handleGenerate = () => {
        if (!startDate || !endDate) {
            setError('Debe ingresar fecha de inicio y término')
            return
        }
        if (startDate > endDate) {
            setError('La fecha de inicio no puede ser posterior a la fecha de término')
            return
        }

        setError(null)
        setLoading(true)

        const start = `${startDate}T00:00:00`
        const end = `${endDate}T23:59:59`

        Promise.all([
            ReportService.getSalesReport(start, end),
            ReportService.getPackageRanking(start, end)
        ]).then(([sales, ranking]) => {
            setSalesData(sales.data)
            setRankingData(ranking.data)
            setGenerated(true)
            setLoading(false)
        }).catch(() => {
            setError('Error al generar los reportes')
            setLoading(false)
        })
    }

    if (!initialized) return <div className="text-center mt-4"><div className="spinner-border" /></div>

    return (
        <div className="container mt-4">
            <h2>Reportes</h2>

            {/* Filtros */}
            <div className="card mb-4">
                <div className="card-body">
                    <div className="row align-items-end">
                        <div className="col-md-4 mb-2">
                            <label className="form-label">Fecha inicio <span className="text-danger">*</span></label>
                            <input type="date" className="form-control" value={startDate}
                                onChange={e => setStartDate(e.target.value)} />
                        </div>
                        <div className="col-md-4 mb-2">
                            <label className="form-label">Fecha término <span className="text-danger">*</span></label>
                            <input type="date" className="form-control" value={endDate}
                                onChange={e => setEndDate(e.target.value)} />
                        </div>
                        <div className="col-md-4 mb-2">
                            <button className="btn btn-primary w-100" onClick={handleGenerate} disabled={loading}>
                                {loading ? <span className="spinner-border spinner-border-sm me-2" /> : <FaSearch className="me-2" />}
                                Generar reportes
                            </button>
                        </div>
                    </div>
                    {error && <div className="alert alert-danger mt-2 mb-0">{error}</div>}
                </div>
            </div>

            {generated && (
                <>
                    {/* Tabs */}
                    <ul className="nav nav-tabs mb-3">
                        <li className="nav-item">
                            <button className={`nav-link ${activeReport === 'sales' ? 'active' : ''}`}
                                onClick={() => setActiveReport('sales')}>
                                <FaChartBar className="me-2" />Ventas por período
                            </button>
                        </li>
                        <li className="nav-item">
                            <button className={`nav-link ${activeReport === 'ranking' ? 'active' : ''}`}
                                onClick={() => setActiveReport('ranking')}>
                                <FaTrophy className="me-2" />Ranking de paquetes
                            </button>
                        </li>
                    </ul>

                    {/* Reporte ventas */}
                    {activeReport === 'sales' && (
                        <>
                            <p className="text-muted">Total: {salesData.length} registros</p>
                            <table className="table table-striped table-hover">
                                <thead className="table-dark">
                                    <tr>
                                        <th>ID</th>
                                        <th>Fecha</th>
                                        <th>Cliente</th>
                                        <th>Paquete</th>
                                        <th>Pasajeros</th>
                                        <th>Monto total</th>
                                        <th>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {salesData.length === 0 ? (
                                        <tr><td colSpan={7} className="text-center">No hay ventas en el período seleccionado</td></tr>
                                    ) : (
                                        salesData.map((row, i) => (
                                            <tr key={i}>
                                                <td>{row.bookingId}</td>
                                                <td>{new Date(row.operationDate).toLocaleDateString()}</td>
                                                <td>{row.clientName}</td>
                                                <td>{row.packageName}</td>
                                                <td>{row.passengerCount}</td>
                                                <td>${row.totalAmount}</td>
                                                <td>{row.bookingStatus}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </>
                    )}

                    {/* Ranking paquetes */}
                    {activeReport === 'ranking' && (
                        <>
                            <p className="text-muted">Top {rankingData.length} paquetes</p>
                            <table className="table table-striped table-hover">
                                <thead className="table-dark">
                                    <tr>
                                        <th>#</th>
                                        <th>Paquete</th>
                                        <th>Destino</th>
                                        <th>Reservas</th>
                                        <th>Pasajeros</th>
                                        <th>Monto total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rankingData.length === 0 ? (
                                        <tr><td colSpan={6} className="text-center">No hay datos en el período seleccionado</td></tr>
                                    ) : (
                                        rankingData.map((row, i) => (
                                            <tr key={i}>
                                                <td><strong>{i + 1}</strong></td>
                                                <td>{row.packageName}</td>
                                                <td>{row.destination}</td>
                                                <td>{row.totalBookings}</td>
                                                <td>{row.totalPassengers}</td>
                                                <td>${row.totalAmount}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </>
                    )}
                </>
            )}
        </div>
    )
}

export default Reports