// user.service.js
import httpclient from '../http-common'

const getAll = () => httpclient.get("api/users")
const get = (id) => httpclient.get(`api/users/${id}`)
const getByKeycloakId = (keycloakId) => httpclient.get(`api/users/keycloak/${keycloakId}`)
const create = (data) => httpclient.post("api/users", data)
const update = (id, data) => httpclient.put(`api/users/${id}`, data)
const remove = (id) => httpclient.delete(`api/users/${id}`)

const UserService = { getAll, get, getByKeycloakId, create, update, remove }
export default UserService