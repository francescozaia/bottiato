module.exports = {
    save: function (key, jsonData, expirationMin) {
        if (typeof (Storage) == "undefined") {
            return false;
        }
        var expirationMS = expirationMin * 60 * 1000;
        var record = {value: JSON.stringify(jsonData), timestamp: new Date().getTime() + expirationMS}
        localStorage.setItem(key, JSON.stringify(record));
        return jsonData;
    },
    load: function (key) {
        if (typeof (Storage) == "undefined") {
            return false;
        }
        var record = JSON.parse(localStorage.getItem(key));
        if (!record) {
            return false;
        }
        return (new Date().getTime() < record.timestamp && JSON.parse(record.value));
    }
}