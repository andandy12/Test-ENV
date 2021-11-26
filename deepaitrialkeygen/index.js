
const request = require('request');
const fs = require('fs');
function imageapi(model, imageurl) {
    userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:93.0) Gecko/20100101 Firefox/93.0"
    blackBox = (function () { // the was exposed to the end user through one of their linked files... 
        for (var p = [], n = 0; 64 > n;)
            p[n] = 0 | (4294967296 * Math.sin(++n % Math.PI));
        return function (t) {
            var u,
                x,
                B,
                D = [(u = 1732584193), (x = 4023233417), ~u, ~x],
                E = [],
                y = unescape(encodeURI(t)) + "\u0080",
                v = y.length;
            t = (--v / 4 + 2) | 15;
            for (E[--t] = 8 * v; ~v;)
                E[v >> 2] |= y.charCodeAt(v) << (8 * v--);
            for (n = y = 0; n < t; n += 16) {
                for (
                    v = D;
                    64 > y;
                    v = [
                        (B = v[3]),
                        u +
                        (((B =
                            v[0] +
                            [
                                (u & x) | (~u & B),
                                (B & u) | (~B & x),
                                u ^ x ^ B,
                                x ^ (u | ~B),
                            ][(v = y >> 4)] +
                            p[y] +
                            ~~E[
                            n | ([y, 5 * y + 1, 3 * y + 5, 7 * y][v] & 15)
                            ]) <<
                            (v = [
                                7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10,
                                15, 21,
                            ][4 * v + (y++ % 4)])) |
                            (B >>> -v)),
                        u,
                        x,
                    ]
                )
                    (u = v[1] | 0), (x = v[2]);
                for (y = 4; y;) D[--y] += v[y];
            }
            for (t = ""; 32 > y;)
                t += ((D[y >> 3] >> (4 * (1 ^ y++))) & 15).toString(16);
            return t.split("").reverse().join("");
        };
    })();
    rand = Math.round(1e11 * Math.random()) + ""; // this is the salt they use
    trialkey = "tryit-" + rand + "-" + blackBox(userAgent + blackBox(userAgent + blackBox(userAgent + rand)));
    console.log(`model: ${model} | key: ${trialkey} | imageurl ${imageurl}`);

    const options = {
        method: 'POST',
        url: `https://api.deepai.org/api/${model}`,
        headers: {
            'api-key': trialkey,
            'User-Agent': userAgent,
            'content-type': 'multipart/form-data; boundary=---011000010111000001101001'
        },
        formData: {
            image: imageurl

            /*
            //local file
            image: {
                value: fs.createReadStream('C:/Users/andy/Downloads/image0.png'),
                options: {filename: 'C:/Users/andy/Downloads/image0.png', contentType: null}
            }*/

        }
    };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        body = JSON.parse(body);
        body.in = { 'inImg': imageurl, 'modelUsed': model };
        return console.log(body);
    });
}
const models = {
    'singleimg': ['colorizer', 'torch-srgan', 'toonify', 'waifu2x', 'nsfw-detector', 'deepdream', 'content-moderation'],
    //'dualimg': ['image-similarity', 'fast-style-transfer', 'neural-style'],
    //'video': ['nsfw-detector', 'content-moderation'],
    //'text': ['sentiment-analysis', 'summarization', 'text-tagging']
}

imageapi(models['singleimg'][0], 'https://helpx.adobe.com/content/dam/help/en/photoshop/using/convert-color-image-black-white/jcr_content/main-pars/before_and_after/image-after/Landscape-BW.jpg');