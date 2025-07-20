var assert = require("assert");

var xmlreader = require("../../lib/docx/office-xml-reader");

it('simplify clark notation. nothing to replace', function() {
    var xmlString = `<?xml version="1.0" encoding="UTF-8"?>
<w:document xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
            xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
            xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:w10="urn:schemas-microsoft-com:office:word"
            xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"
            xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"
            xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup"
            xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
            xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" mc:Ignorable="w14">
    <w:body>
        <w:p>
            <w:pPr>
                <w:pStyle w:val="Normal.0"/>
                <w:jc w:val="center"/>
                <w:rPr>
                    <w:color w:val="000000"/>
                    <w:sz w:val="24"/>
                </w:rPr>
            </w:pPr>
            <m:oMathPara>
                <m:oMathParaPr>
                    <m:jc m:val="center"/>
                </m:oMathParaPr>
                <m:oMath>
                    <m:sSup>
                        <m:e>
                            <m:r>
                                <w:rPr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
                                    <w:rFonts w:ascii="Cambria Math" w:hAnsi="Cambria Math"/>
                                    <w:i/>
                                    <w:color w:val="000000"/>
                                    <w:sz w:val="25"/>
                                    <w:szCs w:val="25"/>
                                </w:rPr>
                                <m:t>e</m:t>
                            </m:r>
                        </m:e>
                        <m:sup>
                            <m:r>
                                <w:rPr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
                                    <w:rFonts w:ascii="Cambria Math" w:hAnsi="Cambria Math"/>
                                    <w:i/>
                                    <w:color w:val="000000"/>
                                    <w:sz w:val="25"/>
                                    <w:szCs w:val="25"/>
                                </w:rPr>
                                <m:t>8</m:t>
                            </m:r>
                        </m:sup>
                    </m:sSup>
                </m:oMath>
            </m:oMathPara>
        </w:p>
        <w:sectPr>
            <w:headerReference w:type="default" r:id="rId4"/>
            <w:footerReference w:type="default" r:id="rId5"/>
            <w:pgSz w:w="11900" w:h="16840" w:orient="portrait"/>
            <w:pgMar w:top="1134" w:right="850" w:bottom="1134" w:left="1701" w:header="708" w:footer="708"/>
            <w:bidi w:val="0"/>
        </w:sectPr>
    </w:body>
</w:document>
`;

    assert.equal(xmlString, xmlreader.simplifyClarkNotation(xmlString));
});


it('simplify clark notation. replace', function() {
    var xmlString = `<w:document xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" >
    <m:r>
        <m:t{http://www.w3.org/XML/1998/namespace}space="preserve"> ∈ 
        G</m:t>
    </m:r>
    </w:document>`;
    var expected = `<w:document xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" >
    <m:r>
        <m:t ns:space="preserve" xmlns:ns="http://www.w3.org/XML/1998/namespace"> ∈ 
        G</m:t>
    </m:r>
    </w:document>`;

    assert.equal(xmlreader.simplifyClarkNotation(xmlString), expected);
});

it('simplify clark notation. not replace', function() {
    var xmlString = `<w:document xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" >
    <m:r>
    <tag1>{</tag1>
    <tag1>}</tag1>
    <tag1 attr="value"/>
    </m:r>
    </w:document>`;
    var expected = `<w:document xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" >
    <m:r>
    <tag1>{</tag1>
    <tag1>}</tag1>
    <tag1 attr="value"/>
    </m:r>
    </w:document>`;

    assert.equal(xmlreader.simplifyClarkNotation(xmlString), expected);
});

it('simplify clark notation. xmlns in each tag', function() {
    var xmlString = `<w:document xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" >
    <m:t{http://www.w3.org/XML/1998/namespace}space="preserve"> ∈ 
        G</m:t>
    <m:t{http://www.w3.org/XML/1998/namespace}space="preserve" {http://www.w3.org/XML/1998/namespace}test="ok"> ∈ 
        G</m:t>
    <m:t {http://schemas.openxmlformats.org/officeDocument/2006/math}space="preserve"> ∈ 
    G</m:t>
    </w:document>`;
    var expected = `<w:document xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" >
    <m:t ns:space="preserve" xmlns:ns="http://www.w3.org/XML/1998/namespace"> ∈ 
        G</m:t>
    <m:t ns:space="preserve"  ns:test="ok" xmlns:ns="http://www.w3.org/XML/1998/namespace"> ∈ 
        G</m:t>
    <m:t  m:space="preserve" xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"> ∈ 
    G</m:t>
    </w:document>`;

    assert.equal(xmlreader.simplifyClarkNotation(xmlString), expected);
});
it('simplify clark notation. namespace from dict', function() {
    var xmlString = `<w:document xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" >
    <m:t{http://schemas.openxmlformats.org/officeDocument/2006/math}space="preserve"> ∈ G</m:t>
    </w:document>`;
    var expected = `<w:document xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" >
    <m:t m:space="preserve" xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"> ∈ G</m:t>
    </w:document>`;

    assert.equal(xmlreader.simplifyClarkNotation(xmlString), expected);
});
it('simplify clark notation. namespace increment', function() {
    var xmlString = `<w:document xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" >
    <m:t{http://schema1}space="preserve" />
    <m:t{http://schema2}space="preserve" />
    <m:t{http://schema3}space="preserve" />
    </w:document>`;
    var expected = `<w:document xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" >
    <m:t ns3:space="preserve"  xmlns:ns3="http://schema1"/>
    <m:t ns2:space="preserve"  xmlns:ns2="http://schema2"/>
    <m:t ns1:space="preserve"  xmlns:ns1="http://schema3"/>
    </w:document>`;

    assert.equal(xmlreader.simplifyClarkNotation(xmlString), expected);
});
