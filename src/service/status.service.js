// status.service.js
import httpclient from '../http-common'

const getAll = () => httpclient.get("api/statuses")
const get = (id) => httpclient.get(`api/statuses/${id}`)
const getByEntityType = (entityType) => httpclient.get(`api/statuses/entity-type/${entityType}`)
const create = (data) => httpclient.post("api/statuses", data)
const update = (id, data) => httpclient.put(`api/statuses/${id}`, data)
const remove = (id) => httpclient.delete(`api/statuses/${id}`)

const StatusService = { getAll, get, getByEntityType, create, update, remove }
export default StatusService