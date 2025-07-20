var xmldom = require("@xmldom/xmldom");
var dom = require("@xmldom/xmldom/lib/dom");

function parseFromString(string, mimeType) {
    var error = null;

    var domParser = new xmldom.DOMParser({
        onError: function(level, message, context) {
            error = {level: level, message: message, context: context, contents: string, mimeType: mimeType};
        }
    });

    var document = domParser.parseFromString(string, mimeType);

    if (error === null) {
        return document;
    }

    console.error('Error during parsing a document', error);

    const exception = new Error(error.level + ": " + error.message);
    exception.level = error.level;
    exception.message = error.message;
    exception.contents = error.contents;
    exception.mimeType = error.mimeType;

    throw exception;
}

exports.parseFromString = parseFromString;
exports.Node = dom.Node;
