import RequestManager from './request.js';
import imageRasterization from './image.js';
import rgbHex from 'rgb-hex';

let imageTarget = './src/man.png';
let targetXRes = 25;
let targetYRes = null;
let startX = -32;
let startY = 47;
let interruptContinueY = 17; // y

async function entry() {
    //rasterize image
    let image = await imageRasterization(imageTarget, targetXRes, targetYRes);
    let roster = image.pixelMatrix
    // request loop
    let requestManager = new RequestManager(startX, startY);
    for (let i = 0; i < roster.length; i++) {
        let row = roster[i]
        for (let j = 0; j < row.length; j++) {
            let pixel = row[j]
            if (i < interruptContinueY) { continue; }


            // 10 proxies available: one per pixel. Get it by % {index}. At the end of every 10 requests, wait 30 seconds and ensure a promise resolve. (requests get put in an array)
            let xyPosition = { x: j, y: i }
            let color = rgbHex(pixel.red, pixel.green, pixel.blue)
            let response;
            do {
                await new Promise(r => setTimeout(r, 500))
                console.log('Drawing pixel at: ', xyPosition.x, xyPosition.y, color)
                if (pixel.alpha == 0) { break; }
                response = await requestManager.drawPixel(xyPosition.x, xyPosition.y, color);
                console.log(response)
                if (response?.code == 429) { await new Promise(r => setTimeout(r, 30000))}
            } while (response?.code !== 200)
        }
    }
}
entry()