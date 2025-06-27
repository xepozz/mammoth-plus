var assert = require("assert");

var _ = require("underscore");

var documents = require("../lib/documents");
var transforms = require("../lib/transforms");



describe("paragraph()", function () {
    it("paragraph is transformed", function() {
        var paragraph = documents.paragraph([]);
        var result = transforms.paragraph(function() {
            return documents.tab();
        })(paragraph);
        assert.deepEqual(result, documents.tab());
    })
    
    it("non-paragraph elements are not transformed", function() {
        var run = documents.run([]);
        var result = transforms.paragraph(function() {
            return documents.tab();
        })(run);
        assert.deepEqual(result, documents.run([]));
    })
});


describe("run()", function () {
    it("run is transformed", function() {
        var run = documents.run([]);
        var result = transforms.run(function() {
            return documents.tab();
        })(run);
        assert.deepEqual(result, documents.tab());
    })
    
    it("non-run elements are not transformed", function() {
        var paragraph = documents.paragraph([]);
        var result = transforms.run(function() {
            return documents.tab();
        })(paragraph);
        assert.deepEqual(result, documents.paragraph([]));
    })
});


describe("elements()", function () {
    it("all descendants are transformed", function() {
        var root = {
            children: [
                {
                    children: [
                        {}
                    ]
                }
            ]
        };
        var currentCount = 0;
        function setCount(node) {
            currentCount++;
            return _.extend(node, {count: currentCount});
        }
        
        var result = transforms._elements(setCount)(root);
        
        assert.deepEqual(result, {
            count: 3,
            children: [
                {
                    count: 2,
                    children: [
                        {count: 1}
                    ]
                }
            ]
        });
    })
});


describe("getDescendants()", function () {
    it("returns nothing if element has no children property", function() {
        assert.deepEqual(transforms.getDescendants({}), []);
    })
    
    it("returns nothing if element has empty children", function() {
        assert.deepEqual(transforms.getDescendants({children: []}), []);
    })
    
    it("includes children", function() {
        var element = {
            children: [{name: "child 1"}, {name: "child 2"}]
        };
        assert.deepEqual(
            transforms.getDescendants(element),
            [{name: "child 1"}, {name: "child 2"}]
        );
    })
    
    it("includes indirect descendants", function() {
        var grandchild = {name: "grandchild"};
        var child = {name: "child", children: [grandchild]};
        var element = {children: [child]};
        assert.deepEqual(
            transforms.getDescendants(element),
            [grandchild, child]
        );
    })
});


describe("getDescendantsOfType()", function() {
    it("filters descendants to type", function() {
        var paragraph = {type: "paragraph"};
        var run = {type: "run"};
        var element = {
            children: [paragraph, run]
        };
        assert.deepEqual(
            transforms.getDescendantsOfType(element, "run"),
            [run]
        );
    });
});
