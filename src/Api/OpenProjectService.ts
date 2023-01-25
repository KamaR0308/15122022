import api from "./index";

export class OpenProjectService {
    static async getAllTasks() {
        const {data} = await api.get('/')
        return data
    }
    static async updateTask(upd_data: any, id: number) {
        const {data} = await api.patch(`api/v3/work_packages/${id}`)
        return data
    }
}