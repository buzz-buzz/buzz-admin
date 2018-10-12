import React from "react";

const ua_info = require("ua_parser").userAgent(window.navigator.userAgent);

export default class Version extends React.Component {
    constructor(){
        super();

        const userInfo = Object.keys(ua_info).map(key => ({
            key, value: ua_info[key]
        }));

        userInfo.push({
            key: 'buzzAdminVersion',
            value: '2018-10-12 10:04:00  content: startsWith error'
        });

        this.state = {
            userInfo: userInfo
        }
    }

    componentWillMount(){
        //如果是http 跳转至https
        if (window.location.href.indexOf('https') === -1 ) {
            window.location.href = window.location.href.replace('http', 'https');
        }

        try{
            if(window.caches){
                window.caches.keys().then(function(keys) {
                    keys.forEach(function(request, index, array) {
                        window.caches.delete(request);
                    });
                });
            }else{
                console.log('no window.caches');
            }
    
            if(window.caches){
                window.caches.keys().then(function(keyList) {
                    return window.Promise.all(keyList.map(function(key) {
                        return window.caches.delete(key);
                    }));
                })
            }else{
                console.log('no window.caches');
            }
        }
        catch (ex){
            console.log('window.caches.keys delete failed', ex);
        }
    }

    render() {
        return <div style={{marginTop: '20px', paddingLeft: '20px'}}>
            {
                this.state.userInfo && this.state.userInfo.length &&
                this.state.userInfo.map((item, index)=> <p key={index} style={{margin: '10px 0'}}>{item.key} : {JSON.stringify(item.value)}</p>)
            }
        </div>
    }
}
