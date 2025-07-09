var _ = require("underscore");

var promises = require("../promises");
var xml = require("../xml");


exports.read = read;
exports.readXmlFromZipFile = readXmlFromZipFile;

var xmlNamespaceMap = {
    // Transitional format
    "http://schemas.openxmlformats.org/wordprocessingml/2006/main": "w",
    "http://schemas.openxmlformats.org/officeDocument/2006/relationships": "r",
    "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing": "wp",
    "http://schemas.openxmlformats.org/drawingml/2006/main": "a",
    "http://schemas.openxmlformats.org/drawingml/2006/picture": "pic",

    // Strict format
    "http://purl.oclc.org/ooxml/wordprocessingml/main": "w",
    "http://purl.oclc.org/ooxml/officeDocument/relationships": "r",
    "http://purl.oclc.org/ooxml/drawingml/wordprocessingDrawing": "wp",
    "http://purl.oclc.org/ooxml/drawingml/main": "a",
    "http://purl.oclc.org/ooxml/drawingml/picture": "pic",

    // Common
    "http://schemas.openxmlformats.org/package/2006/content-types": "content-types",
    "http://schemas.openxmlformats.org/package/2006/relationships": "relationships",
    "http://schemas.openxmlformats.org/markup-compatibility/2006": "mc",
    "http://schemas.openxmlformats.org/officeDocument/2006/math": "m",
    "urn:schemas-microsoft-com:office:office": "o",

    "urn:schemas-microsoft-com:vml": "v",
    "urn:schemas-microsoft-com:office:word": "office-word",
    "http://www.w3.org/XML/1998/namespace": "ns",

    // [MS-DOCX]: Word Extensions to the Office Open XML (.docx) File Format
    // https://learn.microsoft.com/en-us/openspecs/office_standards/ms-docx/b839fe1f-e1ca-4fa6-8c26-5954d0abbccd
    "http://schemas.microsoft.com/office/word/2010/wordml": "wordml"
};


function read(xmlString) {
    console.debug('Reading XML string:', xmlString);
    xmlString = transformToStandardXML(xmlString, xmlNamespaceMap);
    console.debug('Transformed XML string:', xmlString);
    return xml
        .readString(xmlString, xmlNamespaceMap)
        .then(function(document) {
            return collapseAlternateContent(document)[0];
        });
}


function readXmlFromZipFile(docxFile, path) {
    if (docxFile.exists(path)) {
        return docxFile.read(path, "utf-8")
            .then(stripUtf8Bom)
            .then(read);
    } else {
        return promises.resolve(null);
    }
}


function stripUtf8Bom(xmlString) {
    return xmlString.replace(/^\uFEFF/g, '');
}


function collapseAlternateContent(node) {
    if (node.type === "element") {
        if (node.name === "mc:AlternateContent") {
            return node.firstOrEmpty("mc:Fallback").children;
        } else {
            node.children = _.flatten(node.children.map(collapseAlternateContent, true));
            return [node];
        }
    } else {
        return [node];
    }
}

function transformToStandardXML(xmlString, urlToName = {}) {
    const uriToPrefix = new Map();
    let prefixCount = 0;

    let result = xmlString;

    // Find all {uri}attr= with their positions
    const matches = [...result.matchAll(/\{([^}]+)\}([^=]+)=/g)];

    console.log('Found matches:', matches.length);

    // Process from end to preserve indices
    for (let i = matches.length - 1; i >= 0; i--) {
        const match = matches[i];
        const fullMatch = match[0];
        const uri = match[1].replace(/\s+/g, '');
        const attrName = match[2];
        const matchIndex = match.index;

        if (!uriToPrefix.has(uri)) {
            const prefix = urlToName[uri] || `ns${prefixCount++}`;
            uriToPrefix.set(uri, prefix);

            // Find opening tag before this position
            const beforeMatch = result.substring(0, matchIndex);
            const lastOpenTag = beforeMatch.lastIndexOf('<');
            const nextCloseTag = result.indexOf('>', lastOpenTag);

            // Insert xmlns into this tag
            const tagContent = result.substring(lastOpenTag, nextCloseTag);
            const newTagContent = tagContent + ` xmlns:${prefix}="${uri}"`;

            result = result.substring(0, lastOpenTag) +
              newTagContent +
              result.substring(nextCloseTag);
        }

        const prefix = uriToPrefix.get(uri);
        const replacement = `${prefix}:${attrName}=`;

        // Replace specific occurrence by index
        result = result.substring(0, matchIndex) +
          replacement +
          result.substring(matchIndex + fullMatch.length);
    }

    return result;
}
