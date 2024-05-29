import { Image } from 'image-js'

export default async function imageRasterization(image, maxWidth = null, maxHeight = null) {
    let imageObj = await Image.load(image)

    if (maxWidth && maxHeight) {
        imageObj = imageObj.resize({ width: maxWidth, height: maxHeight, preserveAspectRatio: true})
    } else if (maxWidth) {
        imageObj = imageObj.resize({ width: maxWidth, preserveAspectRatio: true})
    } else if (maxHeight) {
        imageObj = imageObj.resize({ height: maxHeight, preserveAspectRatio: true})
    } else {
        throw new Error('You must provide at least one of maxWidth or maxHeight')
        return
    }

    // get pixel roster (2d array)
    let adjHeight = imageObj.height
    let pixelMatrix = []
    for (let i = 0; i < imageObj.height; i++) {
        let rowRed = imageObj.getRow(i, 0)
        let rowGreen = imageObj.getRow(i, 1)
        let rowBlue = imageObj.getRow(i, 2)
        let rowAlpha = imageObj.getRow(i, 3)
        
        let length = rowRed.length
        let row = []
        for (let j = 0; j < length; j++) {
            let pixel = { red: rowRed[j], green: rowGreen[j], blue: rowBlue[j], alpha: rowAlpha[j]}
            row.push(pixel)
        }
        pixelMatrix.push(row)
    }
    imageObj.save('./preview.png')
    return { pixelMatrix: pixelMatrix, width: imageObj.width, height: adjHeight, imageObj: imageObj}
}
//let response = await imageRasterization('./image.jpg', 75, null)
//console.log(response)