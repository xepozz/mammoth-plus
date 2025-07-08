var assert = require("assert");

var xmlreader = require("../../lib/xml/reader");

it('should read self-closing element', function() {
    return xmlreader.readString("<body/>").then(function(result) {
        assert.deepEqual({type: "element", name: "body", attributes: {}, children: []}, result);
    });
});

it('should read empty element with separate closing tag', function() {
    return xmlreader.readString("<body></body>").then(function(result) {
        assert.deepEqual({type: "element", name: "body", attributes: {}, children: []}, result);
    });
});

it('should read attributes of tags', function() {
    return xmlreader.readString('<body name="bob"/>').then(function(result) {
        assert.deepEqual({name: "bob"}, result.attributes);
    });
});

it('can read text element', function() {
    return xmlreader.readString('<body>Hello!</body>').then(function(result) {
        assert.deepEqual({type: "text", value: "Hello!"}, result.children[0]);
    });
});

it('should read element with children', function() {
    return xmlreader.readString("<body><a/><b/></body>").then(function(root) {
        assert.equal(2, root.children.length);
        assert.equal("a", root.children[0].name);
        assert.equal("b", root.children[1].name);
    });
});

it('unmapped namespaces URIs are included in braces as prefix', function() {
    return xmlreader.readString('<w:body xmlns:w="word"/>').then(function(result) {
        assert.deepEqual(result.name, "{word}body");
    });
});

it('mapped namespaces URIs are translated using map', function() {
    var namespaceMap = {
        "word": "x"
    };
    
    return xmlreader.readString('<w:body xmlns:w="word"/>', namespaceMap).then(function(result) {
        assert.deepEqual(result.name, "x:body");
    });
});

it('namespace of attributes is mapped to prefix', function() {
    var namespaceMap = {
        "word": "x"
    };
    var xmlString = '<w:body xmlns:w="word" w:val="Hello!"/>';
    return xmlreader.readString(xmlString, namespaceMap).then(function(result) {
        assert.deepEqual(result.attributes["x:val"], "Hello!");
    });
});

it('namespace of attributes is mapped to prefix', function() {
    var namespaceMap = {
        "word": "x"
    };
    var xmlString = `<w:document xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" >
    <m:r>
        <m:t{http://www.w3.org/XML/1998/namespace}space="preserve"> ∈ 
        G</m:t>
    </m:r>
    </w:document>`;
    return xmlreader.readString(xmlString, namespaceMap).then(function(result) {
        let child = result.children[1].children[1];
        assert.equal(typeof child == "object", true);
        assert.deepEqual( child, {
            "attributes": {
                "{http://www.w3.org/XML/1998/namespace}space": "preserve"
            },
            "children": [
                {
                    "type": "text",
                    "value": " ∈ \n        G"
                }
            ],
            "name": "{http://schemas.openxmlformats.org/officeDocument/2006/math}t",
            "type": "element"
        });
    });
});

it('can find first element with name', function() {
    return xmlreader.readString('<body><a/><b index="1"/><b index="2"/></body>').then(function(result) {
        var first = result.first("b");
        assert.equal("1", first.attributes.index);
    });
});

it('whitespace between xml declaration and root tag is ignored', function() {
    return xmlreader.readString('<?xml version="1.0" ?>\n<body/>').then(function(result) {
        assert.deepEqual("body", result.name);
    });
});

it('error if XML is badly formed', function() {
    return xmlreader.readString("<bo").then(function(result) {
        throw new Error("Expected failure");
    }, function(error) {
        assert.ok(error);
        return 1;
    });
});
