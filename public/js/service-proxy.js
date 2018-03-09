require("babel-polyfill");

async function checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
        return response;
    } else {
        const error = new Error(`HTTP Error: ${response.statusText}`);
        error.statusText = response.statusText;
        error.status = response.status;
        if (response.status === 401) {
            error.authPath = await response.text();
        }

        let errorResult = await response.text();
        try {
            error.result = JSON.parse(errorResult);
        } catch (e) {
            error.result = errorResult;
        }
        throw error;
    }
}

async function handleError(ex) {
    if (ex.status === 401) {
        if (ex.authPath) {
            // browserHistory.push(ex.authPath);
            window.location.href = ex.authPath;
        } else {
            console.error('Not allowed.');
        }
    }

    console.error('ex = ', ex, JSON.stringify(ex));
}

export default {
    proxy: async function (url, options) {
        if (options && options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
            options.body = JSON.stringify(options.body);
        }

        try {
            let mergedOptions = Object.assign({
                accept: 'application/json',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            }, options);

            let res = await checkStatus(await fetch(url, mergedOptions));

            if (mergedOptions.accept === 'application/json') {
                return await res.json();
            } else {
                return await res.text();
            }
        } catch (ex) {
            await handleError(ex);
            throw ex;
        }
    },

    proxyTo: async function (options) {
        options.method = options.method || 'POST';
        return await this.proxy('/proxy', options);
    }
}