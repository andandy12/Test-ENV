
const request = require('request');
const fs = require('fs');
function imageapi(model, imageurl) {
  userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:93.0) Gecko/20100101 Firefox/93.0"
  // Should be noted that this dev api key is still valid after I disclosed it 2 years ago 297fafc6-83c6-4ba8-900e-803f4f1559b6 (originally leaked in an npm package)
  blackBox = (function () {
    for (var t = [], p = 0; 64 > p;) t[p] = 0 | 4294967296 * Math.sin(++p % Math.PI);
    return function (m) {
      var v,
        r,
        q,
        E = [
          v = 1732584193,
          r = 4023233417,
          ~v,
          ~r
        ],
        I = [],
        H = unescape(encodeURI(m)) + '',
        F = H.length;
      m = --F / 4 + 2 | 15;
      for (I[--m] = 8 * F; ~F;) I[F >> 2] |= H.charCodeAt(F) << 8 * F--;
      for (p = H = 0; p < m; p += 16) {
        for (
          F = E;
          64 > H;
          F = [
            q = F[3],
            v + (
              (
                q = F[0] + [v & r | ~v & q,
                q & v | ~q & r,
                v ^ r ^ q,
                r ^ (v | ~q)][F = H >> 4] + t[H] + ~~I[p | [
                  H,
                  5 * H + 1,
                  3 * H + 5,
                  7 * H
                ][F] & 15]
              ) << (F = [
                7,
                12,
                17,
                22,
                5,
                9,
                14,
                20,
                4,
                11,
                16,
                23,
                6,
                10,
                15,
                21
              ][4 * F + H++ % 4]) | q >>> - F
            ),
            v,
            r
          ]
        ) v = F[1] | 0,
          r = F[2];
        for (H = 4; H;) E[--H] += F[H]
      }
      for (m = ''; 32 > H;) m += (E[H >> 3] >> 4 * (1 ^ H++) & 15).toString(16);
      return m.split('').reverse().join('')
    }
  })();
  rand = Math.round(100000000000 * Math.random()) + ''; // this is the salt they use
  trialkey = 'tryit-' + e + '-' + g(userAgent + g(userAgent + g(userAgent + rand + 'x')));
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
