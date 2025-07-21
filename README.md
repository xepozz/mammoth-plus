# mammoth .docx to HTML converter

mammoth is inspired by [Mammoth](https://github.com/mwilliamson/mammoth.js) and based on [Mammoth(v1.5.1)](https://github.com/mwilliamson/mammoth.js).

mammoth expands some features that [Mammoth](https://github.com/mwilliamson/mammoth.js) do not have, such as support math, styling, image size...

The following features are currently supported:

-   Headings.

-   Lists.

-   Customisable mapping from your own docx styles to HTML.
    For instance, you could convert `WarningHeading` to `h1.warning` by providing an appropriate style mapping.

-   Tables.
    The formatting of the table itself, such as borders, is currently ignored,
    but the formatting of the text is treated the same as in the rest of the document.

-   Footnotes and endnotes.

-   Images.

-   Bold, italics, underlines, strikethrough, superscript, subscript, font color, text highlight color and text align.

-   Links.

-   Line breaks.

-   Text boxes. The contents of the text box are treated as a separate paragraph
    that appears after the paragraph containing the text box.

-   Comments.

-   math.

## Web demo

Try in [here](https://ihwf.github.io/mammoth-plus/)

## Installation

    npm install mammoth

## Usage

### Library

mammoth can be required/import in the usual way:

```javascript
var mammothPlus = require('mammoth')
// or
import mammothPlus from 'mammoth'
```

If not use module system,
to generate a standalone JavaScript file for the browser,
use `mammoth.min.js` (generate using `make setup` if it is not already present).
`mammothPlus` is set as a window global.

The file can be generated using `make setup` during development.

#### Basic conversion

To convert an existing .docx file to HTML, use `mammothPlus.convertToHtml`:

```javascript
var mammothPlus = require('mammoth')

mammothPlus
    .convertToHtml({
        path: 'path/to/document.docx', // in node.js
        arrayBuffer: 'array buffer containing a .docx file' // in browser
    })
    .then(function (result) {
        var html = result.value // The generated HTML
        var messages = result.messages // Any messages, such as warnings during conversion
    })
    .catch(function(error) {
        console.error(error);
    });
```

Note that `mammothPlus.convertToHtml` returns a [promise](http://promises-aplus.github.io/promises-spec/).

You can also extract the raw text of the document by using `mammothPlus.extractRawText`.
This will ignore all formatting in the document.
Each paragraph is followed by two newlines.

```javascript
mammothPlus
    .extractRawText({
        path: 'path/to/document.docx', // in node.js
        arrayBuffer: 'array buffer containing a .docx file' // in browser
    })
    .then(function (result) {
        var text = result.value // The raw text
        var messages = result.messages
    })
    .catch(function(error) {
        console.error(error);
    });
```

#### Custom style map

By default,
mammoth maps some common .docx styles to HTML elements.
For instance,
a paragraph with the style name `Heading 1` is converted to a `h1` element.
You can pass in a custom map for styles by passing an options object with a `styleMap` property as a second argument to `convertToHtml`.
A description of the syntax for style maps can be found in the section ["Writing style maps"](#writing-style-maps).
For instance, if paragraphs with the style name `Section Title` should be converted to `h1` elements,
and paragraphs with the style name `Subsection Title` should be converted to `h2` elements:

```javascript
var mammothPlus = require('mammoth')

var options = {
    styleMap: [
        "p[style-name='Section Title'] => h1:fresh",
        "p[style-name='Subsection Title'] => h2:fresh"
    ]
}
mammothPlus.convertToHtml(
    {
        path: 'path/to/document.docx', // in node.js
        arrayBuffer: 'array buffer containing a .docx file' // in browser
    },
    options
)
```

To more easily support style maps stored in text files,
`styleMap` can also be a string.
Each line is treated as a separate style mapping,
ignoring blank lines and lines starting with `#`:

```javascript
var options = {
    styleMap:
        "p[style-name='Section Title'] => h1:fresh\n" +
        "p[style-name='Subsection Title'] => h2:fresh"
}
```

User-defined style mappings are used in preference to the default style mappings.
To stop using the default style mappings altogether,
set `options.includeDefaultStyleMap` to `false`:

```javascript
var options = {
    styleMap: [
        "p[style-name='Section Title'] => h1:fresh",
        "p[style-name='Subsection Title'] => h2:fresh"
    ],
    includeDefaultStyleMap: false
}
```

#### Custom image handlers

By default, images are converted to `<img>` elements with the source included inline in the `src` attribute.
This behaviour can be changed by setting the `convertImage` option to an [image converter](#image-converters) .

For instance, the following would replicate the default behaviour:

```javascript
var options = {
    convertImage: mammothPlus.images.imgElement(function (image) {
        return image.read('base64').then(function (imageBuffer) {
            return {
                src: 'data:' + image.contentType + ';base64,' + imageBuffer
            }
        })
    })
}
```

#### Bold

By default, bold text is wrapped in `<strong>` tags.
This behaviour can be changed by adding a style mapping for `b`.
For instance, to wrap bold text in `<em>` tags:

```javascript
var mammothPlus = require('mammoth')

var options = {
    styleMap: ['b => em']
}
mammothPlus.convertToHtml(
    {
        path: 'path/to/document.docx', // in node.js
        arrayBuffer: 'array buffer containing a .docx file' // in browser
    },
    options
)
```

#### Italic

By default, italic text is wrapped in `<em>` tags.
This behaviour can be changed by adding a style mapping for `i`.
For instance, to wrap italic text in `<strong>` tags:

```javascript
var mammothPlus = require('mammoth')

var options = {
    styleMap: ['i => strong']
}
mammothPlus.convertToHtml(
    {
        path: 'path/to/document.docx', // in node.js
        arrayBuffer: 'array buffer containing a .docx file' // in browser
    },
    options
)
```

#### Underline

By default, the underlining of any text is ignored since underlining can be confused with links in HTML documents.
This behaviour can be changed by adding a style mapping for `u`.
For instance, suppose that a source document uses underlining for emphasis.
The following will wrap any explicitly underlined source text in `<em>` tags:

```javascript
var mammothPlus = require('mammoth')

var options = {
    styleMap: ['u => em']
}
mammothPlus.convertToHtml(
    {
        path: 'path/to/document.docx', // in node.js
        arrayBuffer: 'array buffer containing a .docx file' // in browser
    },
    options
)
```

#### Strikethrough

By default, strikethrough text is wrapped in `<s>` tags.
This behaviour can be changed by adding a style mapping for `strike`.
For instance, to wrap strikethrough text in `<del>` tags:

```javascript
var mammothPlus = require('mammoth')

var options = {
    styleMap: ['strike => del']
}
mammothPlus.convertToHtml(
    {
        path: 'path/to/document.docx', // in node.js
        arrayBuffer: 'array buffer containing a .docx file' // in browser
    },
    options
)
```

#### Comments

By default, comments are ignored.
To include comments in the generated HTML,
add a style mapping for `comment-reference`.
For instance:

```javascript
var mammothPlus = require('mammoth')

var options = {
    styleMap: ['comment-reference => sup']
}
mammothPlus.convertToHtml(
    {
        path: 'path/to/document.docx', // in node.js
        arrayBuffer: 'array buffer containing a .docx file' // in browser
    },
    options
)
```

Comments will be appended to the end of the document,
with links to the comments wrapped using the specified style mapping.

### CLI

You can convert docx files by passing the path to the docx file and the output file.
For instance:

    mammoth document.docx output.html

If no output file is specified, output is written to stdout instead.

The output is an HTML fragment, rather than a full HTML document, encoded with UTF-8.
Since the encoding is not explicitly set in the fragment,
opening the output file in a web browser may cause Unicode characters to be rendered incorrectly if the browser doesn't default to UTF-8.

#### Images

By default, images are included inline in the output HTML.
If an output directory is specified by `--output-dir`,
the images are written to separate files instead.
For instance:

    mammoth document.docx --output-dir=output-dir

Existing files will be overwritten if present.

#### Styles

A custom style map can be read from a file using `--style-map`.
For instance:

    mammoth document.docx output.html --style-map=custom-style-map

Where `custom-style-map` looks something like:

    p[style-name='Aside Heading'] => div.aside > h2:fresh
    p[style-name='Aside Text'] => div.aside > p:fresh

A description of the syntax for style maps can be found in the section ["Writing style maps"](#writing-style-maps).

#### Markdown

Markdown support is deprecated.
Generating HTML and using a separate library to convert the HTML to Markdown is recommended,
and is likely to produce better results.

Using `--output-format=markdown` will cause Markdown to be generated.
For instance:

    mammoth document.docx --output-format=markdown

### API

#### `mammothPlus.convertToHtml(input, options)`

Converts the source document to HTML.

-   `input`: an object describing the source document.
    On node.js, the following inputs are supported:

    -   `{path: path}`, where `path` is the path to the .docx file.
    -   `{buffer: buffer}`, where `buffer` is a node.js Buffer containing a .docx file.

    In the browser, the following inputs are supported:

    -   `{arrayBuffer: arrayBuffer}`, where `arrayBuffer` is an array buffer containing a .docx file.

-   `options` (optional): options for the conversion.
    May have the following properties:

    -   `styleMap`: controls the mapping of Word styles to HTML.
        If `options.styleMap` is a string,
        each line is treated as a separate style mapping,
        ignoring blank lines and lines starting with `#`:
        If `options.styleMap` is an array,
        each element is expected to be a string representing a single style mapping.
        See ["Writing style maps"](#writing-style-maps) for a reference to the syntax for style maps.

    -   `includeEmbeddedStyleMap`: by default,
        if the document contains an embedded style map, then it is combined with the default style map.
        To ignore any embedded style maps,
        set `options.includeEmbeddedStyleMap` to `false`.

    -   `includeDefaultStyleMap`: by default,
        the style map passed in `styleMap` is combined with the default style map.
        To stop using the default style map altogether,
        set `options.includeDefaultStyleMap` to `false`.

    -   `convertImage`: by default, images are converted to `<img>` elements with the source included inline in the `src` attribute.
        Set this option to an [image converter](#image-converters) to override the default behaviour.

    -   `ignoreEmptyParagraphs`: by default, empty paragraphs are ignored.
        Set this option to `false` to preserve empty paragraphs in the output.

    -   `idPrefix`:
        a string to prepend to any generated IDs,
        such as those used by bookmarks, footnotes and endnotes.
        Defaults to an empty string.

    -   `transformDocument`: if set,
        this function is applied to the document read from the docx file before the conversion to HTML.
        The API for document transforms should be considered unstable.
        See [document transforms](#document-transforms).

-   Returns a promise containing a result.
    This result has the following properties:

    -   `value`: the generated HTML

    -   `messages`: any messages, such as errors and warnings, generated during the conversion

#### `mammothPlus.convertToMarkdown(input, options)`

Markdown support is deprecated.
Generating HTML and using a separate library to convert the HTML to Markdown is recommended,
and is likely to produce better results.

Converts the source document to Markdown.
This behaves the same as `convertToHtml`,
except that the `value` property of the result contains Markdown rather than HTML.

#### `mammothPlus.extractRawText(input)`

Extract the raw text of the document.
This will ignore all formatting in the document.
Each paragraph is followed by two newlines.

-   `input`: an object describing the source document.
    On node.js, the following inputs are supported:

    -   `{path: path}`, where `path` is the path to the .docx file.
    -   `{buffer: buffer}`, where `buffer` is a node.js Buffer containing a .docx file.

    In the browser, the following inputs are supported:

    -   `{arrayBuffer: arrayBuffer}`, where `arrayBuffer` is an array buffer containing a .docx file.

-   Returns a promise containing a result.
    This result has the following properties:

    -   `value`: the raw text

    -   `messages`: any messages, such as errors and warnings

#### `mammothPlus.embedStyleMap(input, styleMap)`

Given an existing docx file,
`embedStyleMap` will generate a new docx file with the passed style map embedded.
When the new docx file is read by mammoth,
it will use the embedded style map.

-   `input`: an object describing the source document.
    On node.js, the following inputs are supported:

    -   `{path: path}`, where `path` is the path to the .docx file.
    -   `{buffer: buffer}`, where `buffer` is a node.js Buffer containing a .docx file.

    In the browser, the following inputs are supported:

    -   `{arrayBuffer: arrayBuffer}`, where `arrayBuffer` is an array buffer containing a .docx file.

-   `styleMap`: the style map to embed.

* Returns a promise.
  Call `toArrayBuffer()` on the value inside the promise to get an `ArrayBuffer` representing the new document.
  Call `toBuffer()` on the value inside the promise to get a `Buffer` representing the new document.

For instance:

```javascript
mammothPlus
    .embedStyleMap(
        { path: sourcePath },
        "p[style-name='Section Title'] => h1:fresh"
    )
    .then(function (docx) {
        fs.writeFile(destinationPath, docx.toBuffer(), callback)
    })
```

#### Messages

Each message has the following properties:

-   `type`: a string representing the type of the message, such as `"warning"` or
    `"error"`

-   `message`: a string containing the actual message

-   `error` (optional): the thrown exception that caused this message, if any

#### Image converters

An image converter can be created by calling `mammothPlus.images.imgElement(func)`.
This creates an `<img>` element for each image in the original docx.
`func` should be a function that has one argument `image`.
This argument is the image element being converted,
and has the following properties:

* `contentType`: the content type of the image, such as `image/png`.

* `readAsArrayBuffer()`: read the image file as an `ArrayBuffer`.
  Returns a promise of an `ArrayBuffer`.

* `readAsBuffer()`: read the image file as a `Buffer`.
  Returns a promise of a `Buffer`.
  This is not supported in browsers unless a `Buffer` polyfill has been used.

* `readAsBase64String()`: read the image file as a base64-encoded string.
  Returns a promise of a `string`.

* `read([encoding])` (deprecated): read the image file with the specified encoding.
  If an encoding is specified, a promise of a `string` is returned.
  If no encoding is specified, a promise of a `Buffer` is returned.

`func` should return an object (or a promise of an object) of attributes for the `<img>` element.
At a minimum, this should include the `src` attribute.
If any alt text is found for the image,
this will be automatically added to the element's attributes.

For instance, the following replicates the default image conversion:

```javascript
mammothPlus.images.imgElement(function(image) {
    return image.readAsBase64String().then(function(imageBuffer) {
        return {
            src: 'data:' + image.contentType + ';base64,' + imageBuffer
        }
    })
})
```

`mammothPlus.images.dataUri` is the default image converter.

### Document transforms

**The API for document transforms should be considered unstable,
and may change between any versions.
If you rely on this behaviour,
you should pin to a specific version of mammoth.js,
and test carefully before updating.**

mammoth allows a document to be transformed before it is converted.
For instance,
suppose that document has not been semantically marked up,
but you know that any centre-aligned paragraph should be a heading.
You can use the `transformDocument` argument to modify the document appropriately:

```javascript
function transformElement(element) {
    if (element.children) {
        var children = _.map(element.children, transformElement)
        element = { ...element, children: children }
    }

    if (element.type === 'paragraph') {
        element = transformParagraph(element)
    }

    return element
}

function transformParagraph(element) {
    if (element.alignment === 'center' && !element.styleId) {
        return { ...element, styleId: 'Heading2' }
    } else {
        return element
    }
}

var options = {
    transformDocument: transformElement
}
```

The return value of `transformDocument` is used during HTML generation.

The above can be written more succinctly using the helper `mammothPlus.transforms.paragraph`:

```javascript
function transformParagraph(element) {
    if (element.alignment === 'center' && !element.styleId) {
        return { ...element, styleId: 'Heading2' }
    } else {
        return element
    }
}

var options = {
    transformDocument: mammothPlus.transforms.paragraph(transformParagraph)
}
```

Or if you want paragraphs that have been explicitly set to use monospace fonts to represent code:

```javascript
const monospaceFonts = ['consolas', 'courier', 'courier new']

function transformParagraph(paragraph) {
    var runs = mammothPlus.transforms.getDescendantsOfType(paragraph, 'run')
    var isMatch =
        runs.length > 0 &&
        runs.every(function (run) {
            return (
                run.font &&
                monospaceFonts.indexOf(run.font.toLowerCase()) !== -1
            )
        })
    if (isMatch) {
        return {
            ...paragraph,
            styleId: 'code',
            styleName: 'Code'
        }
    } else {
        return paragraph
    }
}

var options = {
    transformDocument: mammothPlus.transforms.paragraph(transformParagraph),
    styleMap: ["p[style-name='Code'] => pre:separator('\n')"]
}
```

#### `mammothPlus.transforms.paragraph(transformParagraph)`

Returns a function that can be used as the `transformDocument` option.
This will apply the function `transformParagraph` to each paragraph element.
`transformParagraph` should return the new paragraph.

#### `mammothPlus.transforms.run(transformRun)`

Returns a function that can be used as the `transformDocument` option.
This will apply the function `transformRun` to each run element.
`transformRun` should return the new run.

#### `mammothPlus.transforms.getDescendants(element)`

Gets all descendants of an element.

#### `mammothPlus.transforms.getDescendantsOfType(element, type)`

Gets all descendants of a particular type of an element.
For instance, to get all runs within an element `paragraph`:

```javascript
var runs = mammothPlus.transforms.getDescendantsOfType(paragraph, 'run')
```

## Writing style maps

A style map is made up of a number of style mappings separated by new lines.
Blank lines and lines starting with `#` are ignored.

A style mapping has two parts:

-   On the left, before the arrow, is the document element matcher.
-   On the right, after the arrow, is the HTML path.

When converting each paragraph,
mammoth finds the first style mapping where the document element matcher matches the current paragraph.
mammoth then ensures the HTML path is satisfied.

### Freshness

When writing style mappings, it's helpful to understand mammoth's notion of freshness.
When generating, mammoth will only close an HTML element when necessary.
Otherwise, elements are reused.

For instance, suppose one of the specified style mappings is `p[style-name='Heading 1'] => h1`.
If mammoth encounters a .docx paragraph with the style name `Heading 1`,
the .docx paragraph is converted to a `h1` element with the same text.
If the next .docx paragraph also has the style name `Heading 1`,
then the text of that paragraph will be appended to the _existing_ `h1` element,
rather than creating a new `h1` element.

In most cases, you'll probably want to generate a new `h1` element instead.
You can specify this by using the `:fresh` modifier:

`p[style-name='Heading 1'] => h1:fresh`

The two consecutive `Heading 1` .docx paragraphs will then be converted to two separate `h1` elements.

Reusing elements is useful in generating more complicated HTML structures.
For instance, suppose your .docx contains asides.
Each aside might have a heading and some body text,
which should be contained within a single `div.aside` element.
In this case, style mappings similar to `p[style-name='Aside Heading'] => div.aside > h2:fresh` and
`p[style-name='Aside Text'] => div.aside > p:fresh` might be helpful.

### Document element matchers

#### Paragraphs, runs and tables

Match any paragraph:

```
p
```

Match any run:

```
r
```

Match any table:

```
table
```

To match a paragraph, run or table with a specific style,
you can reference the style by name.
This is the style name that is displayed in Microsoft Word or LibreOffice.
For instance, to match a paragraph with the style name `Heading 1`:

```
p[style-name='Heading 1']
```

You can also match a style name by prefix.
For instance, to match a paragraph where the style name starts with `Heading`:

```
p[style-name^='Heading']
```

Styles can also be referenced by style ID.
This is the ID used internally in the .docx file.
To match a paragraph or run with a specific style ID,
append a dot followed by the style ID.
For instance, to match a paragraph with the style ID `Heading1`:

```
p.Heading1
```

#### Bold

Match explicitly bold text:

```
b
```

Note that this matches text that has had bold explicitly applied to it.
It will not match any text that is bold because of its paragraph or run style.

#### Italic

Match explicitly italic text:

```
i
```

Note that this matches text that has had italic explicitly applied to it.
It will not match any text that is italic because of its paragraph or run style.

#### Underline

Match explicitly underlined text:

```
u
```

Note that this matches text that has had underline explicitly applied to it.
It will not match any text that is underlined because of its paragraph or run style.

#### Strikethough

Match explicitly struckthrough text:

```
strike
```

Note that this matches text that has had strikethrough explicitly applied to it.
It will not match any text that is struckthrough because of its paragraph or run style.

#### All caps

Match explicitly all caps text:

```
all-caps
```

Note that this matches text that has had all caps explicitly applied to it.
It will not match any text that is all caps because of its paragraph or run style.

#### Small caps

Match explicitly small caps text:

```
small-caps
```

Note that this matches text that has had small caps explicitly applied to it.
It will not match any text that is small caps because of its paragraph or run style.

#### Highlight

Match explicitly highlighted text:

```
highlight
```

Note that this matches text that has had a highlight explicitly applied to it.
It will not match any text that is highlighted because of its paragraph or run style.

It's also possible to match specific colours.
For instance, to match yellow highlights:

```
highlight[color='yellow']
```

The set of colours typically used are:

* `black`
* `blue`
* `cyan`
* `green`
* `magenta`
* `red`
* `yellow`
* `white`
* `darkBlue`
* `darkCyan`
* `darkGreen`
* `darkMagenta`
* `darkRed`
* `darkYellow`
* `darkGray`
* `lightGray`

#### Ignoring document elements

Use `!` to ignore a document element.
For instance, to ignore any paragraph with the style `Comment`:

```
p[style-name='Comment'] => !
```

### HTML paths

#### Single elements

The simplest HTML path is to specify a single element.
For instance, to specify an `h1` element:

```
h1
```

To give an element a CSS class,
append a dot followed by the name of the class:

```
h1.section-title
```

To add an attribute, use square brackets similarly to a CSS attribute selector:

```
p[lang='fr']
```

To require that an element is fresh, use `:fresh`:

```
h1:fresh
```

Modifiers must be used in the correct order:

```
h1.section-title:fresh
```

#### Separators

To specify a separator to place between the contents of paragraphs that are collapsed together,
use `:separator('SEPARATOR STRING')`.

For instance, suppose a document contains a block of code where each line of code is a paragraph with the style `Code Block`.
We can write a style mapping to map such paragraphs to `<pre>` elements:

```
p[style-name='Code Block'] => pre
```

Since `pre` isn't marked as `:fresh`,
consecutive `pre` elements will be collapsed together.
However, this results in the code all being on one line.
We can use `:separator` to insert a newline between each line of code:

```
p[style-name='Code Block'] => pre:separator('\n')
```

#### Nested elements

Use `>` to specify nested elements.
For instance, to specify `h2` within `div.aside`:

```
div.aside > h2
```

You can nest elements to any depth.
