// package-service.service.js
import httpclient from '../http-common'

const getAll = () => httpclient.get("api/package-services")
const get = (id) => httpclient.get(`api/package-services/${id}`)
const create = (data) => httpclient.post("api/package-services", data)
const update = (id, data) => httpclient.put(`api/package-services/${id}`, data)
const remove = (id) => httpclient.delete(`api/package-services/${id}`)

const PackageServiceService = { getAll, get, create, update, remove }
export default PackageServiceService