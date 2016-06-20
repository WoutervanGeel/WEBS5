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

   
};