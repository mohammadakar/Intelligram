import axios from "axios"

const request=axios.create({
    baseURL:"http://localhost:4500"
})

export default request;