import api from "./index";

export class OpenProjectService {
    static async getAllTasks() {
        const {data} = await api.get('/')
        return data
    }
}