four51.app.factory('Nav', function() {
    var _status = { "visible" : false};

    var _toggle = function() {
        _status.visible = !_status.visible;
    };

    return {
        status: _status,
        toggle: _toggle
    };
});