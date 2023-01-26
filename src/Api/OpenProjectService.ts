import api from "./index";


interface IUpdate {
    spentTime?: string
    estimatedTime?: string
    _links?: { status: { href: string } };
    lockVersion: number | undefined
}
export class OpenProjectService {
    static async getAllTasks() {
        const {data} = await api.get('/projects/test/work_packages')
        return data
    }
    static async updateTask(upd_data: IUpdate, id: number | undefined) {
        const {data} = await api.patch(`work_packages/${id}`, upd_data)
        return data
    }
}