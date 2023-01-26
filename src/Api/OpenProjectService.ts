import api from "./index";


export class OpenProjectService {
    static async getAllTasks() {
        const {data} = await api.get('/projects/test/work_packages')
        return data
    }
    static async updateTask(upd_data: { _links: { status: { href: string } }; lockVersion: number | undefined }, id: number | undefined) {
        const {data} = await api.patch(`work_packages/${id}`, upd_data)
        return data
    }
}