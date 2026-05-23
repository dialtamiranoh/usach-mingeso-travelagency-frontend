// tourist-package.service.js
import httpclient from '../http-common'

const getAll = () => httpclient.get("api/tourist-packages")
const get = (id) => httpclient.get(`api/tourist-packages/${id}`)
const getAvailable = (filters) => httpclient.get("api/tourist-packages/available", { params: filters })
const create = (data) => httpclient.post("api/tourist-packages", data)
const update = (id, data) => httpclient.put(`api/tourist-packages/${id}`, data)
const remove = (id) => httpclient.delete(`api/tourist-packages/${id}`)

const TouristPackageService = { getAll, get, getAvailable, create, update, remove }
export default TouristPackageService