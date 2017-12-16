var assets = {
    splash: {

    },
    main: {
        scripts: [
            'js/hljoy.js',
            'https://res.wx.qq.com/open/js/jweixin-1.3.0.js'
        ]
    },
    wawaji: {
        scripts: [
            'js/jsmpeg.min.js',
            'js/paho-mqtt.js',
            'js/MqttProxy.js',
            'js/dm.js',
            'js/crypto-js.js'
        ]
    }
}

defaultFontSize = 32;
defaultUIWidth = 720;


var cdnRoot = 'https://zhuawawa-cdn.hljoy.com/1.0.4/';

var videos = {
    v00010001: {
        main: 'wss://lite.haokan.com/wawaji_1_main',
        sub: 'wss://lite.haokan.com/wawaji_1_sub'
    },
    v00010002: {
        main: 'wss://lite.haokan.com/wawaji_2_main',
        sub: 'wss://lite.haokan.com/wawaji_2_sub'
    }    
}

var facade = {
    userId: 10004,
    token: '10004:1512099830:0af71dc955a2b146fbd93ab6d84900b1',
    config: {
        aliyunIotHost: '.iot-as-mqtt.cn-shanghai.aliyuncs.com'
    }
};
