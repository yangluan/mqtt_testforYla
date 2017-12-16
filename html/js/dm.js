(function () {
    var __gameTime = 30;

    MachineEvent = {
        updateStatus: 'a',
        updateGameTime: 'b'
    }

    MachineStatus = {
        none: '',
        ready: 'ready',
        starting: 'starting',
        playing: 'playing',
        catching: 'catching',
        gameLose: 'gameLose',
        gameWin: 'gameWin',
        waitStart: 'waitStart',
        loading: 'loading'
    }

    function DollMachine(deviceName, mqtt, hljoy) {
        var _mqtt = mqtt,
        _hljoy = hljoy,
        _deviceName = deviceName,
        _machineStatus = MachineStatus.none,
        _gameTimer = null,
        _gameTime = 0,
        _camera = -1,
        _events = {},
        _canvas = document.getElementsByTagName('canvas'),
        _cameraChanging = false,
        _self = this;

        function exec(cmd) {
            _mqtt.controlWawaji(_deviceName, cmd);
        }

        function checkGameResult() {
            _hljoy.getPlayResult(_deviceName, {
                onload: function() {
                    var res = JSON.parse(this.responseText);
                    if (res && res.data) {
                        if (res.data[0])
                            _self.setStatus(MachineStatus.gameWin);
                        else {
                            waitCloseResult(10);
                            _self.setStatus(MachineStatus.gameLose);
                        }
                    }
                },
                onerror: function() {
                    alert('网络错误, 请稍后再试!');
                }
            });
        }

        function showCamera() {
            var inx = (_camera + 1) % 2;
            if (_camera >= 0 && _camera < _canvas.length) {
                _canvas[_camera].style.display = 'block';
            }
            _canvas[inx].style.display = 'none';
            if (_canvas[inx].handle) {
                _canvas[inx].handle.destroy();
                _canvas[inx].handle = null;
            }
            _cameraChanging = false;
        }

        this.deviceMessage = function(message, payload) {
            if (payload.messageType == 'status') {
                console.log('payload:' + message.payloadString);
                if (payload.curPlayer == facade.userId) {
                    if (payload.status == 'result') {
                        this.gameOver();
                    } else if (payload.status == MachineStatus.playing) {
                        this.setStatus(payload.status);
                        _gameTime = __gameTime;
                        _gameTimer = setInterval(_self.updateGameTime, 1000);
                    }
                } else if (payload.status == MachineStatus.ready) {
                    if (_machineStatus == MachineStatus.waitStart)
                        this.setStatus(payload.status);
                } else
                    this.setStatus(MachineStatus.waitStart);
            }
        }

        this.updateGameTime = function() {
            if (_gameTime > 0) {
                _gameTime --;
                if (_events[MachineEvent.updateGameTime]) {
                    var events = _events[MachineEvent.updateGameTime], len = events.length;
                    for (var i = 0; i < len; i ++)
                        events[i](_gameTime);
                }
            } else {
                _self.catch();
            }
        }

        this.addEventListener = function(event, cb) {
            if (!_events[event]) {
                _events[event] = [];
            } else {
                var len = _events[event].length;
                for (var i = len - 1; i >= 0; i --) {
                    if (_events[event][i] == cb) {
                        return;
                    }
                }
            }
            _events[event].push(cb);
        }

        this.removeEventListener = function(event, cb) {
            if (_events[event]) {
                var len = _events[event].length;
                for (var i = len - 1; i >= 0; i --) {
                    if (_events[event][i] == cb) {
                        _events[event].splice(i, 1);
                        break;
                    }
                }
            }
        }

        this.start = function() {
            if (getDeviceStatus(_deviceName) == 'ready') {
                var _self = this;
                this.setStatus(MachineStatus.starting);
                /*_hljoy.startPlay(_deviceName, {
                    onload: function() {
                        var res = JSON.parse(this.responseText);
                        if (res) {*/
                            /*if (res.data[0] == 'error') {
                                alert('设备没有准备好, 请稍后再试!');
                            } else if (res.data[0] == 'playing' || res.data[0] == 'result' || res.data[0] == 'catching') {
                                alert('糟糕! 没抢到机器.');
                            } else*/ {
                                exec(_mqtt.Wawaji_CMD_start);
                            }
                    /* } else
                            alert('网络错误, 请稍后再试!');
                    },
                    onerror: function() {
                        alert('网络错误, 请稍后再试!');
                    }*/
                //});
            }
        }

        this.catch = function() {
            if (_gameTimer) {
                clearInterval(_gameTimer);
                _gameTimer = null;
            }
            if (_machineStatus == MachineStatus.playing) {
                this.setStatus(MachineStatus.catching);
                exec(_mqtt.Wawaji_CMD_catch);
            }
        }

        this.moveLeft = function() {
            if (_machineStatus == MachineStatus.playing) {
                if (_camera == 1)
                    exec(_mqtt.Wawaji_CMD_bottom);
                else
                    exec(_mqtt.Wawaji_CMD_left);
            }
        }

        this.moveRight = function() {
            if (_machineStatus == MachineStatus.playing) {
                if (_camera == 1)
                    exec(_mqtt.Wawaji_CMD_top);
                else
                    exec(_mqtt.Wawaji_CMD_right);
            }
        }

        this.moveFornt = function() {
            if (_machineStatus == MachineStatus.playing) {
                if (_camera == 1)
                    exec(_mqtt.Wawaji_CMD_right);
                else
                    exec(_mqtt.Wawaji_CMD_bottom);
            }
        }

        this.moveBack = function() {
            if (_machineStatus == MachineStatus.playing) {
                if (_camera == 1)
                    exec(_mqtt.Wawaji_CMD_left);
                else
                    exec(_mqtt.Wawaji_CMD_top);
            }
        }

        this.stopMove = function() {
            exec(_mqtt.Wawaji_CMD_stopmove);
        }

        this.leave = function() {
            exec(_mqtt.Wawaji_CMD_leave);
        }

        this.back = function() {
            exec(_mqtt.Wawaji_CMD_back);
        }

        this.cancelRetry = function() {
            exec(_mqtt.Wawaji_CMD_notretry);
        }

        this.gameOver = function() {
            setTimeout(checkGameResult, 10);
        }

        this.setStatus = function(value) {
            if (value != _machineStatus) {
                _machineStatus = value;
                if (_events[MachineEvent.updateStatus]) {
                    var events = _events[MachineEvent.updateStatus], len = events.length;
                    for (var i = 0; i < len; i ++)
                        events[i](value);
                }
            }
        }        

        this.getDeviceName = function() {
            return _deviceName;
        }

        this.setDeviceName = function(value) {
            _deviceName = value;
        }

        this.getCamera = function() {
            return _camera;
        }

        this.setCamera = function(camera, mainCamera, subCamera) {
            if (camera != _camera) {
                if (typeof mainCamera !== 'undefined')
                    _canvas[0].url = mainCamera;
                if (typeof subCamera !== 'undefined')
                    _canvas[1].url = subCamera;
                if (! _cameraChanging) {
                    _camera = camera;
                    if (camera < 0) {
                        if (_canvas[0].handle) {
                            _canvas[0].handle.destroy();
                            _canvas[0].handle = null;
                        }
                        if (_canvas[1].handle) {
                            _canvas[1].handle.destroy();
                            _canvas[1].handle = null;
                        }
                        _canvas[1].style.display = 'none';
                        _canvas[0].style.display = 'block';
                    } else {
                        _cameraChanging = true;

                        if (_camera < _canvas.length) {
                            if (_canvas[_camera] && _canvas[_camera].url != '') {
                                _canvas[_camera].handle = new JSMpeg.Player(_canvas[_camera].url, { canvas: _canvas[_camera], autoplay: true });
                            }
                            setTimeout(showCamera, 750);
                        }
                    }
                    
                }
            }
        }

        this.close = function() {
            _deviceName = '';
            _machineStatus = MachineStatus.none;
            _gameTimer = null;
            _gameTime = 0;
            _cameraChanging = false;
            this.setCamera(-1, '', '');
        }
    }

    window.DollMachine = DollMachine;
}());