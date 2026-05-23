// promotion.service.js
import httpclient from '../http-common'

const getAll = () => httpclient.get("api/promotions")
const get = (id) => httpclient.get(`api/promotions/${id}`)
const getActive = () => httpclient.get("api/promotions/active")
const create = (data) => httpclient.post("api/promotions", data)
const update = (id, data) => httpclient.put(`api/promotions/${id}`, data)
const remove = (id) => httpclient.delete(`api/promotions/${id}`)

const PromotionService = { getAll, get, getActive, create, update, remove }
export default PromotionService