// package-type.service.js
import httpclient from '../http-common'

const getAll = () => httpclient.get("api/package-types")
const get = (id) => httpclient.get(`api/package-types/${id}`)
const create = (data) => httpclient.post("api/package-types", data)
const update = (id, data) => httpclient.put(`api/package-types/${id}`, data)
const remove = (id) => httpclient.delete(`api/package-types/${id}`)

const PackageTypeService = { getAll, get, create, update, remove }
export default PackageTypeService