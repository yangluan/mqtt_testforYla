(function () {

    function HLJoy() {
        var _apiUrl = 'https://wawaji-api.haokan.com/api/1.0.4/';

        this.get = function(cmd, params, cb) {
            var xhr = new XMLHttpRequest();
            if (cmd == 'play.Cameras') {
                xhr.open('GET', _wsUrl + params[0] + '-camera');
            } else {
                var url = _apiUrl + cmd.replace('.', '/');
                
                for (var i = 0; i < params.length; i ++) {
                    url += '/' + params[i];
                }
                xhr.open('GET', url + '?token=' + facade.token);
            }

            if (cb) {
                xhr.onload = cb.onload ? cb.onload : null;
                xhr.onerror = cb.onerror ? cb.onerror : null;
            }
            xhr.send(null);
        }

        this.getOne = function(cmd, param1, cb) {
            var params = [];
            params.push(param1);
            this.get(cmd, params, cb);
        }

        this.refreshToken = function() {
            this.get('play.GetRoomList', [], {
                onload: function() {

                }
            });
        }

        this.getPlayerInfo = function(cb) {
            this.get('account.GetPlayerInfo', [], cb);
        }

        this.playerLogin = function(player, cb) {
            this.getOne('device.PlayerQuickLogin', player, cb);
        }

        this.getRoomList = function(cb) {
            this.get('play.GetRoomList', [], cb);
        }

        this.startPlay = function(room, cb) {
            this.getOne('play.StartPlay', room, cb);
        }

        this.getPlayResult = function(room, cb) {
            this.getOne('play.GetResult', room, cb);
        }

        this.getCameras = function(room, cb) {
            var params = [];
            params.push(room);
            this.get('play.Cameras', params, cb);
        }
    }

    hljoy = new HLJoy();
}());