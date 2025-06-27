var assert = require("assert");
var htmlPaths = require("../lib/styles/html-paths");
var documentMatchers = require("../lib/styles/document-matchers");
var styleReader = require("../lib/style-reader");
var results = require("../lib/results");

var readHtmlPath = styleReader.readHtmlPath;
var readDocumentMatcher = styleReader.readDocumentMatcher;
var readStyle = styleReader.readStyle;


describe('styleReader.readHtmlPath', function() {
    it('reads empty path', function() {
        assertHtmlPath("", htmlPaths.empty);
    });

    it('reads single element', function() {
        assertHtmlPath("p", htmlPaths.elements(["p"]));
    });

    it('reads choice of elements', function() {
        assertHtmlPath(
            "ul|ol",
            htmlPaths.elements([
                htmlPaths.element(["ul", "ol"])
            ])
        );
    });

    it('reads nested elements', function() {
        assertHtmlPath("ul > li", htmlPaths.elements(["ul", "li"]));
    });

    it('reads class on element', function() {
        var expected = htmlPaths.elements([
            htmlPaths.element("p", {"class": "tip"})
        ]);
        assertHtmlPath("p.tip", expected);
    });

    it('reads class with escaped colon', function() {
        var expected = htmlPaths.elements([
            htmlPaths.element("p", {"class": "a:b"})
        ]);
        assertHtmlPath("p.a\\:b", expected);
    });

    it('reads multiple classes on element', function() {
        var expected = htmlPaths.elements([
            htmlPaths.element("p", {"class": "tip help"})
        ]);
        assertHtmlPath("p.tip.help", expected);
    });

    it('reads attribute on element', function() {
        var expected = htmlPaths.elements([
            htmlPaths.element("p", {"lang": "fr"})
        ]);
        assertHtmlPath("p[lang='fr']", expected);
    });

    it('reads multiple attributes on element', function() {
        var expected = htmlPaths.elements([
            htmlPaths.element("p", {"lang": "fr", "data-x": "y"})
        ]);
        assertHtmlPath("p[lang='fr'][data-x='y']", expected);
    });

    it('reads when element must be fresh', function() {
        var expected = htmlPaths.elements([
            htmlPaths.element("p", {}, {"fresh": true})
        ]);
        assertHtmlPath("p:fresh", expected);
    });

    it('reads separator for elements', function() {
        var expected = htmlPaths.elements([
            htmlPaths.element("p", {}, {separator: "x"})
        ]);
        assertHtmlPath("p:separator('x')", expected);
    });

    it('reads separator with escape sequence', function() {
        var expected = htmlPaths.elements([
            htmlPaths.element("p", {}, {separator: "\r\n\t\'\\"})
        ]);
        assertHtmlPath("p:separator('\\r\\n\\t\\'\\\\')", expected);
    });

    it('reads ignore element', function() {
        assertHtmlPath("!", htmlPaths.ignore);
    });
});

function assertHtmlPath(input, expected) {
    assert.deepEqual(readHtmlPath(input), results.success(expected));
}

describe("styleReader.readDocumentMatcher", function() {
    it("reads plain paragraph", function() {
        assertDocumentMatcher("p", documentMatchers.paragraph());
    });

    it("reads paragraph with style ID", function() {
        assertDocumentMatcher(
            "p.Heading1",
            documentMatchers.paragraph({styleId: "Heading1"})
        );
    });

    it("reads paragraph with exact style name", function() {
        assertDocumentMatcher(
            "p[style-name='Heading 1']",
            documentMatchers.paragraph({styleName: documentMatchers.equalTo("Heading 1")})
        );
    });

    it("reads paragraph with style name prefix", function() {
        assertDocumentMatcher(
            "p[style-name^='Heading']",
            documentMatchers.paragraph({styleName: documentMatchers.startsWith("Heading")})
        );
    });

    it("reads p:ordered-list(1) as ordered list with index of 0", function() {
        assertDocumentMatcher(
            "p:ordered-list(1)",
            documentMatchers.paragraph({list: {isOrdered: true, levelIndex: 0}})
        );
    });

    it("reads p:unordered-list(1) as unordered list with index of 0", function() {
        assertDocumentMatcher(
            "p:unordered-list(1)",
            documentMatchers.paragraph({list: {isOrdered: false, levelIndex: 0}})
        );
    });

    it("reads plain run", function() {
        assertDocumentMatcher(
            "r",
            documentMatchers.run()
        );
    });

    it("reads plain table", function() {
        assertDocumentMatcher("table", documentMatchers.table());
    });

    it("reads table with style ID", function() {
        assertDocumentMatcher(
            "table.TableNormal",
            documentMatchers.table({
                styleId: "TableNormal"
            })
        );
    });

    it("reads table with style name", function() {
        assertDocumentMatcher(
            "table[style-name='Normal Table']",
            documentMatchers.table({
                styleName: documentMatchers.equalTo("Normal Table")
            })
        );
    });

    it("reads bold", function() {
        assertDocumentMatcher(
            "b",
            documentMatchers.bold
        );
    });

    it("reads italic", function() {
        assertDocumentMatcher(
            "i",
            documentMatchers.italic
        );
    });

    it("reads underline", function() {
        assertDocumentMatcher(
            "u",
            documentMatchers.underline
        );
    });

    it("reads strikethrough", function() {
        assertDocumentMatcher(
            "strike",
            documentMatchers.strikethrough
        );
    });

    it("reads all-caps", function() {
        assertDocumentMatcher(
            "all-caps",
            documentMatchers.allCaps
        );
    });

    it("reads small-caps", function() {
        assertDocumentMatcher(
            "small-caps",
            documentMatchers.smallCaps
        );
    });

    it("reads highlight without color", function() {
        assertDocumentMatcher(
            "highlight",
            documentMatchers.highlight()
        );
    });

    it("reads highlight with color", function() {
        assertDocumentMatcher(
            "highlight[color='yellow']",
            documentMatchers.highlight({color: "yellow"})
        );
    });

    it("reads comment-reference", function() {
        assertDocumentMatcher(
            "comment-reference",
            documentMatchers.commentReference
        );
    });

    it("reads line breaks", function() {
        assertDocumentMatcher(
            "br[type='line']",
            documentMatchers.lineBreak
        );
    });

    it("reads page breaks", function() {
        assertDocumentMatcher(
            "br[type='page']",
            documentMatchers.pageBreak
        );
    });

    it("reads column breaks", function() {
        assertDocumentMatcher(
            "br[type='column']",
            documentMatchers.columnBreak
        );
    });
});

function assertDocumentMatcher(input, expected) {
    assert.deepEqual(readDocumentMatcher(input), results.success(expected));
}

describe("styleReader.read", function() {
    it("document matcher is mapped to HTML path using arrow", function() {
        assertStyleMapping(
            "p => h1",
            {
                from: documentMatchers.paragraph(),
                to: htmlPaths.elements(["h1"])
            }
        );
    });

    it("reads style mapping with no HTML path", function() {
        assertStyleMapping(
            "r =>",
            {
                from: documentMatchers.run(),
                to: htmlPaths.empty
            }
        );
    });

    it("error when not all input is consumed", function() {
        assert.deepEqual(
            readStyle("r => span a"),
            new results.Result(null, [results.warning("Did not understand this style mapping, so ignored it: r => span a\nError was at character number 10: Expected end but got whitespace")])
        );
    });
});

function assertStyleMapping(input, expected) {
    assert.deepEqual(readStyle(input), results.success(expected));
}
