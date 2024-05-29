import axios from "axios";
import { SocksProxyAgent } from "socks-proxy-agent";
import hexRgb from "hex-rgb";
// ip domain
const baseUrl = "https://polydural.com:21666";
const endpoint = "/place";

export default class RequestManager {
    constructor(startX, startY) {
        this.startX = startX;
        this.startY = startY;
        this.colorPalette = {
            1: "#FFFFFF",
            2: "#272727",
            3: "#FF0000",
            4: "#00FF00",
            5: "#0000FF",
            6: "#FFA1C5",
            7: "#B0B0FF",
            8: "#FFFF00",
            9: "#75C3FF",
            10: "#4BABFF",
            11: "#0188FF",
            12: "#9A75FF",
            13: "#7442FF",
            14: "#4C0BFF",
            15: "#D017FF",
            16: "#DF5FFF",
            17: "#7DFF7D",
            18: "#3FF43F",
            19: "#17C417",
            20: "#0A960A",
            21: "#79E7C2",
            22: "#34CB99",
            23: "#1FAF7F",
            24: "#0C7E58",
            25: "#FF7373",
            26: "#F34848",
            27: "#CE2525",
            28: "#9D1717",
            29: "#FEB278",
            30: "#F19045",
            31: "#D16D21",
            32: "#A75212",
            33: "#E2E2E2",
            34: "#B6B6B6",
            35: "#868686",
            36: "#000000",
            37: "#0E073D",
            38: "#3D0733",
            39: "#3D0707",
            40: "#0E3D07",
            41: "#F9DDCB",
            42: "#EECBB3",
            43: "#E8B390",
            44: "#DC9C72",
            45: "#B47246",
            46: "#864C25",
            47: "#522B11",
            48: "#331908",
            49: "#F4FA8D",
            50: "#EFF86B",
            51: "#DFEB3D",
            52: "#CFDB27",
            53: "#B2BD13",
            54: "#919A0B",
            55: "#6F7608",
            56: "#EFF1CA",
            57: "#FAECE7",
            58: "#F3D8CF",
            59: "#E8C3B7",
            60: "#DDAD9D",
            61: "#FFE0DB",
            62: "#D0EEF4",
            63: "#B7E0E7",
            64: "#A1D0D9"
        }
        for (let color in this.colorPalette) {
            this.colorPalette[color] = hexRgb(this.colorPalette[color])
        }  
    }

    async drawPixel(relX, relY, color, proxy = null) {
        let absX = this.startX + relX;
        let absY = this.startY + relY;

        // transform color hex > ID
        let inputColor = hexRgb(color)
        let mostSimilarColor = { color: 1, distance: 9999}
        for (let paletteColor in this.colorPalette) {
            let paletteColorValue = this.colorPalette[paletteColor]
            let distance = Math.sqrt((inputColor.red - paletteColorValue.red) ** 2 + (inputColor.green - paletteColorValue.green) ** 2 + (inputColor.blue - paletteColorValue.blue) ** 2) // color magnitude
            if (distance < mostSimilarColor.distance) mostSimilarColor = { color: paletteColor, distance: distance}
        }
        let colorId = mostSimilarColor.color
    
        // TEMP (updating old colors to new ones)
        //if (colorId <= 40) return { code: 200, message: "skipped due to old color" }

        // prepare request
        let request = {}
        request['method'] = 'POST',
        request['url']    = `${baseUrl}${endpoint}`,
        request['data']   = {}
        request['data'][`${absX}x${absY}`] = colorId
        request['data']['username'] = `lifeispolydural`

        // request config
        let config = {}
        if (proxy) {
            request['headers'] = {}
            request['headers']['Proxy-Authorization'] = `Basic ${Buffer.from(`${proxy.user}:${proxy.pass}`).toString('base64')}`
            config = {
                httpsAgent: new SocksProxyAgent(`socks5://${proxy.user}:${proxy.pass}@${proxy.proxyUrl}`),
                auth: {
                    username: `${proxy.user}`,
                    password: `${proxy.pass}`
                },
                proxy: false
            }
        }
        let axiosInstance = axios.create(config)

        // attempt request
        try {
            let response = await axiosInstance(request)
            if (response?.data?.message === "you're on timeout") return { code: 429, message: response?.data?.message}
            if (response?.data?.message === "success") return { code: 200, message: response?.data?.message}
            if (response?.data?.message === "out of range") return { code: 400, message: response?.data?.message}
            return { code: 500, message: response?.data}
        } catch (error) {
            return { code: 500, message: error}
        }
    }

    getStartPos() {
        return { x: this.startX, y: this.startY };
    }
}