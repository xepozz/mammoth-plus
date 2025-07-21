var assert = require("assert");

var xmlreader = require("../../lib/xml/reader");

describe("reader tests", function() {

    it('should read self-closing element', function () {
        const result = xmlreader.readString("<body/>");
        assert.deepEqual({type: "element", name: "body", attributes: {}, children: []}, result);
    });

    it('should read empty element with separate closing tag', function () {
        const result = xmlreader.readString("<body></body>");
        assert.deepEqual({type: "element", name: "body", attributes: {}, children: []}, result);
    });

    it('should read attributes of tags', function () {
        const result = xmlreader.readString('<body name="bob"/>');
        assert.deepEqual({name: "bob"}, result.attributes);
    });

    it('can read text element', function () {
        const result = xmlreader.readString('<body>Hello!</body>');
        assert.deepEqual({type: "text", value: "Hello!"}, result.children[0]);
    });

    it('should read element with children', function () {
        const root = xmlreader.readString("<body><a/><b/></body>");
        assert.equal(2, root.children.length);
        assert.equal("a", root.children[0].name);
        assert.equal("b", root.children[1].name);
    });

    it('unmapped namespaces URIs are included in braces as prefix', function () {
        const result = xmlreader.readString('<w:body xmlns:w="word"/>');
        assert.deepEqual(result.name, "{word}body");
    });

    it('mapped namespaces URIs are translated using map', function () {
        var namespaceMap = {
            "word": "x"
        };

        const result = xmlreader.readString('<w:body xmlns:w="word"/>', namespaceMap);
        assert.deepEqual(result.name, "x:body");
    });

    it('namespace of attributes is mapped to prefix 1', function () {
        var namespaceMap = {
            "word": "x"
        };
        var xmlString = '<w:body xmlns:w="word" w:val="Hello!"/>';
        const result = xmlreader.readString(xmlString, namespaceMap);
        assert.deepEqual(result.attributes["x:val"], "Hello!");
    });

    it('can find first element with name', function () {
        const result = xmlreader.readString('<body><a/><b index="1"/><b index="2"/></body>');
        var first = result.first("b");
        assert.equal("1", first.attributes.index);
    });

    it('whitespace between xml declaration and root tag is ignored', function () {
        const result = xmlreader.readString('<?xml version="1.0" ?>\n<body/>');
        assert.deepEqual("body", result.name);
    });

    it('error if XML is badly formed', function () {
        const result = xmlreader.readString("<bo");
        assert.ok(result instanceof Error);
    });
});
