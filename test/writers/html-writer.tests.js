var assert = require("assert");


var htmlWriter = require("../../lib/writers/html-writer");


it('can generate simple paragraph', function() {
    var writer = htmlWriter.writer();
    writer.open("p");
    writer.text("Hello");
    writer.close("p");
    return assert.equal(writer.asString(), "<p>Hello</p>");
});

it('can nest elements', function() {
    var writer = htmlWriter.writer();
    writer.open("ul");
    writer.open("li");
    writer.text("One");
    writer.close("li");
    writer.open("li");
    writer.text("Two");
    writer.close("li");
    writer.close("ul");
    return assert.equal(writer.asString(), "<ul><li>One</li><li>Two</li></ul>");
});

it('indents text if prettyPrint is true', function() {
    var writer = htmlWriter.writer({prettyPrint: true});
    writer.open("p");
    writer.text("One");
    writer.close("p");
    writer.open("p");
    writer.text("Two");
    writer.close("p");
    return assert.equal(writer.asString(), "<p>\n  One\n</p>\n<p>\n  Two\n</p>");
});

it('indents element if prettyPrint is true', function() {
    var writer = htmlWriter.writer({prettyPrint: true});
    writer.open("ul");
    writer.open("li");
    writer.text("One");
    writer.close("li");
    writer.open("li");
    writer.text("Two");
    writer.close("li");
    writer.close("ul");
    return assert.equal(writer.asString(), "<ul>\n  <li>\n    One\n  </li>\n  <li>\n    Two\n  </li>\n</ul>");
});

it('when prettyPrint is true inner elements do not have new lines', function() {
    var writer = htmlWriter.writer({prettyPrint: true});
    writer.open("p");
    writer.text("One");
    writer.open("em");
    writer.text("Two");
    writer.close("em");
    writer.close("p");
    return assert.equal(writer.asString(), "<p>\n  One<em>Two</em>\n</p>");
});

it('indents closing element correctly when nested inside another indented element', function() {
    var writer = htmlWriter.writer({prettyPrint: true});
    writer.open("div");
    writer.open("div");
    writer.open("div");
    writer.text("Hello");
    writer.close("div");
    writer.close("div");
    writer.close("div");
    return assert.equal(writer.asString(), "<div>\n  <div>\n    <div>\n      Hello\n    </div>\n  </div>\n</div>");
});

it('newlines in text are indented', function() {
    var writer = htmlWriter.writer({prettyPrint: true});
    writer.open("p");
    writer.text("One\nTwo");
    writer.close("p");
    return assert.equal(writer.asString(), "<p>\n  One\n  Two\n</p>");
});

it('run of text has only one new line', function() {
    var writer = htmlWriter.writer({prettyPrint: true});
    writer.open("p");
    writer.text("One");
    writer.text("Two");
    writer.close("p");
    return assert.equal(writer.asString(), "<p>\n  OneTwo\n</p>");
});

it('run of html has only one new line', function() {
    var writer = htmlWriter.writer({prettyPrint: true});
    writer.open("p");
    writer.text("One");
    writer.text("Two");
    writer.close("p");
    return assert.equal(writer.asString(), "<p>\n  OneTwo\n</p>");
});

it('self closing elements are indented', function() {
    var writer = htmlWriter.writer({prettyPrint: true});
    writer.open("p");
    writer.selfClosing("br");
    writer.close("p");
    return assert.equal(writer.asString(), "<p>\n  <br />\n</p>");
});

it('newlines in appended HTML are indented', function() {
    var writer = htmlWriter.writer({prettyPrint: true});
    writer.open("p");
    writer.text("One\nTwo");
    writer.close("p");
    return assert.equal(writer.asString(), "<p>\n  One\n  Two\n</p>");
});

it('newlines in <pre> are not indented', function() {
    var writer = htmlWriter.writer({prettyPrint: true});
    writer.open("pre");
    writer.text("One\nTwo");
    writer.close("pre");
    return assert.equal(writer.asString(), "<pre>One\nTwo</pre>");
});

it('newlines in element in <pre> are not indented', function() {
    var writer = htmlWriter.writer({prettyPrint: true});
    writer.open("pre");
    writer.open("p");
    writer.text("One\nTwo");
    writer.close("p");
    writer.close("pre");
    return assert.equal(writer.asString(), "<pre><p>One\nTwo</p></pre>");
});
