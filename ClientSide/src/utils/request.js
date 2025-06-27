import axios from "axios"

const request=axios.create({
    baseURL:["http://localhost:4500", "https://intelligram.onrender.com"].find(url => url.startsWith('https')) || "http://localhost:4500",
})

export default request;