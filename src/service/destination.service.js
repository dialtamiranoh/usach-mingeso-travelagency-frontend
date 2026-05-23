// destination.service.js
import httpclient from '../http-common'

const getAll = () => httpclient.get("api/destinations")
const get = (id) => httpclient.get(`api/destinations/${id}`)
const create = (data) => httpclient.post("api/destinations", data)
const update = (id, data) => httpclient.put(`api/destinations/${id}`, data)
const remove = (id) => httpclient.delete(`api/destinations/${id}`)

const DestinationService = { getAll, get, create, update, remove }
export default DestinationService