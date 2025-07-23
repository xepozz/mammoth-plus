var xmldom = require("@xmldom/xmldom");
var dom = require("@xmldom/xmldom/lib/dom");
const officeXmlReader = require("../docx/office-xml-reader");

function parseFromString(string, mimeType) {
    var error = null;

    var domParser = new xmldom.DOMParser({
        onError: function(level, message) {
            error = {level: level, message: message};
        },
        xmlns: {
            ...Object.fromEntries(Object.entries(officeXmlReader.xmlNamespaceMap).map(a => a.reverse())),
            "": xmldom.NAMESPACE.XML
        },
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
