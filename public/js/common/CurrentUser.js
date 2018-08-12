import ServiceProxy from "../service-proxy";

export default class CurrentUser {
    static async getProfile() {
        return await ServiceProxy.proxy('/current-user');
    }
}
