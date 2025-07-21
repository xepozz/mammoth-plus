var assert = require("assert");
var child_process = require("child_process"); // eslint-disable-line camelcase
var path = require("path");
var fs = require("fs");

var temp = require('temp').track();

var promises = require("../lib/promises");

var testPath = require("./testing").testPath;

describe("main tests", function() {

    it("HTML is printed to stdout if output file is not set", function() {
        return runMammothPlus(testPath("single-paragraph.docx")).then(function(result) {
            assert.equal(result.stderrOutput, "");
            assert.equal(result.output, "<p>Walking on imported air</p>");
        });
    });

    it("HTML is written to file if output file is set", function() {
        const tempDir = temp.mkdirSync();
        var outputPath = path.join(tempDir, "output.html");
        return runMammothPlus(testPath("single-paragraph.docx"), outputPath).then(function(result) {
            assert.equal(result.stderrOutput, "");
            assert.equal(result.output, "");
            assert.equal(fs.readFileSync(outputPath, "utf8"), "<p>Walking on imported air</p>");
        });
    });

    var imageBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAIAAAACUFjqAAAAAXNSR0IArs4c6QAAAAlwSFlzAAAOvgAADr4B6kKxwAAAABNJREFUKFNj/M+ADzDhlWUYqdIAQSwBE8U+X40AAAAASUVORK5CYII=";

    it("inline images are included in output if writing to single file", function() {
        return runMammothPlus(testPath("tiny-picture.docx")).then(function(result) {
            assert.equal(result.stderrOutput, "");
            assert.equal(result.output, '<p><img src="data:image/png;base64,' + imageBase64 + '" width="7.5" height="7.5" /></p>');
        });
    });

    it("images are written to separate files if output dir is set", function() {
        return createTempDir().then(function(tempDir) {
            var outputPath = path.join(tempDir, "tiny-picture.html");
            var imagePath = path.join(tempDir, "1.png");
            return runMammothPlus(testPath("tiny-picture.docx"), "--output-dir", tempDir).then(function(result) {
                assert.equal(result.stderrOutput, "");
                assert.equal(result.output, "");
                assert.equal(fs.readFileSync(outputPath, "utf8"), '<p><img src="1.png" /></p>');
                assert.equal(fs.readFileSync(imagePath, "base64"), imageBase64);
            });
        });
    });

    it("style map is used if set", function() {
        return createTempDir().then(function(tempDir) {
            var styleMapPath = path.join(tempDir, "style-map");
            fs.writeFileSync(styleMapPath, "p => span:fresh");
            return runMammothPlus(testPath("single-paragraph.docx"), "--style-map", styleMapPath).then(function(result) {
                assert.equal(result.stderrOutput, "");
                assert.equal(result.output, "<span>Walking on imported air</span>");
            });
        });
    });

    it("--output-format=markdown option generate markdown output", function() {
        return runMammothPlus(testPath("single-paragraph.docx"), "--output-format=markdown").then(function(result) {
            assert.equal(result.stderrOutput, "");
            assert.equal(result.output, "Walking on imported air\n\n");
        });
    });


    function runMammothPlus() {
        var args = Array.prototype.slice.call(arguments, 0);
        var deferred = promises.defer();

        var processArgs = ["node", "bin/mammoth"].concat(args);
        // TODO: proper escaping of args
        var command = processArgs.join(" ");
        child_process.exec(command, function(error, stdout, stderr) { // eslint-disable-line camelcase
            console.log(stderr);
            assert.equal(error, null);
            deferred.resolve({output: stdout, stderrOutput: stderr});
        });

        return deferred.promise;
    }

    function createTempDir() {
        return promises.nfcall(temp.mkdirSync, null);
    }

});
