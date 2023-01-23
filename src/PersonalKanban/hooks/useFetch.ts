import {useState} from "react";

interface IFetchResult {
    req: () => void,
    loading: boolean,
    error: string

}
const useFetch = (callback: CallableFunction): IFetchResult => {
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string>('')

    const req = (): void => {
        try {
            setLoading(true)
            callback()
        } catch (e) {
            const err_ = e as Error
            setError(err_.message)
        } finally {
            setLoading(false)
        }
    }
    return {req, loading, error}
}

export default useFetch