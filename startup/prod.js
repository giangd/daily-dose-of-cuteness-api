const helmet = require("helmet");
const compression = require("compression");
const cors = require("cors");

module.exports = (app) => {
    app.use(cors({ credentials: true, origin: true }));
    app.use(helmet());
    app.use(compression());
};
