import ServiceProxy from "./service-proxy"

let cache = {}

export default class CachableProxy {
    static async get(options, key = options.body.uri) {
        if (!cache[key]) {
            cache[key] = await ServiceProxy.proxyTo(options)
        }

        return cache[key]
    }
}