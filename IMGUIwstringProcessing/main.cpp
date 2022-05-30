//This is the helper to convert wstring to strings for use in the IMGUI::Text function
CHAR* from_wstring(const wchar_t * wstr);
CHAR* from_wstring(const std::string& origstr);
CHAR* from_wstring(const std::string& origstr) {
    return (CHAR *)origstr.c_str();
}
CHAR* from_wstring(const wchar_t * wstr)
{
    int wstr_len = (int)wcslen(wstr);
    int num_chars = WideCharToMultiByte(CP_UTF8, 0, wstr, wstr_len, NULL, 0, NULL, NULL);
    CHAR* strTo = (CHAR*)malloc((num_chars + 1) * sizeof(CHAR));
    if (strTo)
    {
        WideCharToMultiByte(CP_UTF8, 0, wstr, wstr_len, strTo, num_chars, NULL, NULL);
        strTo[num_chars] = '\0';
    }
    return strTo;
}



// This is how to load the BMP PLANE into the current font atlas
ImVector<ImWchar> ranges;
ImFontGlyphRangesBuilder builder;
// FFF0 is the end of the bmp range - https://en.wikipedia.org/wiki/Plane_(Unicode)#Assigned_characters
static const ImWchar customrange[] = { 0x0001,0xFFF0 };

builder.AddRanges(&customrange[0]);
builder.BuildRanges(&ranges);
//io.Fonts->AddFontFromFileTTF("C:\\Users\\andy\\Downloads\\unifont-6.3.20131020.ttf\\unifont-6.3.20131020.ttf", 14.0f, NULL, ranges.Data);
io.Fonts->AddFontFromFileTTF("C:\\Users\\andy\\Downloads\\ARIALUNI.TTF", 18.0f, NULL, ranges.Data);


// This is the rendered test
{ // MY CURRENT WSTRING PROCESSING FUNC DOES NOT WORK FOR ANYTHING NOT IN BMP PLANE so nothing higher than FFFF would be supported
    const std::string names[] = { "Basic Latin[g]","Latin-1 Supplement[h]","Latin Extended-A","Latin Extended-B","IPA Extensions","Spacing Modifier Letters","Combining Diacritical Marks","Greek and Coptic","Cyrillic","Cyrillic Supplement","Armenian","Hebrew","Arabic","Syriac","Arabic Supplement","Thaana","NKo","Samaritan","Mandaic","Syriac Supplement","Arabic Extended-B","Arabic Extended-A","Devanagari","Bengali","Gurmukhi","Gujarati","Oriya","Tamil","Telugu","Kannada","Malayalam","Sinhala","Thai","Lao","Tibetan","Myanmar","Georgian","Hangul Jamo","Ethiopic","Ethiopic Supplement","Cherokee","Unified Canadian Aboriginal Syllabics","Ogham","Runic","Tagalog","Hanunoo","Buhid","Tagbanwa","Khmer","Mongolian","Unified Canadian Aboriginal Syllabics Extended","Limbu","Tai Le","New Tai Lue","Khmer Symbols","Buginese","Tai Tham","Combining Diacritical Marks Extended","Balinese","Sundanese","Batak","Lepcha","Ol Chiki","Cyrillic Extended-C","Georgian Extended","Sundanese Supplement","Vedic Extensions","Phonetic Extensions","Phonetic Extensions Supplement","Combining Diacritical Marks Supplement","Latin Extended Additional","Greek Extended","General Punctuation","Superscripts and Subscripts","Currency Symbols","Combining Diacritical Marks for Symbols","Letterlike Symbols","Number Forms","Arrows","Mathematical Operators","Miscellaneous Technical","Control Pictures","Optical Character Recognition","Enclosed Alphanumerics","Box Drawing","Block Elements","Geometric Shapes","Miscellaneous Symbols","Dingbats","Miscellaneous Mathematical Symbols-A","Supplemental Arrows-A","Braille Patterns","Supplemental Arrows-B","Miscellaneous Mathematical Symbols-B","Supplemental Mathematical Operators","Miscellaneous Symbols and Arrows","Glagolitic","Latin Extended-C","Coptic","Georgian Supplement","Tifinagh","Ethiopic Extended","Cyrillic Extended-A","Supplemental Punctuation","CJK Radicals Supplement","Kangxi Radicals","Ideographic Description Characters","CJK Symbols and Punctuation","Hiragana","Katakana","Bopomofo","Hangul Compatibility Jamo","Kanbun","Bopomofo Extended","CJK Strokes","Katakana Phonetic Extensions","Enclosed CJK Letters and Months","CJK Compatibility","CJK Unified Ideographs Extension A","Yijing Hexagram Symbols","CJK Unified Ideographs","Yi Syllables","Yi Radicals","Lisu","Vai","Cyrillic Extended-B","Bamum","Modifier Tone Letters","Latin Extended-D","Syloti Nagri","Common Indic Number Forms","Phags-pa","Saurashtra","Devanagari Extended","Kayah Li","Rejang","Hangul Jamo Extended-A","Javanese","Myanmar Extended-B","Cham","Myanmar Extended-A","Tai Viet","Meetei Mayek Extensions","Ethiopic Extended-A","Latin Extended-E","Cherokee Supplement","Meetei Mayek","Hangul Syllables","Hangul Jamo Extended-B","High Surrogates","High Private Use Surrogates","Low Surrogates","Private Use Area","CJK Compatibility Ideographs","Alphabetic Presentation Forms","Arabic Presentation Forms-A","Variation Selectors","Vertical Forms","Combining Half Marks","CJK Compatibility Forms","Small Form Variants","Arabic Presentation Forms-B","Halfwidth and Fullwidth Forms","Specials","Linear B Syllabary","Linear B Ideograms","Aegean Numbers","Ancient Greek Numbers","Ancient Symbols","Phaistos Disc","Lycian","Carian","Coptic Epact Numbers","Old Italic","Gothic","Old Permic","Ugaritic","Old Persian","Deseret","Shavian","Osmanya","Osage","Elbasan","Caucasian Albanian","Vithkuqi","Linear A","Latin Extended-F","Cypriot Syllabary","Imperial Aramaic","Palmyrene","Nabataean","Hatran","Phoenician","Lydian","Meroitic Hieroglyphs","Meroitic Cursive","Kharoshthi","Old South Arabian","Old North Arabian","Manichaean","Avestan","Inscriptional Parthian","Inscriptional Pahlavi","Psalter Pahlavi","Old Turkic","Old Hungarian","Hanifi Rohingya","Rumi Numeral Symbols","Yezidi","Old Sogdian","Sogdian","Old Uyghur","Chorasmian","Elymaic","Brahmi","Kaithi","Sora Sompeng","Chakma","Mahajani","Sharada","Sinhala Archaic Numbers","Khojki","Multani","Khudawadi","Grantha","Newa","Tirhuta","Siddham","Modi","Mongolian Supplement","Takri","Ahom","Dogra","Warang Citi","Dives Akuru","Nandinagari","Zanabazar Square","Soyombo","Unified Canadian Aboriginal Syllabics Extended-A","Pau Cin Hau","Bhaiksuki","Marchen","Masaram Gondi","Gunjala Gondi","Makasar","Lisu Supplement","Tamil Supplement","Cuneiform","Cuneiform Numbers and Punctuation","Early Dynastic Cuneiform","Cypro-Minoan","Egyptian Hieroglyphs","Egyptian Hieroglyph Format Controls","Anatolian Hieroglyphs","Bamum Supplement","Mro","Tangsa","Bassa Vah","Pahawh Hmong","Medefaidrin","Miao","Ideographic Symbols and Punctuation","Tangut","Tangut Components","Khitan Small Script","Tangut Supplement","Kana Extended-B","Kana Supplement","Kana Extended-A","Small Kana Extension","Nushu","Duployan","Shorthand Format Controls","Znamenny Musical Notation","Byzantine Musical Symbols","Musical Symbols","Ancient Greek Musical Notation","Mayan Numerals","Tai Xuan Jing Symbols","Counting Rod Numerals","Mathematical Alphanumeric Symbols","Sutton SignWriting","Latin Extended-G","Glagolitic Supplement","Nyiakeng Puachue Hmong","Toto","Wancho","Ethiopic Extended-B","Mende Kikakui","Adlam","Indic Siyaq Numbers","Ottoman Siyaq Numbers","Arabic Mathematical Alphabetic Symbols","Mahjong Tiles","Domino Tiles","Playing Cards","Enclosed Alphanumeric Supplement","Enclosed Ideographic Supplement","Miscellaneous Symbols and Pictographs","Emoticons","Ornamental Dingbats","Transport and Map Symbols","Alchemical Symbols","Geometric Shapes Extended","Supplemental Arrows-C","Supplemental Symbols and Pictographs","Chess Symbols","Symbols and Pictographs Extended-A","Symbols for Legacy Computing","CJK Unified Ideographs Extension B","CJK Unified Ideographs Extension C","CJK Unified Ideographs Extension D","CJK Unified Ideographs Extension E","CJK Unified Ideographs Extension F","CJK Compatibility Ideographs Supplement","CJK Unified Ideographs Extension G","Tags","Variation Selectors Supplement","Supplementary Private Use Area-A","Supplementary Private Use Area-B" };
    const int start[] = { 0x0,0x80,0x100,0x180,0x250,0x2b0,0x300,0x370,0x400,0x500,0x530,0x590,0x600,0x700,0x750,0x780,0x7c0,0x800,0x840,0x860,0x870,0x8a0,0x900,0x980,0xa00,0xa80,0xb00,0xb80,0xc00,0xc80,0xd00,0xd80,0xe00,0xe80,0xf00,0x1000,0x10a0,0x1100,0x1200,0x1380,0x13a0,0x1400,0x1680,0x16a0,0x1700,0x1720,0x1740,0x1760,0x1780,0x1800,0x18b0,0x1900,0x1950,0x1980,0x19e0,0x1a00,0x1a20,0x1ab0,0x1b00,0x1b80,0x1bc0,0x1c00,0x1c50,0x1c80,0x1c90,0x1cc0,0x1cd0,0x1d00,0x1d80,0x1dc0,0x1e00,0x1f00,0x2000,0x2070,0x20a0,0x20d0,0x2100,0x2150,0x2190,0x2200,0x2300,0x2400,0x2440,0x2460,0x2500,0x2580,0x25a0,0x2600,0x2700,0x27c0,0x27f0,0x2800,0x2900,0x2980,0x2a00,0x2b00,0x2c00,0x2c60,0x2c80,0x2d00,0x2d30,0x2d80,0x2de0,0x2e00,0x2e80,0x2f00,0x2ff0,0x3000,0x3040,0x30a0,0x3100,0x3130,0x3190,0x31a0,0x31c0,0x31f0,0x3200,0x3300,0x3400,0x4dc0,0x4e00,0xa000,0xa490,0xa4d0,0xa500,0xa640,0xa6a0,0xa700,0xa720,0xa800,0xa830,0xa840,0xa880,0xa8e0,0xa900,0xa930,0xa960,0xa980,0xa9e0,0xaa00,0xaa60,0xaa80,0xaae0,0xab00,0xab30,0xab70,0xabc0,0xac00,0xd7b0,0xd800,0xdb80,0xdc00,0xe000,0xf900,0xfb00,0xfb50,0xfe00,0xfe10,0xfe20,0xfe30,0xfe50,0xfe70,0xff00,0xfff0,0x10000,0x10080,0x10100,0x10140,0x10190,0x101d0,0x10280,0x102a0,0x102e0,0x10300,0x10330,0x10350,0x10380,0x103a0,0x10400,0x10450,0x10480,0x104b0,0x10500,0x10530,0x10570,0x10600,0x10780,0x10800,0x10840,0x10860,0x10880,0x108e0,0x10900,0x10920,0x10980,0x109a0,0x10a00,0x10a60,0x10a80,0x10ac0,0x10b00,0x10b40,0x10b60,0x10b80,0x10c00,0x10c80,0x10d00,0x10e60,0x10e80,0x10f00,0x10f30,0x10f70,0x10fb0,0x10fe0,0x11000,0x11080,0x110d0,0x11100,0x11150,0x11180,0x111e0,0x11200,0x11280,0x112b0,0x11300,0x11400,0x11480,0x11580,0x11600,0x11660,0x11680,0x11700,0x11800,0x118a0,0x11900,0x119a0,0x11a00,0x11a50,0x11ab0,0x11ac0,0x11c00,0x11c70,0x11d00,0x11d60,0x11ee0,0x11fb0,0x11fc0,0x12000,0x12400,0x12480,0x12f90,0x13000,0x13430,0x14400,0x16800,0x16a40,0x16a70,0x16ad0,0x16b00,0x16e40,0x16f00,0x16fe0,0x17000,0x18800,0x18b00,0x18d00,0x1aff0,0x1b000,0x1b100,0x1b130,0x1b170,0x1bc00,0x1bca0,0x1cf00,0x1d000,0x1d100,0x1d200,0x1d2e0,0x1d300,0x1d360,0x1d400,0x1d800,0x1df00,0x1e000,0x1e100,0x1e290,0x1e2c0,0x1e7e0,0x1e800,0x1e900,0x1ec70,0x1ed00,0x1ee00,0x1f000,0x1f030,0x1f0a0,0x1f100,0x1f200,0x1f300,0x1f600,0x1f650,0x1f680,0x1f700,0x1f780,0x1f800,0x1f900,0x1fa00,0x1fa70,0x1fb00,0x20000,0x2a700,0x2b740,0x2b820,0x2ceb0,0x2f800,0x30000,0xe0000,0xe0100,0xf0000,0x100000 };
    const int end[] = { 0x7f,0xff,0x17f,0x24f,0x2af,0x2ff,0x36f,0x3ff,0x4ff,0x52f,0x58f,0x5ff,0x6ff,0x74f,0x77f,0x7bf,0x7ff,0x83f,0x85f,0x86f,0x89f,0x8ff,0x97f,0x9ff,0xa7f,0xaff,0xb7f,0xbff,0xc7f,0xcff,0xd7f,0xdff,0xe7f,0xeff,0xfff,0x109f,0x10ff,0x11ff,0x137f,0x139f,0x13ff,0x167f,0x169f,0x16ff,0x171f,0x173f,0x175f,0x177f,0x17ff,0x18af,0x18ff,0x194f,0x197f,0x19df,0x19ff,0x1a1f,0x1aaf,0x1aff,0x1b7f,0x1bbf,0x1bff,0x1c4f,0x1c7f,0x1c8f,0x1cbf,0x1ccf,0x1cff,0x1d7f,0x1dbf,0x1dff,0x1eff,0x1fff,0x206f,0x209f,0x20cf,0x20ff,0x214f,0x218f,0x21ff,0x22ff,0x23ff,0x243f,0x245f,0x24ff,0x257f,0x259f,0x25ff,0x26ff,0x27bf,0x27ef,0x27ff,0x28ff,0x297f,0x29ff,0x2aff,0x2bff,0x2c5f,0x2c7f,0x2cff,0x2d2f,0x2d7f,0x2ddf,0x2dff,0x2e7f,0x2eff,0x2fdf,0x2fff,0x303f,0x309f,0x30ff,0x312f,0x318f,0x319f,0x31bf,0x31ef,0x31ff,0x32ff,0x33ff,0x4dbf,0x4dff,0x9fff,0xa48f,0xa4cf,0xa4ff,0xa63f,0xa69f,0xa6ff,0xa71f,0xa7ff,0xa82f,0xa83f,0xa87f,0xa8df,0xa8ff,0xa92f,0xa95f,0xa97f,0xa9df,0xa9ff,0xaa5f,0xaa7f,0xaadf,0xaaff,0xab2f,0xab6f,0xabbf,0xabff,0xd7af,0xd7ff,0xdb7f,0xdbff,0xdfff,0xf8ff,0xfaff,0xfb4f,0xfdff,0xfe0f,0xfe1f,0xfe2f,0xfe4f,0xfe6f,0xfeff,0xffef,0xffff,0x1007f,0x100ff,0x1013f,0x1018f,0x101cf,0x101ff,0x1029f,0x102df,0x102ff,0x1032f,0x1034f,0x1037f,0x1039f,0x103df,0x1044f,0x1047f,0x104af,0x104ff,0x1052f,0x1056f,0x105bf,0x1077f,0x107bf,0x1083f,0x1085f,0x1087f,0x108af,0x108ff,0x1091f,0x1093f,0x1099f,0x109ff,0x10a5f,0x10a7f,0x10a9f,0x10aff,0x10b3f,0x10b5f,0x10b7f,0x10baf,0x10c4f,0x10cff,0x10d3f,0x10e7f,0x10ebf,0x10f2f,0x10f6f,0x10faf,0x10fdf,0x10fff,0x1107f,0x110cf,0x110ff,0x1114f,0x1117f,0x111df,0x111ff,0x1124f,0x112af,0x112ff,0x1137f,0x1147f,0x114df,0x115ff,0x1165f,0x1167f,0x116cf,0x1174f,0x1184f,0x118ff,0x1195f,0x119ff,0x11a4f,0x11aaf,0x11abf,0x11aff,0x11c6f,0x11cbf,0x11d5f,0x11daf,0x11eff,0x11fbf,0x11fff,0x123ff,0x1247f,0x1254f,0x12fff,0x1342f,0x1343f,0x1467f,0x16a3f,0x16a6f,0x16acf,0x16aff,0x16b8f,0x16e9f,0x16f9f,0x16fff,0x187ff,0x18aff,0x18cff,0x18d7f,0x1afff,0x1b0ff,0x1b12f,0x1b16f,0x1b2ff,0x1bc9f,0x1bcaf,0x1cfcf,0x1d0ff,0x1d1ff,0x1d24f,0x1d2ff,0x1d35f,0x1d37f,0x1d7ff,0x1daaf,0x1dfff,0x1e02f,0x1e14f,0x1e2bf,0x1e2ff,0x1e7ff,0x1e8df,0x1e95f,0x1ecbf,0x1ed4f,0x1eeff,0x1f02f,0x1f09f,0x1f0ff,0x1f1ff,0x1f2ff,0x1f5ff,0x1f64f,0x1f67f,0x1f6ff,0x1f77f,0x1f7ff,0x1f8ff,0x1f9ff,0x1fa6f,0x1faff,0x1fbff,0x2a6df,0x2b73f,0x2b81f,0x2ceaf,0x2ebef,0x2fa1f,0x3134f,0xe007f,0xe01ef,0xfffff,0x10ffff };
    ImGui::Begin("UTF8 : Character Viewer | from: https://en.wikipedia.org/wiki/Unicode_block#List_of_blocks", &show_another_window);

    //const std::string names[] = { "0x0001-0x0FFFF", "0x0FFFF-0x1FFFF", "0x1FFFF-0x2FFFF", "0x2FFFF-0x3FFFF", "0x3FFFF-0x4FFFF", "0x4FFFF-0x5FFFF", "0x5FFFF-0x6FFFF", "0x6FFFF-0x7FFFF", "0x7FFFF-0x8FFFF", "0x8FFFF-0x9FFFF", "0x9FFFF-0xAFFFF", "0xAFFFF-0xBFFFF", "0xBFFFF-0xCFFFF", "0xCFFFF-0xDFFFF", "0xDFFFF-0xEFFFF", "0xEFFFF-0xFFFFF","C0 Control Character",  "Basic Latin",  "Delete Character",  "C1 Control Character",  "Latin-1 Supplement",  "Latin Extended-A",  "Latin Extended-B",  "IPA Extensions",  "Spacing Modifier Letters",  "Combining Diacritical Marks",  "Greek and Coptic",  "Cyrillic",  "Cyrillic Supplement",  "Armenian",  "Hebrew",  "Arabic",  "Syriac",  "Arabic Supplement",  "Thaana",  "NKo",  "Samaritan",  "Mandaic",  "Arabic Extended-A",  "Devanagari",  "Bengali",  "Gurmukhi",  "Gujarati",  "Oriya",  "Tamil",  "Telugu",  "Kannada",  "Malayalam",  "Sinhala",  "Thai",  "Lao",  "Tibetan",  "Myanmar (Burmese)",  "Georgian",  "Hangul Jamo: Choseong",  "Hangul Jamo: Jungseong",  "Hangul Jamo: Jongseong",  "Ethiopic (Ge'ez)",  "Ethiopic Supplement (Ge'ez)",  "Cherokee",  "Unified Canadian Aboriginal Syllabics",  "Ogham",  "Runic",  "Tagalog (Baybayin)",  "Hanunoo (Hanunó'o)",  "Buhid",  "Tagbanwa",  "Khmer",  "Mongolian",  "Unified Canadian Aboriginal Syllabics Extended",  "Limbu",  "Tai Le",  "New Tai Lue (Tai Lü)",  "Khmer Symbols",  "Buginese",  "Tai Tham",  "Combining Diacritical Marks Extended",  "Balinese",  "Sundanese",  "Batak",  "Lepcha",  "Ol Chiki",  "Sundanese Supplement",  "Vedic Extensions",  "Phonetic Extensions",  "Phonetic Extensions Supplement",  "Combining Diacritical Marks Supplement",  "Latin Extended Additional",  "Greek Extended",  "General Punctuation",  "Superscripts and Subscripts",  "Currency Symbols",  "Combining Diacritical Marks for Symbols",  "Letterlike Symbols",  "Number Forms",  "Arrows",  "Mathematical Operators",  "Miscellaneous Technical",  "Control Pictures",  "Optical Character Recognition",  "Enclosed Alphanumerics",  "Box Drawing",  "Block Elements",  "Geometric Shapes",  "Miscellaneous Symbols",  "Dingbats (Zapf Dingbats)",  "Miscellaneous Mathematical Symbols-A",  "Supplemental Arrows-A",  "Braille Patterns",  "Supplemental Arrows-B",  "Miscellaneous Mathematical Symbols-B",  "Supplemental Mathematical Operators",  "Miscellaneous Symbols and Arrows",  "Glagolitic",  "Latin Extended-C",  "Coptic",  "Georgian Supplement",  "Tifinagh",  "Ethiopic Extended",  "Cyrillic Extended-A",  "Supplemental Punctuation",  "CJK Radicals Supplement",  "Kangxi Radicals",  "Ideographic Description Characters",  "CJK Symbols and Punctuation",  "Hiragana",  "Katakana",  "Bopomofo",  "Hangul Compatibility Jamo",  "Kanbun",  "Bopomofo Extended",  "CJK Strokes",  "Katakana Phonetic Extensions",  "Enclosed CJK Letters and Months",  "CJK Compatibility",  "CJK Unified Ideographs Extension A",  "Yijing Hexagram Symbols",  "CJK Unified Ideographs (Han Unification)",  "Yi Syllables",  "Yi Radicals",  "Lisu (Fraser alphabet)",  "Vai",  "Cyrillic Extended-B",  "Bamum",  "Modifier Tone Letters",  "Latin Extended-D",  "Syloti Nagri",  "Common Indic Number Forms",  "Phags-pa",  "Saurashtra",  "Devanagari Extended",  "Kayah Li",  "Rejang",  "Hangul Jamo Extended-A",  "Javanese",  "Myanmar Extended-B",  "Cham",  "Myanmar Extended-A",  "Tai Viet",  "Meetei Mayek Extensions",  "Ethiopic Extended-A",  "Latin Extended-E",  "Cherokee Supplement",  "Meetei Mayek",  "Hangul Syllables",  "Hangul Jamo Extended-B",  "Private Use Area",  "CJK Compatibility Ideographs",  "Alphabetic Presentation Forms (Latin Lig + Armenian Lig + Hebrew Lig)",  "Latin Ligatures",  "Armenian Ligatures",  "Hebrew Ligatures / Pointed Letters",  "Arabic Presentation Forms-A",  "Variation Selectors",  "Vertical Forms",  "Combining Half Marks",  "CJK Compatibility Forms",  "Small Form Variants",  "Arabic Presentation Forms-B",  "Byte Order Mark",  "Halfwidth and Fullwidth Forms",  "Latin Full Width Forms",  "KataKana Half Width Forms",  "Hangul Jamo Half Width Forms",  "Specials",  "Linear B Syllabary",  "Linear B Ideograms",  "Aegean Numbers",  "Ancient Greek Numbers",  "Ancient Symbols",  "Phaistos Disc",  "Lycian",  "Carian",  "Coptic Epact Numbers",  "Old Italic",  "Gothic",  "Old Permic",  "Ugaritic",  "Old Persian",  "Deseret",  "Shavian",  "Osmanya",  "Elbasan",  "Caucasian Albanian",  "Linear A",  "Cypriot Syllabary",  "Imperial Aramaic",  "Palmyrene",  "Nabataean",  "Hatran",  "Phoenician",  "Lydian",  "Meroitic Hieroglyphs",  "Meroitic Cursive",  "Kharosthi",  "Old South Arabian",  "Old North Arabian",  "Manichaean",  "Avestan",  "Inscriptional Parthian",  "Inscriptional Pahlavi",  "Psalter Pahlavi",  "Old Turkic",  "Old Hungarian",  "Rumi Numeral Symbols",  "Brahmi",  "Kaithi",  "Sora Sompeng",  "Chakma",  "Mahajani",  "Sharada",  "Sinhala Archaic Numbers",  "Khojki",  "Multani",  "Khudawadi",  "Grantha",  "Tirhuta",  "Siddham",  "Modi",  "Takri",  "Ahom",  "Warang Citi",  "Pau Cin Hau",  "Cuneiform (Sumero-Akkadian Cuneiform)",  "Cuneiform Numbers and Punctuation",  "Early Dynastic Cuneiform",  "Egyptian Hieroglyphs",  "Anatolian Hieroglyphs",  "Bamum Supplement",  "Mro",  "Bassa Vah",  "Pahawh Hmong",  "Miao",  "Kana Supplement",  "Duployan",  "Shorthand Format Controls",  "Byzantine Musical Symbols",  "Musical Symbols",  "Ancient Greek Musical Notation",  "Tai Xuan Jing Symbols",  "Counting Rod Numerals",  "Mathematical Alphanumeric Symbols",  "Sutton SignWriting",  "Mende Kikakui",  "Arabic Mathematical Alphabetic Symbols",  "Mahjong Tiles",  "Domino Tiles",  "Playing Cards",  "Enclosed Alphanumeric Supplement",  "Enclosed Ideographic Supplement",  "Miscellaneous Symbols and Pictographs",  "Emoticons",  "Ornamental Dingbats",  "Transport and Map Symbols",  "Alchemical Symbols",  "Geometric Shapes Extended",  "Supplemental Arrows-C",  "Supplemental Symbols and Pictographs",  "CJK Unified Ideographs Extension B",  "CJK Unified Ideographs Extension C",  "CJK Unified Ideographs Extension D",  "CJK Unified Ideographs Extension E",  "CJK Compatibility Ideographs Supplement",  "Tags",  "Variation Selectors Supplement"};
    //const int start[] = { 0x0001, 0x0FFFF, 0x1FFFF, 0x2FFFF, 0x3FFFF, 0x4FFFF, 0x5FFFF, 0x6FFFF, 0x7FFFF, 0x8FFFF, 0x9FFFF, 0xAFFFF, 0xBFFFF, 0xCFFFF, 0xDFFFF, 0xEFFFF,0x0, 0x20, 0x7f, 0x80, 0xa0, 0x100, 0x180, 0x250, 0x2b0, 0x300, 0x370, 0x400, 0x500, 0x530, 0x590, 0x600, 0x700, 0x750, 0x780, 0x7c0, 0x800, 0x840, 0x8a0, 0x900, 0x980, 0xa00, 0xa80, 0xb00, 0xb80, 0xc00, 0xc80, 0xd00, 0xd80, 0xe00, 0xe80, 0xf00, 0x1000, 0x10a0, 0x1100, 0x1160, 0x11a8, 0x1200, 0x1380, 0x13a0, 0x1400, 0x1680, 0x16a0, 0x1700, 0x1720, 0x1740, 0x1760, 0x1780, 0x1800, 0x18b0, 0x1900, 0x1950, 0x1980, 0x19e0, 0x1a00, 0x1a20, 0x1ab0, 0x1b00, 0x1b80, 0x1bc0, 0x1c00, 0x1c50, 0x1cc0, 0x1cd0, 0x1d00, 0x1d80, 0x1dc0, 0x1e00, 0x1f00, 0x2000, 0x2070, 0x20a0, 0x20d0, 0x2100, 0x2150, 0x2190, 0x2200, 0x2300, 0x2400, 0x2440, 0x2460, 0x2500, 0x2580, 0x25a0, 0x2600, 0x2700, 0x27c0, 0x27f0, 0x2800, 0x2900, 0x2980, 0x2a00, 0x2b00, 0x2c00, 0x2c60, 0x2c80, 0x2d00, 0x2d30, 0x2d80, 0x2de0, 0x2e00, 0x2e80, 0x2f00, 0x2ff0, 0x3000, 0x3040, 0x30a0, 0x3100, 0x3130, 0x3190, 0x31a0, 0x31c0, 0x31f0, 0x3200, 0x3300, 0x3400, 0x4dc0, 0x4e00, 0xa000, 0xa490, 0xa4d0, 0xa500, 0xa640, 0xa6a0, 0xa700, 0xa720, 0xa800, 0xa830, 0xa840, 0xa880, 0xa8e0, 0xa900, 0xa930, 0xa960, 0xa980, 0xa9e0, 0xaa00, 0xaa60, 0xaa80, 0xaae0, 0xab00, 0xab30, 0xab70, 0xabc0, 0xac00, 0xd7b0, 0xe000, 0xf900, 0xfb00, 0xfb00, 0xfb13, 0xfb1d, 0xfb50, 0xfe00, 0xfe10, 0xfe20, 0xfe30, 0xfe50, 0xfe70, 0xfeff, 0xff00, 0xff01, 0xff61, 0xffa0, 0xfff0, 0x10000, 0x10080, 0x10100, 0x10140, 0x10190, 0x101d0, 0x10280, 0x102a0, 0x102e0, 0x10300, 0x10330, 0x10350, 0x10380, 0x103a0, 0x10400, 0x10450, 0x10480, 0x10500, 0x10530, 0x10600, 0x10800, 0x10840, 0x10860, 0x10880, 0x108e0, 0x10900, 0x10920, 0x10980, 0x109a0, 0x10a00, 0x10a60, 0x10a80, 0x10ac0, 0x10b00, 0x10b40, 0x10b60, 0x10b80, 0x10c00, 0x10c80, 0x10e60, 0x11000, 0x11080, 0x110d0, 0x11100, 0x11150, 0x11180, 0x111e0, 0x11200, 0x11280, 0x112b0, 0x11300, 0x11480, 0x11580, 0x11600, 0x11680, 0x11700, 0x118a0, 0x11ac0, 0x12000, 0x12400, 0x12480, 0x13000, 0x14400, 0x16800, 0x16a40, 0x16ad0, 0x16b00, 0x16f00, 0x1b000, 0x1bc00, 0x1bca0, 0x1d000, 0x1d100, 0x1d200, 0x1d300, 0x1d360, 0x1d400, 0x1d800, 0x1e800, 0x1ee00, 0x1f000, 0x1f030, 0x1f0a0, 0x1f100, 0x1f200, 0x1f300, 0x1f600, 0x1f650, 0x1f680, 0x1f700, 0x1f780, 0x1f800, 0x1f900, 0x20000, 0x2a700, 0x2b740, 0x2b820, 0x2f800, 0xe0000, 0xe0100 };
    //const int end[] =  { 0x0FFFF, 0x1FFFF, 0x2FFFF, 0x3FFFF, 0x4FFFF, 0x5FFFF, 0x6FFFF, 0x7FFFF, 0x8FFFF, 0x9FFFF, 0xAFFFF, 0xBFFFF, 0xCFFFF, 0xDFFFF, 0xEFFFF, 0xFFFFF,0x1f, 0x7e, 0x7f, 0x9f, 0xff, 0x17f, 0x24f, 0x2af, 0x2ff, 0x36f, 0x3ff, 0x4ff, 0x52f, 0x58f, 0x5ff, 0x6ff, 0x74f, 0x77f, 0x7bf, 0x7ff, 0x83f, 0x85f, 0x8ff, 0x97f, 0x9ff, 0xa7f, 0xaff, 0xb7f, 0xbff, 0xc7f, 0xcff, 0xd7f, 0xdff, 0xe7f, 0xeff, 0xfff, 0x109f, 0x10ff, 0x115f, 0x11a7, 0x11ff, 0x137f, 0x139f, 0x13ff, 0x167f, 0x169f, 0x16ff, 0x171f, 0x173f, 0x175f, 0x177f, 0x17ff, 0x18af, 0x18ff, 0x194f, 0x197f, 0x19df, 0x19ff, 0x1a1f, 0x1aaf, 0x1aff, 0x1b7f, 0x1bbf, 0x1bff, 0x1c4f, 0x1c7f, 0x1ccf, 0x1cff, 0x1d7f, 0x1dbf, 0x1dff, 0x1eff, 0x1fff, 0x206f, 0x209f, 0x20cf, 0x20ff, 0x214f, 0x218f, 0x21ff, 0x22ff, 0x23ff, 0x243f, 0x245f, 0x24ff, 0x257f, 0x259f, 0x25ff, 0x267f, 0x27bf, 0x27ef, 0x27ff, 0x28ff, 0x297f, 0x29ff, 0x2aff, 0x2bff, 0x2c5f, 0x2c7f, 0x2cff, 0x2d2f, 0x2d7f, 0x2ddf, 0x2dff, 0x2e7f, 0x2eff, 0x2fdf, 0x2fff, 0x303f, 0x309f, 0x30ff, 0x312f, 0x318f, 0x319f, 0x31bf, 0x31ef, 0x31ff, 0x32ff, 0x33ff, 0x4dbf, 0x4dff, 0x9fff, 0xa3ff, 0xa4af, 0xa4ff, 0xa63f, 0xa69f, 0xa6ff, 0xa71f, 0xa7ff, 0xa82f, 0xa83f, 0xa87f, 0xa8df, 0xa8ff, 0xa92f, 0xa95f, 0xa97f, 0xa9df, 0xa9ff, 0xaa5f, 0xaa7f, 0xaadf, 0xaaff, 0xab2f, 0xab6f, 0xabbf, 0xabf9, 0xd7af, 0xd7ff, 0xf8ff, 0xfaff, 0xfb4f, 0xfb06, 0xfb17, 0xfb4f, 0xfdff, 0xfe0f, 0xfe1f, 0xfe2f, 0xfe4f, 0xfe6f, 0xfeff, 0xfeff, 0xffef, 0xff5e, 0xff9f, 0xffdc, 0xffff, 0x1007f, 0x100ff, 0x1013f, 0x1018f, 0x101cf, 0x101ff, 0x1029f, 0x102df, 0x102ff, 0x1032f, 0x1034f, 0x1037f, 0x1039f, 0x103df, 0x1044f, 0x1047f, 0x104af, 0x1052f, 0x1056f, 0x1077f, 0x1083f, 0x1085f, 0x1087f, 0x108af, 0x108ff, 0x1091f, 0x1093f, 0x1099f, 0x109ff, 0x10a5f, 0x10a7f, 0x10a9f, 0x10aff, 0x10b3f, 0x10b5f, 0x10b7f, 0x10baf, 0x10c4f, 0x10cff, 0x10e7f, 0x1107f, 0x110cf, 0x110ff, 0x1114f, 0x1117f, 0x111df, 0x111ff, 0x1124f, 0x112af, 0x112ff, 0x1137f, 0x114df, 0x115ff, 0x1165f, 0x116cf, 0x1173f, 0x118ff, 0x11aff, 0x123ff, 0x1247f, 0x1254f, 0x1342f, 0x1467f, 0x16a3f, 0x16a6f, 0x16aff, 0x16b8f, 0x16f9f, 0x1b0ff, 0x1bc9f, 0x1bcaf, 0x1d0ff, 0x1d1ff, 0x1d24f, 0x1d35f, 0x1d371, 0x1d7ff, 0x1daaf, 0x1e8df, 0x1eeff, 0x1f02f, 0x1f09f, 0x1f0ff, 0x1f1ff, 0x1f2ff, 0x1f5ff, 0x1f64f, 0x1f67f, 0x1f6ff, 0x1f77f, 0x1f7ff, 0x1f8ff, 0x1f9ff, 0x2a6d6, 0x2b734, 0x2b81d, 0x2ceaf, 0x2fa1f, 0xe007f, 0xe01ef };
    //ImGui::Begin("UTF8 : Character Viewer | from: https://en.wikipedia.org/wiki/Unicode_font#Comparison_of_fonts", &show_another_window);


    // Left
    static int selected = 0;
    {
        ImGui::BeginChild("left pane", ImVec2(150, 0), true);
        for (int i = 0; i < (sizeof(names) / sizeof(names[0])); i++)
        {
            //char label[500];
            //sprintf(label, "%s",names[i]);
            if (ImGui::Selectable(names[i].c_str(), selected == i))
                selected = i;
        }
        ImGui::EndChild();
    }
    ImGui::SameLine();

    // Right
    {
        ImGui::BeginGroup();
        ImGui::TextWrapped("%s: \n%d Glyphs [0x%X-0x%X]", names[selected].c_str(), end[selected] - start[selected], start[selected], end[selected]);
        ImGui::Separator();

        ImGui::BeginChild("Character View", ImVec2(0, -ImGui::GetFrameHeightWithSpacing())); // Leave room for 1 line below us

        //ImGui::GetForegroundDrawList()->AddRectFilled(ImGui::GetWindowPos(), ImGui::GetWindowPos()+ ImGui::GetWindowContentRegionMax(), ImU32(ImColor(1, 1, 1,100)));
        ImVec2 topleft = ImGui::GetWindowPos() - ImVec2(ImGui::GetScrollX(), ImGui::GetScrollY());
        static ImVec2 spacing = { ImGui::GetFontSize(),ImGui::GetFontSize() };

        for (int i = 0x30; i <= 0x39; i++) {  // Draw 0-9 Above Character View
            std::wstring temp(1, i);
            ImGui::GetWindowDrawList()->AddText({ topleft.x + ((i % 16) * spacing.x),topleft.y }, ImColor(255, 255, 255, 125), from_wstring(temp.c_str()));
        }
        for (int i = 0x41; i <= 0x46; i++) { // Draw A-F Above Character View
            std::wstring temp(1, i);
            ImGui::GetWindowDrawList()->AddText({ topleft.x + (((i + 9) % 16) * spacing.x),topleft.y }, ImColor(255, 255, 255, 125), from_wstring(temp.c_str()));
        }

        for (int i = start[selected] - (start[selected] % 16) + 15; i < end[selected] + 15; i += 16) { // Draw Hex Locations to the right of the character view
            char hex_string[20];
            sprintf(hex_string, "0x%X", i);
            ImGui::GetWindowDrawList()->AddText({ topleft.x + (16 * spacing.x),(start[selected] - end[selected] != 0) ? topleft.y + ((i - start[selected]) - (i % 16)) * (spacing.y / 16) + 16 : topleft.y + spacing.y }, ImColor(255, 255, 255, 125), hex_string);
        }

        for (int i = start[selected]; i < end[selected] + 1; i++) {
            std::wstring temp(1, i);
            ImGui::GetWindowDrawList()->AddText({ topleft.x + ((i % 16) * spacing.x),(start[selected] - end[selected] != 0) ? topleft.y + ((i - start[selected]) - (i % 16)) * (spacing.y / 16) + 16 : topleft.y + spacing.y }, ImColor(255, 255, 255, 255), from_wstring(temp.c_str()));
        }
        ImGui::Dummy(ImVec2{ 16 * spacing.x,((end[selected] - start[selected] + 16) - ((16 + end[selected]) % 16)) * (spacing.y / 16) + 16 }); // we need a dummy box so we can scroll
        ImGui::EndChild();
        ImGui::EndGroup();
    }

    ImGui::End();
}
