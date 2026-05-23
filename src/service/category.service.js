// category.service.js
import httpclient from '../http-common'

const getAll = () => httpclient.get("api/categories")
const get = (id) => httpclient.get(`api/categories/${id}`)
const create = (data) => httpclient.post("api/categories", data)
const update = (id, data) => httpclient.put(`api/categories/${id}`, data)
const remove = (id) => httpclient.delete(`api/categories/${id}`)

const CategoryService = { getAll, get, create, update, remove }
export default CategoryService