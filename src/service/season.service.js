// season.service.js
import httpclient from '../http-common'

const getAll = () => httpclient.get("api/seasons")
const get = (id) => httpclient.get(`api/seasons/${id}`)
const create = (data) => httpclient.post("api/seasons", data)
const update = (id, data) => httpclient.put(`api/seasons/${id}`, data)
const remove = (id) => httpclient.delete(`api/seasons/${id}`)

const SeasonService = { getAll, get, create, update, remove }
export default SeasonService