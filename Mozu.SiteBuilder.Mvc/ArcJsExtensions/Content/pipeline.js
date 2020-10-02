const needle = require('needle');
const Url = require('url').URL;

function createLoginUser(innerRequest, global, arcJsContext) {
    return (config, callback) => {
        if (!config.customerId && !config.userName) {
            throw 'missing customerId or  userName';
        }
        const sdkConfig = JSON.parse(global.env.mozuHosted).sdkConfig;
        const custSearchUrl = new Url(
            '/api/commerce/customer/accounts/',
            sdkConfig.baseUrl);
        if (config.userName) {
            custSearchUrl.searchParams.set('filter', `username eq "${config.userName}"`)
            custSearchUrl.searchParams.set('responseFields', "totalCount,items(id)")
        } else {
            custSearchUrl.pathname += config.customerId;
            custSearchUrl.searchParams.set('responseFields', "items(id)")
        }
        const options = {
            headers: {},
            open_timeout: 5000,
            response_timeout: 5000,
            read_timeout: 5000
        };
        Object.keys(sdkConfig).forEach(k => {
            options.headers['x-vol-' + k] = sdkConfig[k];
        })
        delete options.headers['x-vol-user-claims'];

        needle('get', custSearchUrl.toString(), options).then(res => {
            if (res.statusCode > 399) {
                return callback(responseToError(res));
            }
            if (config.userName) {
                if (!res.body.items || res.body.items.length === 0) {
                    return callback(Error(`username: ${config.userName} not found`));
                }
                config.customerId = res.body.items[0].id;
            }
            innerRequest.execResult.loginUser = [[config]];
            callback(null, 'success');
        }).catch(e => {
            return callback(e);
        });
    }
}

function responseToError(res) {
    if (resp.body && resp.body.message) {
        return Error(resp.body.message);
    }
    return Error(resp.statusCode);
}

function afterContextCreated(body, global, arcJsContext) {
    arcJsContext.exec.loginUser = createLoginUser(body, global, arcJsContext)
}


module.exports = (pipeline) => {
    pipeline.afterContextCreated.push(afterContextCreated);
}