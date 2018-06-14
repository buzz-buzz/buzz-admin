import ServiceProxy from "../service-proxy";

export default class CurrentUser {
    static async getProfile() {
        let result = await ServiceProxy.proxy('/current-user')
        console.log(result)
        return result;
    }
}
