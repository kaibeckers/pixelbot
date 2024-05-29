export default class ProxyManager {
    proxyPool = {};
    #user
    #pass

    constructor(user, pass, proxies) {
        // dict
        for (const proxy of proxies) {
            this.proxyPool[proxy] = {}
        }
        this.#user = user;
        this.#pass = pass;
    }

    async addProxy(proxy) {
        this.proxyPool[proxy] = {}
    }

    async removeProxy(proxy) {
        delete this.proxyPool[proxy]
    }

    async setCredentials(user, pass) {
        this.#user = user;
        this.#pass = pass;
    }

    async getCredentials() {
        return { user: this.#user, pass: this.#pass }
    }

    async getProxy(proxy) {
        return { user: this.#user, pass: this.#pass, proxyUrl: Object.keys(this.proxyPool)[proxy] }
    }

    async getRandomProxy() {
        const proxies = Object.keys(this.proxyPool);
        if (proxies.length === 0) throw new Error('No proxies available')
        const getRandomProxy = (proxies) => proxies[Math.floor(Math.random() * proxies.length)];

        let safety = 0;
        do {
            const proxy = getRandomProxy(proxies)
            if ('errorCount' in this.proxyPool[proxy]) if (this.proxyPool[proxy].errorCount > 3) {
                delete this.proxyPool[proxy]
                safety++
                continue
            } 
            return { user: this.#user, pass: this.#pass, proxyUrl: proxy }
        } while (safety < 10)
        throw new Error('No remaining proxies available')
    }

    async markError(proxy) {
        if (!this.proxyPool[proxy]) {
            this.proxyPool[proxy] = {}
            this.proxyPool[proxy].errorCount = 0
        }
        this.proxyPool[proxy].errorCount += 1
    }
}