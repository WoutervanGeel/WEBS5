module.exports = {

    requestJson: function(req){
        return req.get('Content-Type') == "application/json";
    },
    // missing required fields
    setMissingFields: function(req, res) {

        var result = {
            status  : 400,
            message : 'Missing Required Fields'
        };

        res.status(result.status);
        if (this.requestJson(req))
            res.json(result);
        else
            res.render("notify", { message: result.message });
    },

    // not found
    setNotFound: function(req, res) {

        var result = {
            status  : 404,
            message : 'Not found'
        };

        res.status(result.status);
        if (this.requestJson(req))
            res.json(result);
        else
            res.render("notify", { message: result.message });
    },

    // not found
    setNotFoundOnLocal: function(req, res) {

        var result = {
            status  : 404,
            message : 'Not found on local DB'
        };

        res.status(result.status);
        if (this.requestJson(req))
            res.json(result);
        else
            res.render("notify", { message: result.message });
    },

    setVenueAlreadyExists: function(req, res) {

        var result = {
            status  : 400,
            message : 'Venue Already Exists'
        };

        res.status(result.status);
        if (this.requestJson(req))
            res.json(result);
        else
            res.render("notify", { message: result.message });
    },

    // successfully deleted
    setCustom: function(req, res, code, error) {

        var result = {
            status  : code,
            message : error
        };

        res.status(result.status);
        if (this.requestJson(req))
            res.json(result);
        else
            res.render("notify", { message: result.message });
    },

    setRaceAlreadyExists: function(req, res) {

        var result = {
            status  : 400,
            message : 'Name Already Taken'
        };

        res.status(result.status);
        if (this.requestJson(req))
            res.json(result);
        else
            res.render("notify", { message: result.message });
    },

    setRaceNotFound: function(req, res) {

        var result = {
            status  : 404,
            message : 'Race Not Found'
        };

        res.status(result.status);
        if (this.requestJson(req))
            res.json(result);
        else
            res.render("notify", { message: result.message });
    },

    // internal error
    setServerError: function(req, res) {

        var result = {
            status  : 500,
            message : 'Internal Server Error'
        };

        res.status(result.status);
        if (this.requestJson(req))
            res.json(result);
        else
            res.render("notify", { message: result.message });
    },

    // successfully deleted
    showDeleteSuccess: function(req, res, item_name) {

        var result = {
            status  : 200,
            message : '\''+item_name+ '\' Successfully Deleted'
        };

        res.status(result.status);
        if (this.requestJson(req))
            res.json(result);
        else
            res.render("notify", { message: result.message });
    },
    
    setTooManyRaces: function(req, res) {

        var result = {
            status  : 400,
            message : 'There are already 5 races.'
        };

        res.status(result.status);
        if (this.requestJson(req))
            res.json(result);
        else
            res.render("notify", { message: result.message });
    }
};