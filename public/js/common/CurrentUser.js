import ServiceProxy from "../service-proxy";

export default class CurrentUser {
    static async getInstance() {
        return await ServiceProxy.proxy('/current-user');
    }
}
