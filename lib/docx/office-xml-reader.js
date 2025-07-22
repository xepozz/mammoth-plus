var _ = require("underscore");

var promises = require("../promises");
var xml = require("../xml");


exports.read = read;
exports.injectNamespaces = injectNamespaces;
exports.readXmlFromZipFile = readXmlFromZipFile;
exports.simplifyClarkNotation = simplifyClarkNotation;

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
    "http://www.w3.org/2000/xmlns/": "xmlns",

    // [MS-DOCX]: Word Extensions to the Office Open XML (.docx) File Format
    // https://learn.microsoft.com/en-us/openspecs/office_standards/ms-docx/b839fe1f-e1ca-4fa6-8c26-5954d0abbccd
    "http://schemas.microsoft.com/office/word/2010/wordml": "wordml"
};

function injectNamespaces(string) {
    return ['<w:document',
        ' ',
        Object.keys(xmlNamespaceMap).map(key => `xmlns:${xmlNamespaceMap[key]}="${key}"`).join(' '),
        ' ',
        '>',
        string,
        "</w:document>",
    ].join('');
}

function read(xmlString) {
    xmlString = simplifyClarkNotation(xmlString);

    try {
        let result;
        result = xml.readString(xmlString, xmlNamespaceMap);
        result = collapseAlternateContent(result)[0];
        return result;
    } catch (e) {
        console.error('Could not parse xml string', e, xmlString);
        throw e;
    }
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

function simplifyClarkNotation(xmlString) {
    // console.debug('[SimplifyClarkNotation] Started. XML string:', xmlString);
    const result = transformToStandardXML(xmlString, xmlNamespaceMap);
    if (result !== xmlString) {
        // console.debug('[SimplifyClarkNotation] Changes. New XML string:', result);
    }
    return result;
}

function transformToStandardXML(xmlString, urlToName = {}) {
    const uriToPrefix = new Map();
    let prefixCount = 0;

    let result = xmlString;

    // Find all {uri}attr="value" using your regex
    const matches = [...result.matchAll(/\{([\w\/:\.]+)\}([a-z]+)="([^"]*)"/gi)];

    // Process from end to preserve indices
    for (let i = matches.length - 1; i >= 0; i--) {
        const match = matches[i];
        const fullMatch = match[0]; // {uri}attr="value"
        const uri = match[1];
        const attrName = match[2];
        const attrValue = match[3];
        const matchIndex = match.index;

        if (!uriToPrefix.has(uri)) {
            prefixCount++;
            const prefix = urlToName[uri] || `ns${prefixCount}`;
            uriToPrefix.set(uri, prefix);
        }

        const prefix = uriToPrefix.get(uri);

        // Find the complete opening tag that contains this match
        const beforeMatch = result.substring(0, matchIndex);
        const lastOpenTag = beforeMatch.lastIndexOf('<');
        let nextCloseTag = result.indexOf('/>', matchIndex);
        if (nextCloseTag === -1) {
            nextCloseTag = result.indexOf('>', matchIndex);
        } else {
            nextCloseTag = Math.min(nextCloseTag, result.indexOf('>', matchIndex));
        }

        // Insert xmlns into this tag if not already present
        const tagContent = result.substring(lastOpenTag, nextCloseTag);
        if (!tagContent.includes(`xmlns:${prefix}=`)) {
            const newTagContent = `${tagContent} xmlns:${prefix}="${uri}"`;
            result = result.substring(0, lastOpenTag) +
              newTagContent +
              result.substring(nextCloseTag);
        }

        // Replace clark notation with prefixed attribute
        const replacement = ` ${prefix}:${attrName}="${attrValue}"`;

        // Replace the full match
        result = result.substring(0, matchIndex) +
          replacement +
          result.substring(matchIndex + fullMatch.length);
    }

    return result;
}
