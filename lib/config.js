var config = require('../config/default');

// load environment specific configuration
try {
    var overrides = {};
    if (process.env.NODE_ENV) {
        overrides = require('../config/' + process.env.NODE_ENV);
    }

    // perform override
    for (var index in overrides) {
        config[index] = overrides[index];
    }
}

return config;