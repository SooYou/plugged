/* CONSTANTS */
const VERBS = ["GET", "PUT", "POST", "DELETE"];

/* ERRORS */
const RequestError = function(data, status = null, code = null) {
    Error.captureStackTrace(this);

    this.name = "RequestError";
    this.message = Array.isArray(data) ? data.toString() : typeof data === "string" ? data : "no data returned";
    this.status = status;
    this.code = code;
};

module.exports.RequestError = RequestError;
module.exports.VERBS = VERBS;
