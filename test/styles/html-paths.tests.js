var assert = require("assert");


var htmlPaths = require("../../lib/styles/html-paths");


it("element can match multiple tag names", function() {
    var pathPart = htmlPaths.element(["ul", "ol"]);
    assert.ok(pathPart.matchesElement({tagName: "ul"}));
    assert.ok(pathPart.matchesElement({tagName: "ol"}));
    assert.ok(!pathPart.matchesElement({tagName: "p"}));
});

it("element matches if attributes are the same", function() {
    var pathPart = htmlPaths.element(["p"], {"class": "tip"});
    assert.ok(!pathPart.matchesElement({tagName: "p"}));
    assert.ok(!pathPart.matchesElement({tagName: "p", attributes: {"class": "tip help"}}));
    assert.ok(pathPart.matchesElement({tagName: "p", attributes: {"class": "tip"}}));
});

