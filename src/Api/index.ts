import Axios from 'axios'
import {config} from "../Config";

const api = Axios.create({
    baseURL: config.OPEN_PROJECT_URL,

    headers: {
        'Authorization': `Basic ${config.TOKEN}`
    }
});
export default api