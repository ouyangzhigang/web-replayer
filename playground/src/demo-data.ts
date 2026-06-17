import LZString from 'lz-string';

/**
 * Create a valid rrweb v2 demo session for Playground testing.
 *
 * Key rules:
 *   - Every node in FullSnapshot MUST have an `id` field (numeric)
 *   - IncrementalSource values match rrweb v2 enum:
 *     Mutation=0, MouseMove=1, MouseInteraction=2, Scroll=3, Input=5
 *   - MouseInteraction data has x/y as direct fields (not in position sub-object)
 *   - EventType: Meta=4, FullSnapshot=2, IncrementalSnapshot=3
 */
function createDemoSession(): string {
  const events = [
    {
      "type": 4,
      "data": {
        "href": "https://m.fenqile.com/breakpoint-service/?_FTAG=fenqile.,#/pages/html/index?bizLineId=TEST_003&bizSceneKey=BSK2509101735414781&bizSceneTypeKey=HOME_PAGE",
        "width": 393,
        "height": 764
      },
      "timestamp": 1781071752104
    },
    {
      "type": 2,
      "data": {
        "node": {
          "type": 0,
          "childNodes": [
            {
              "type": 1,
              "name": "html",
              "publicId": "",
              "systemId": "",
              "id": 2
            },
            {
              "type": 2,
              "tagName": "html",
              "attributes": {
                "lang": "utf-8",
                "style": "font-size: 20.96px;"
              },
              "childNodes": [
                {
                  "type": 2,
                  "tagName": "head",
                  "attributes": {},
                  "childNodes": [
                    {
                      "type": 2,
                      "tagName": "style",
                      "attributes": {},
                      "childNodes": [
                        {
                          "type": 3,
                          "textContent": "html, body { width: 100%; height: 100%; }html { -webkit-text-size-adjust: 100%; }body { font-family: -apple-system-font, \"Helvetica Neue\", sans-serif; line-height: 1.6; }* { margin: 0px; padding: 0px; }a img { border: 0px; }a { -webkit-tap-highlight-color: transparent; text-decoration: none; }@font-face { font-weight: 400; font-style: normal; font-family: weui; src: url(\"data:application/octet-stream;base64,AAEAAAALAIAAAwAwR1NVQrD+s+0AAAE4AAAAQk9TLzJAKEx+AAABfAAAAFZjbWFw65cFHQAAAhwAAAJQZ2x5ZvCRR/EAAASUAAAKtGhlYWQMPROtAAAA4AAAADZoaGVhCCwD+gAAALwAAAAkaG10eEJo//8AAAHUAAAASGxvY2EYqhW4AAAEbAAAACZtYXhwASEAVQAAARgAAAAgbmFtZeNcHtgAAA9IAAAB5nBvc3T6bLhLAAARMAAAAOYAAQAAA+gAAABaA+j/////A+kAAQAAAAAAAAAAAAAAAAAAABIAAQAAAAEAACbZbxtfDzz1AAsD6AAAAADUm2dvAAAAANSbZ2///wAAA+kD6gAAAAgAAgAAAAAAAAABAAAAEgBJAAUAAAAAAAIAAAAKAAoAAAD/AAAAAAAAAAEAAAAKAB4ALAABREZMVAAIAAQAAAAAAAAAAQAAAAFsaWdhAAgAAAABAAAAAQAEAAQAAAABAAgAAQAGAAAAAQAAAAAAAQOwAZAABQAIAnoCvAAAAIwCegK8AAAB4AAxAQIAAAIABQMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUGZFZABA6gHqEQPoAAAAWgPqAAAAAAABAAAAAAAAAAAAAAPoAAAD6AAAA+gAAAPoAAAD6AAAA+gAAAPoAAAD6AAAA+gAAAPoAAAD6AAAA+gAAAPoAAAD6AAAA+j//wPoAAAD6AAAAAAABQAAAAMAAAAsAAAABAAAAXQAAQAAAAAAbgADAAEAAAAsAAMACgAAAXQABABCAAAABAAEAAEAAOoR//8AAOoB//8AAAABAAQAAAABAAIAAwAEAAUABgAHAAgACQAKAAsADAANAA4ADwAQABEAAAEGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAAAANwAAAAAAAAAEQAA6gEAAOoBAAAAAQAA6gIAAOoCAAAAAgAA6gMAAOoDAAAAAwAA6gQAAOoEAAAABAAA6gUAAOoFAAAABQAA6gYAAOoGAAAABgAA6gcAAOoHAAAABwAA6ggAAOoIAAAACAAA6gkAAOoJAAAACQAA6goAAOoKAAAACgAA6gsAAOoLAAAACwAA6gwAAOoMAAAADAAA6g0AAOoNAAAADQAA6g4AAOoOAAAADgAA6g8AAOoPAAAADwAA6hAAAOoQAAAAEAAA6hEAAOoRAAAAEQAAAAAARgCMANIBJAF4AcQCMgJgAqgC/ANIA6YD/gROBKAE9AVaAAAAAgAAAAADrwOtABQAKQAAASIHBgcGFBcWFxYyNzY3NjQnJicmAyInJicmNDc2NzYyFxYXFhQHBgcGAfV4Z2Q7PDw7ZGfwZmQ7PDw7ZGZ4bl5bNjc3Nlte215bNjc3NlteA608O2Rn8GdjOzw8O2Nn8GdkOzz8rzc1W17bXlw1Nzc1XF7bXls1NwAAAAACAAAAAAOzA7MAFwAtAAABIgcGBwYVFBcWFxYzMjc2NzY1NCcmJyYTBwYiLwEmNjsBETQ2OwEyFhURMzIWAe52Z2Q7PT07ZGd2fGpmOz4+O2ZpIXYOKA52Dg0XXQsHJgcLXRcNA7M+O2ZqfHZnZDs9PTtkZ3Z9aWY7Pv3wmhISmhIaARcICwsI/ukaAAMAAAAAA+UD5QAXACMALAAAASIHBgcGFRQXFhcWMzI3Njc2NTQnJicmAxQrASI1AzQ7ATIHJyImNDYyFhQGAe6Ecm9BRERBb3KEiXZxQkREQnF1aQIxAwgCQgMBIxIZGSQZGQPkREJxdomEcm9BRERBb3KEinVxQkT9HQICAWICAjEZIxkZIxkAAAAAAgAAAAADsQPkABkALgAAAQYHBgc2BREUFxYXFhc2NzY3NjURJBcmJyYTAQYvASY/ATYyHwEWNjclNjIfARYB9VVVQk+v/tFHPmxebGxdbT1I/tGvT0JVo/7VBASKAwMSAQUBcQEFAgESAgUBEQQD4xMYEhk3YP6sjnVlSD8cHD9IZXWOAVRgNxkSGP62/tkDA48EBBkCAVYCAQHlAQIQBAAAAAADAAAAAAOxA+QAGwAqADMAAAEGBwYHBgcGNxEUFxYXFhc2NzY3NjURJBcmJyYHMzIWFQMUBisBIicDNDYTIiY0NjIWFAYB9UFBODssO38gRz5sXmxsXW09SP7YqFBBVW80BAYMAwImBQELBh4PFhYeFRUD5A8SDhIOEikK/q2PdWRJPh0dPklkdY8BU141GRIY/AYE/sYCAwUBOgQG/kAVHxUVHxUAAAACAAAAAAPkA+QAFwAtAAABIgcGBwYVFBcWFxYzMjc2NzY1NCcmJyYTAQYiLwEmPwE2Mh8BFjI3ATYyHwEWAe6Ecm9BQ0NCbnODiXVxQkREQnF1kf6gAQUBowMDFgEFAYUCBQEBQwIFARUEA+NEQnF1iYNzbkJDQ0FvcoSJdXFCRP6j/qUBAagEBR4CAWYBAQENAgIVBAAAAAQAAAAAA68DrQAUACkAPwBDAAABIgcGBwYUFxYXFjI3Njc2NCcmJyYDIicmJyY0NzY3NjIXFhcWFAcGBwYTBQ4BLwEmBg8BBhYfARYyNwE+ASYiFzAfAQH1eGdkOzw8O2Rn8GZkOzw8O2RmeG5eWzY3NzZbXtteWzY3NzZbXmn+9gYSBmAGDwUDBQEGfQUQBgElBQELEBUBAQOtPDtkZ/BnYzs8PDtjZ/BnZDs8/K83NVte215cNTc3NVxe215bNTcCJt0FAQVJBQIGBAcRBoAGBQEhBQ8LBAEBAAABAAAAAAO7AzoAFwAAEy4BPwE+AR8BFjY3ATYWFycWFAcBBiInPQoGBwUHGgzLDCELAh0LHwsNCgr9uQoeCgGzCyEOCw0HCZMJAQoBvgkCCg0LHQv9sQsKAAAAAAIAAAAAA+UD5gAXACwAAAEiBwYHBhUUFxYXFjMyNzY3NjU0JyYnJhMHBi8BJicmNRM0NjsBMhYVExceAQHvhHJvQUNDQm5zg4l1cUJEREJxdVcQAwT6AwIEEAMCKwIDDsUCAQPlREJxdYmDc25CQ0NBb3KEiXVxQkT9VhwEAncCAgMGAXoCAwMC/q2FAgQAAAQAAAAAA68DrQADABgALQAzAAABMB8BAyIHBgcGFBcWFxYyNzY3NjQnJicmAyInJicmNDc2NzYyFxYXFhQHBgcGAyMVMzUjAuUBAfJ4Z2Q7PDw7ZGfwZmQ7PDw7ZGZ4bl5bNjc3Nlte215bNjc3NltemyT92QKDAQEBLDw7ZGfwZ2M7PDw7Y2fwZ2Q7PPyvNzVbXtteXDU3NzVcXtteWzU3AjH9JAAAAAMAAAAAA+QD5AAXACcAMAAAASIHBgcGFRQXFhcWMzI3Njc2NTQnJicmAzMyFhUDFAYrASImNQM0NhMiJjQ2MhYUBgHuhHJvQUNDQm5zg4l1cUJEREJxdZ42BAYMAwInAwMMBh8PFhYeFhYD40RCcXWJg3NuQkNDQW9yhIl1cUJE/vYGBf7AAgMDAgFABQb+NhYfFhYfFgAABAAAAAADwAPAAAgAEgAoAD0AAAEyNjQmIgYUFhcjFTMRIxUzNSMDIgcGBwYVFBYXFjMyNzY3NjU0Jy4BAyInJicmNDc2NzYyFxYXFhQHBgcGAfQYISEwISFRjzk5yTorhG5rPT99am+DdmhlPD4+PMyFbV5bNTc3NVte2l5bNTc3NVteAqAiLyIiLyI5Hf7EHBwCsT89a26Ed8w8Pj48ZWh2g29qffyjNzVbXtpeWzU3NzVbXtpeWzU3AAADAAAAAAOoA6gACwAgADUAAAEHJwcXBxc3FzcnNwMiBwYHBhQXFhcWMjc2NzY0JyYnJgMiJyYnJjQ3Njc2MhcWFxYUBwYHBgKOmpocmpocmpocmpq2dmZiOjs7OmJm7GZiOjs7OmJmdmtdWTQ2NjRZXdZdWTQ2NjRZXQKqmpocmpocmpocmpoBGTs6YmbsZmI6Ozs6YmbsZmI6O/zCNjRZXdZdWTQ2NjRZXdZdWTQ2AAMAAAAAA+kD6gAaAC8AMAAAAQYHBiMiJyYnJjQ3Njc2MhcWFxYVFAcGBwEHATI3Njc2NCcmJyYiBwYHBhQXFhcWMwKONUBCR21dWjU3NzVaXdpdWzU2GBcrASM5/eBXS0grKysrSEuuSkkqLCwqSUpXASMrFxg2NVtd2l1aNTc3NVpdbUdCQDX+3jkBGSsrSEuuSkkqLCwqSUquS0grKwAC//8AAAPoA+gAFAAwAAABIgcGBwYQFxYXFiA3Njc2ECcmJyYTFg4BIi8BBwYuATQ/AScmPgEWHwE3Nh4BBg8BAfSIdHFDRERDcXQBEHRxQ0REQ3F0SQoBFBsKoqgKGxMKqKIKARQbCqKoChsUAQqoA+hEQ3F0/vB0cUNERENxdAEQdHFDRP1jChsTCqiiCgEUGwqiqAobFAEKqKIKARQbCqIAAAIAAAAAA+QD5AAXADQAAAEiBwYHBhUUFxYXFjMyNzY3NjU0JyYnJhMUBiMFFxYUDwEGLwEuAT8BNh8BFhQPAQUyFh0BAe6Ecm9BQ0NCbnODiXVxQkREQnF1fwQC/pGDAQEVAwTsAgEC7AQEFAIBhAFwAgMD40RCcXWJg3NuQkNDQW9yhIl1cUJE/fYCAwuVAgQCFAQE0AIFAtEEBBQCBQGVCwMDJwAAAAUAAAAAA9QD0wAjACcANwBHAEgAAAERFAYjISImNREjIiY9ATQ2MyE1NDYzITIWHQEhMhYdARQGIyERIREHIgYVERQWOwEyNjURNCYjISIGFREUFjsBMjY1ETQmKwEDeyYb/XYbJkMJDQ0JAQYZEgEvExkBBgkNDQn9CQJc0QkNDQktCQ0NCf7sCQ0NCS0JDQ0JLQMi/TQbJiYbAswMCiwJDS4SGRkSLg0JLAoM/UwCtGsNCf5NCQ0NCQGzCQ0NCf5NCQ0NCQGzCQ0AAAAAEADGAAEAAAAAAAEABAAAAAEAAAAAAAIABwAEAAEAAAAAAAMABAALAAEAAAAAAAQABAAPAAEAAAAAAAUACwATAAEAAAAAAAYABAAeAAEAAAAAAAoAKwAiAAEAAAAAAAsAEwBNAAMAAQQJAAEACABgAAMAAQQJAAIADgBoAAMAAQQJAAMACAB2AAMAAQQJAAQACAB+AAMAAQQJAAUAFgCGAAMAAQQJAAYACACcAAMAAQQJAAoAVgCkAAMAAQQJAAsAJgD6d2V1aVJlZ3VsYXJ3ZXVpd2V1aVZlcnNpb24gMS4wd2V1aUdlbmVyYXRlZCBieSBzdmcydHRmIGZyb20gRm9udGVsbG8gcHJvamVjdC5odHRwOi8vZm9udGVsbG8uY29tAHcAZQB1AGkAUgBlAGcAdQBsAGEAcgB3AGUAdQBpAHcAZQB1AGkAVgBlAHIAcwBpAG8AbgAgADEALgAwAHcAZQB1AGkARwBlAG4AZQByAGEAdABlAGQAIABiAHkAIABzAHYAZwAyAHQAdABmACAAZgByAG8AbQAgAEYAbwBuAHQAZQBsAGwAbwAgAHAAcgBvAGoAZQBjAHQALgBoAHQAdABwADoALwAvAGYAbwBuAHQAZQBsAGwAbwAuAGMAbwBtAAAAAgAAAAAAAAAKAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASAQIBAwEEAQUBBgEHAQgBCQEKAQsBDAENAQ4BDwEQAREBEgETAAZjaXJjbGUIZG93bmxvYWQEaW5mbwxzYWZlX3N1Y2Nlc3MJc2FmZV93YXJuB3N1Y2Nlc3MOc3VjY2Vzcy1jaXJjbGURc3VjY2Vzcy1uby1jaXJjbGUHd2FpdGluZw53YWl0aW5nLWNpcmNsZQR3YXJuC2luZm8tY2lyY2xlBmNhbmNlbAZzZWFyY2gFY2xlYXIEYmFjawZkZWxldGUAAAAA\") format(\"truetype\"); }[class^=\"weui-icon-\"], [class*=\" weui-icon-\"] { vertical-align: middle; font-style: normal; font-variant-caps: normal; font-weight: normal; font-width: normal; line-height: 1; font-family: weui; font-size-adjust: none; font-kerning: auto; font-variant-alternates: normal; font-variant-ligatures: normal; font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-position: normal; font-variant-emoji: normal; font-feature-settings: normal; font-optical-sizing: auto; font-variation-settings: normal; font-size: inherit; text-rendering: auto; -webkit-font-smoothing: antialiased; display: inline-block; }[class^=\"weui-icon-\"]::before, [class*=\" weui-icon-\"]::before { margin-left: 0.2em; margin-right: 0.2em; display: inline-block; }[class^=\"weui-icon_\"]::before, [class*=\" weui-icon_\"]::before { margin: 0px; }.weui-check__label { -webkit-tap-highlight-color: transparent; }.weui-check__label:active { background-color: rgb(236, 236, 236); }.weui-check { position: absolute; left: -9999em; }.weui-cells_radio .weui-cell__ft { padding-left: 0.35em; }.weui-cells_radio .weui-check + .weui-icon-checked { min-width: 16px; }.weui-cells_radio .weui-check:checked + .weui-icon-checked::before { content: \"\"; color: rgb(9, 187, 7); font-size: 16px; display: block; }.weui-cells_checkbox .weui-cell__hd { padding-right: 0.35em; }.weui-cells_checkbox .weui-icon-checked::before { content: \"\"; color: rgb(201, 201, 201); font-size: 23px; display: block; }.weui-cells_checkbox .weui-check:checked + .weui-icon-checked::before { content: \"\"; color: rgb(9, 187, 7); }",
                          "isStyle": true,
                          "id": 6
                        }
                      ],
                      "id": 5
                    },
                    {
                      "type": 2,
                      "tagName": "meta",
                      "attributes": {
                        "content": "text/html; charset=utf-8",
                        "http-equiv": "Content-Type"
                      },
                      "childNodes": [],
                      "id": 7
                    },
                    {
                      "type": 2,
                      "tagName": "meta",
                      "attributes": {
                        "name": "viewport",
                        "content": "width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover"
                      },
                      "childNodes": [],
                      "id": 8
                    },
                    {
                      "type": 2,
                      "tagName": "meta",
                      "attributes": {
                        "name": "mobile-web-app-capable",
                        "content": "yes"
                      },
                      "childNodes": [],
                      "id": 9
                    },
                    {
                      "type": 2,
                      "tagName": "meta",
                      "attributes": {
                        "name": "apple-touch-fullscreen",
                        "content": "yes"
                      },
                      "childNodes": [],
                      "id": 10
                    },
                    {
                      "type": 2,
                      "tagName": "meta",
                      "attributes": {
                        "name": "format-detection",
                        "content": "telephone=no,address=no"
                      },
                      "childNodes": [],
                      "id": 11
                    },
                    {
                      "type": 2,
                      "tagName": "meta",
                      "attributes": {
                        "name": "apple-mobile-web-app-status-bar-style",
                        "content": "white"
                      },
                      "childNodes": [],
                      "id": 12
                    },
                    {
                      "type": 2,
                      "tagName": "meta",
                      "attributes": {
                        "http-equiv": "X-UA-Compatible",
                        "content": "IE=edge,chrome=1"
                      },
                      "childNodes": [],
                      "id": 13
                    },
                    {
                      "type": 2,
                      "tagName": "title",
                      "attributes": {},
                      "childNodes": [],
                      "id": 14
                    },
                    {
                      "type": 2,
                      "tagName": "script",
                      "attributes": {},
                      "childNodes": [
                        {
                          "type": 3,
                          "textContent": "SCRIPT_PLACEHOLDER",
                          "id": 16
                        }
                      ],
                      "id": 15
                    },
                    {
                      "type": 2,
                      "tagName": "script",
                      "attributes": {
                        "src": "https://res.wx.qq.com/open/js/jweixin-1.6.0.js",
                        "async": ""
                      },
                      "childNodes": [],
                      "id": 17
                    },
                    {
                      "type": 2,
                      "tagName": "script",
                      "attributes": {
                        "defer": "defer",
                        "src": "https://cres1.fenqile.cn/taro-app/im-client/assets/js/886.c4513f8c.js"
                      },
                      "childNodes": [],
                      "id": 18
                    },
                    {
                      "type": 2,
                      "tagName": "script",
                      "attributes": {
                        "defer": "defer",
                        "src": "https://cres1.fenqile.cn/taro-app/im-client/assets/js/app.c4513f8c.js"
                      },
                      "childNodes": [],
                      "id": 19
                    },
                    {
                      "type": 2,
                      "tagName": "style",
                      "attributes": {},
                      "childNodes": [
                        {
                          "type": 3,
                          "textContent": "body, html { -webkit-user-select: none; -webkit-tap-highlight-color: transparent; }taro-view-core { display: block; }",
                          "isStyle": true,
                          "id": 21
                        }
                      ],
                      "id": 20
                    },
                    {
                      "type": 2,
                      "tagName": "style",
                      "attributes": {},
                      "childNodes": [
                        {
                          "type": 3,
                          "textContent": "taro-scroll-view-core { -webkit-overflow-scrolling: auto; width: 100%; display: block; }taro-scroll-view-core::-webkit-scrollbar { display: none; }.taro-scroll-view__scroll-x { overflow: scroll hidden; }.taro-scroll-view__scroll-y { overflow: hidden scroll; }",
                          "isStyle": true,
                          "id": 23
                        }
                      ],
                      "id": 22
                    },
                    {
                      "type": 2,
                      "tagName": "style",
                      "attributes": {},
                      "childNodes": [
                        {
                          "type": 3,
                          "textContent": "img[src=\"\"] { opacity: 0; }taro-image-core { width: auto; height: auto; font-size: 0px; display: inline-block; position: relative; overflow: hidden; }.taro-img.taro-img__widthfix { height: 100%; }.taro-img__mode-scaletofill { width: 100%; height: 100%; }.taro-img__mode-aspectfit { max-width: 100%; max-height: 100%; }.taro-img__mode-aspectfill { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); }.taro-img__mode-aspectfill--width { min-width: 100%; height: 100%; }.taro-img__mode-aspectfill--height { width: 100%; min-height: 100%; }.taro-img__mode-widthfix { width: 100%; }.taro-img__mode-heightfix { height: 100%; }.taro-img__mode-top { width: 100%; }.taro-img__mode-bottom { width: 100%; position: absolute; bottom: 0px; }.taro-img__mode-left { height: 100%; }.taro-img__mode-right { height: 100%; position: absolute; right: 0px; }.taro-img__mode-topright { position: absolute; right: 0px; }.taro-img__mode-bottomleft { position: absolute; bottom: 0px; }.taro-img__mode-bottomright { position: absolute; bottom: 0px; right: 0px; }",
                          "isStyle": true,
                          "id": 25
                        }
                      ],
                      "id": 24
                    },
                    {
                      "type": 2,
                      "tagName": "style",
                      "attributes": {},
                      "childNodes": [
                        {
                          "type": 3,
                          "textContent": "taro-text-core { -webkit-user-select: none; display: inline; }taro-text-core[selectable=\"true\"], taro-text-core[user-select=\"true\"] { -webkit-user-select: text; display: inline-block; }taro-text-core[space] { white-space: pre-wrap; }taro-text-core[space=\"ensp\"] { word-spacing: 0.5em; }taro-text-core[space=\"nbsp\"] { word-spacing: 1em; }taro-text-core[number-of-lines] { --line-clamp: 2; overflow-wrap: break-word; text-overflow: ellipsis; -webkit-line-clamp: var(--line-clamp); -webkit-box-orient: vertical; display: -webkit-box; overflow: hidden; }",
                          "isStyle": true,
                          "id": 27
                        }
                      ],
                      "id": 26
                    },
                    {
                      "type": 2,
                      "tagName": "style",
                      "attributes": {},
                      "childNodes": [
                        {
                          "type": 3,
                          "textContent": "taro-textarea-core { width: 300px; display: block; }taro-textarea-core .auto-height { height: auto; }.taro-textarea { height: inherit; appearance: none; cursor: auto; border: 0px; width: 100%; line-height: 1.5; display: block; position: relative; }.taro-textarea:focus { outline: currentcolor; }",
                          "isStyle": true,
                          "id": 29
                        }
                      ],
                      "id": 28
                    },
                    {
                      "type": 2,
                      "tagName": "style",
                      "attributes": {},
                      "childNodes": [
                        {
                          "type": 3,
                          "textContent": ".weui-loading { vertical-align: middle; background: url(\"data:image/svg+xml;charset=utf8, %3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 100 100'%3E%3Cpath fill='none' d='M0 0h100v100H0z'/%3E%3Crect width='7' height='20' x='46.5' y='40' fill='%23E9E9E9' rx='5' ry='5' transform='translate(0 -30)'/%3E%3Crect width='7' height='20' x='46.5' y='40' fill='%23989697' rx='5' ry='5' transform='rotate(30 105.98 65)'/%3E%3Crect width='7' height='20' x='46.5' y='40' fill='%239B999A' rx='5' ry='5' transform='rotate(60 75.98 65)'/%3E%3Crect width='7' height='20' x='46.5' y='40' fill='%23A3A1A2' rx='5' ry='5' transform='rotate(90 65 65)'/%3E%3Crect width='7' height='20' x='46.5' y='40' fill='%23ABA9AA' rx='5' ry='5' transform='rotate(120 58.66 65)'/%3E%3Crect width='7' height='20' x='46.5' y='40' fill='%23B2B2B2' rx='5' ry='5' transform='rotate(150 54.02 65)'/%3E%3Crect width='7' height='20' x='46.5' y='40' fill='%23BAB8B9' rx='5' ry='5' transform='rotate(180 50 65)'/%3E%3Crect width='7' height='20' x='46.5' y='40' fill='%23C2C0C1' rx='5' ry='5' transform='rotate(-150 45.98 65)'/%3E%3Crect width='7' height='20' x='46.5' y='40' fill='%23CBCBCB' rx='5' ry='5' transform='rotate(-120 41.34 65)'/%3E%3Crect width='7' height='20' x='46.5' y='40' fill='%23D2D2D2' rx='5' ry='5' transform='rotate(-90 35 65)'/%3E%3Crect width='7' height='20' x='46.5' y='40' fill='%23DADADA' rx='5' ry='5' transform='rotate(-60 24.02 65)'/%3E%3Crect width='7' height='20' x='46.5' y='40' fill='%23E2E2E2' rx='5' ry='5' transform='rotate(-30 -5.98 65)'/%3E%3C/svg%3E\") 0px 0px / 100% auto no-repeat; width: 20px; height: 20px; animation: 1s steps(12) infinite weuiLoading; display: inline-block; }@keyframes weuiLoading { \n  0% { transform: rotate(0deg); }\n  100% { transform: rotate(360deg); }\n}@keyframes weuiLoading { \n  0% { transform: rotate(0deg); }\n  100% { transform: rotate(360deg); }\n}.weui-btn_loading .weui-loading { margin: -0.2em 0.34em 0px 0px; }.weui-btn_loading.weui-btn_primary, .weui-btn_loading.weui-btn_warn { color: rgba(255, 255, 255, 0.6); }.weui-btn_loading.weui-btn_primary { background-color: rgb(23, 155, 22); }.weui-btn_loading.weui-btn_warn { background-color: rgb(206, 60, 57); }taro-button-core { box-sizing: border-box; appearance: none; text-align: center; color: rgb(0, 0, 0); -webkit-tap-highlight-color: transparent; background-color: rgb(248, 248, 248); border-width: 0px; border-radius: 5px; outline: 0px; width: 100%; margin-left: auto; margin-right: auto; padding-left: 14px; padding-right: 14px; font-size: 18px; line-height: 2.55556; text-decoration: none; display: block; position: relative; overflow: hidden; }taro-button-core:focus { outline: 0px; }taro-button-core:not([disabled]):active { color: rgba(0, 0, 0, 0.6); background-color: rgb(222, 222, 222); }taro-button-core::after { box-sizing: border-box; content: \" \"; transform-origin: 0px 0px; border: 1px solid rgba(0, 0, 0, 0.2); border-radius: 10px; width: 200%; height: 200%; position: absolute; top: 0px; left: 0px; transform: scale(0.5); }taro-button-core + taro-button-core { margin-top: 15px; }taro-button-core[type=\"default\"] { color: rgb(0, 0, 0); background-color: rgb(248, 248, 248); }taro-button-core[type=\"default\"]:not([disabled]):visited { color: rgb(0, 0, 0); }taro-button-core[type=\"default\"]:not([disabled]):active { color: rgba(0, 0, 0, 0.6); background-color: rgb(222, 222, 222); }taro-button-core[size=\"mini\"] { width: auto; padding: 0px 1.32em; font-size: 13px; line-height: 2.3; display: inline-block; }taro-button-core[plain], taro-button-core[plain][type=\"default\"], taro-button-core[plain][type=\"primary\"] { background-color: transparent; border-width: 1px; }taro-button-core[disabled] { color: rgba(255, 255, 255, 0.6); }taro-button-core[disabled][type=\"default\"] { color: rgba(0, 0, 0, 0.3); background-color: rgb(247, 247, 247); }taro-button-core[disabled][type=\"primary\"] { background-color: rgb(158, 217, 157); }taro-button-core[disabled][type=\"warn\"] { background-color: rgb(236, 139, 137); }taro-button-core[loading] .weui-loading { margin: -0.2em 0.34em 0px 0px; }taro-button-core[loading][type=\"primary\"], taro-button-core[loading][type=\"warn\"] { color: rgba(255, 255, 255, 0.6); }taro-button-core[loading][type=\"primary\"] { background-color: rgb(23, 155, 22); }taro-button-core[loading][type=\"warn\"] { background-color: rgb(206, 60, 57); }taro-button-core[plain][type=\"primary\"] { color: rgb(26, 173, 25); border: 1px solid rgb(26, 173, 25); }taro-button-core[plain][type=\"primary\"]:not([disabled]):active { color: rgba(26, 173, 25, 0.6); background-color: transparent; border-color: rgba(26, 173, 25, 0.6); }taro-button-core[plain][type=\"primary\"]::after { border-width: 0px; }taro-button-core[plain][type=\"warn\"] { color: rgb(230, 67, 64); border: 1px solid rgb(230, 67, 64); }taro-button-core[plain][type=\"warn\"]:not([disabled]):active { color: rgba(230, 67, 64, 0.6); background-color: transparent; border-color: rgba(230, 67, 64, 0.6); }taro-button-core[plain][type=\"warn\"]::after { border-width: 0px; }taro-button-core[plain], taro-button-core[plain][type=\"default\"] { color: rgb(53, 53, 53); border: 1px solid rgb(53, 53, 53); }taro-button-core[plain]:not([disabled]):active, taro-button-core[plain][type=\"default\"]:not([disabled]):active { color: rgba(53, 53, 53, 0.6); background-color: transparent; border-color: rgba(53, 53, 53, 0.6); }taro-button-core[plain]::after, taro-button-core[plain][type=\"default\"]::after { border-width: 0px; }taro-button-core[type=\"primary\"] { color: rgb(255, 255, 255); background-color: rgb(26, 173, 25); }taro-button-core[type=\"primary\"]:not([disabled]):visited { color: rgb(255, 255, 255); }taro-button-core[type=\"primary\"]:not([disabled]):active { color: rgba(255, 255, 255, 0.6); background-color: rgb(23, 155, 22); }taro-button-core[type=\"warn\"] { color: rgb(255, 255, 255); background-color: rgb(230, 67, 64); }taro-button-core[type=\"warn\"]:not([disabled]):visited { color: rgb(255, 255, 255); }taro-button-core[type=\"warn\"]:not([disabled]):active { color: rgba(255, 255, 255, 0.6); background-color: rgb(206, 60, 57); }taro-button-core[plain][disabled], taro-button-core[plain][disabled][type=\"primary\"] { color: rgba(0, 0, 0, 0.3); background-color: rgb(247, 247, 247); border: 1px solid rgba(0, 0, 0, 0.2); }",
                          "isStyle": true,
                          "id": 31
                        }
                      ],
                      "id": 30
                    },
                    {
                      "type": 2,
                      "tagName": "link",
                      "attributes": {
                        "href": "https://cres1.fenqile.cn/taro-app/im-client/assets/css/app.c4513f8c005a8170fde2.css",
                        "rel": "stylesheet"
                      },
                      "childNodes": [],
                      "id": 32
                    },
                    {
                      "type": 2,
                      "tagName": "style",
                      "attributes": {},
                      "childNodes": [
                        {
                          "type": 3,
                          "textContent": ".taro-navigation-bar-show { display: flex; background: white; position: sticky; z-index: 500; top: 0px; padding-bottom: 8px; padding-top: calc(env(safe-area-inset-top) + 8px); justify-content: center; align-items: center; }.taro-navigation-bar-hide { display: none; }.taro-navigation-bar-title-wrap { display: flex; height: 24px; }.taro-navigation-bar-title-wrap > .taro-navigation-bar-loading { display: none; animation: 2s linear infinite loading; }.taro-navigation-bar-title-wrap .taro-navigation-bar-loading.taro-navigation-bar-loading-show { display: flex; }.taro-navigation-bar-title-wrap > .taro-navigation-bar-title { font-size: 24px; height: 24px; max-width: 100px; white-space: nowrap; overflow: hidden; line-height: 24px; text-overflow: ellipsis; }@keyframes loading { \n  0% { transform: rotate(0deg); }\n  100% { transform: rotate(360deg); }\n}@keyframes loading { \n  0% { transform: rotate(0deg); }\n  100% { transform: rotate(360deg); }\n}.taro-navigation-bar-no-icon > .taro-navigation-bar-home { display: none; }.taro-navigation-bar-no-icon > .taro-navigation-bar-back { display: none; }.taro-navigation-bar-home-icon > .taro-navigation-bar-home { display: flex; left: 8px; position: absolute; width: 24px; height: 24px; }.taro-navigation-bar-back-icon > .taro-navigation-bar-back { display: flex; left: 8px; position: absolute; width: 24px; height: 24px; }",
                          "isStyle": true,
                          "id": 34
                        }
                      ],
                      "id": 33
                    },
                    {
                      "type": 2,
                      "tagName": "style",
                      "attributes": {},
                      "childNodes": [
                        {
                          "type": 3,
                          "textContent": "body { overflow: hidden; }.taro_router > .taro_page { position: absolute; left: 0px; top: 0px; width: 100%; height: 100%; background-color: rgb(255, 255, 255); transform: translate(100%); transition: transform 300ms; z-index: 0; }.taro_router > .taro_page.taro_tabbar_page, .taro_router > .taro_page.taro_page_show.taro_page_stationed { transform: none; transition: none; }.taro_router > .taro_page.taro_page_show { transform: translate(0px); }",
                          "isStyle": true,
                          "id": 36
                        }
                      ],
                      "id": 35
                    },
                    {
                      "type": 2,
                      "tagName": "style",
                      "attributes": {},
                      "childNodes": [
                        {
                          "type": 3,
                          "textContent": ".taro_router { position: relative; width: 100%; height: 100%; }.taro_page { width: 100%; height: 100%; overflow: hidden scroll; max-height: 100vh; }.taro_page_shade, .taro_router > .taro_page.taro_page_show.taro_page_stationed:not(.taro_page_shade):not(.taro_tabbar_page):not(:last-child) { display: none; }",
                          "isStyle": true,
                          "id": 38
                        }
                      ],
                      "id": 37
                    },
                    {
                      "type": 2,
                      "tagName": "link",
                      "attributes": {
                        "rel": "stylesheet",
                        "type": "text/css",
                        "href": "https://cres1.fenqile.cn/taro-app/im-client/assets/css/795.3c35120ccaf0a61f45ac.css"
                      },
                      "childNodes": [],
                      "id": 39
                    },
                    {
                      "type": 2,
                      "tagName": "script",
                      "attributes": {
                        "src": "https://cres1.fenqile.cn/toolkit/recorder/web-recorder-report-app-v1.0.9.min_df86918f738956fd6ea6622aeb0b2d9b.js"
                      },
                      "childNodes": [],
                      "id": 40
                    },
                    {
                      "type": 2,
                      "tagName": "link",
                      "attributes": {
                        "rel": "stylesheet",
                        "type": "text/css",
                        "href": "https://cres1.fenqile.cn/taro-app/im-client/assets/css/123.d874d89943e60022fe77.css"
                      },
                      "childNodes": [],
                      "id": 41
                    }
                  ],
                  "id": 4
                },
                {
                  "type": 2,
                  "tagName": "body",
                  "attributes": {},
                  "childNodes": [
                    {
                      "type": 2,
                      "tagName": "div",
                      "attributes": {
                        "class": "taro-navigation-bar-no-icon taro-navigation-bar-hide taro-navigation-bar-home-icon",
                        "id": "taro-navigation-bar",
                        "style": "background: rgb(255, 255, 255); color: black;"
                      },
                      "childNodes": [
                        {
                          "type": 2,
                          "tagName": "div",
                          "attributes": {
                            "class": "taro-navigation-bar-home"
                          },
                          "childNodes": [
                            {
                              "type": 3,
                              "textContent": "\n",
                              "id": 45
                            },
                            {
                              "type": 2,
                              "tagName": "svg",
                              "attributes": {
                                "width": "24",
                                "height": "24",
                                "viewBox": "0 0 24 24",
                                "fill": "none",
                                "xmlns": "http://www.w3.org/2000/svg"
                              },
                              "childNodes": [
                                {
                                  "type": 3,
                                  "textContent": "\n    ",
                                  "id": 47
                                },
                                {
                                  "type": 2,
                                  "tagName": "path",
                                  "attributes": {
                                    "d": "M23.8899 12.2737C23.8232 12.3584 23.7237 12.3997 23.6198 12.3974H20.7994V23.5996C20.7994 23.8194 20.6213 24 20.4001 24H14.7994C14.5791 24 14.4002 23.8194 14.4002 23.5996V15.6H9.59963V23.5996C9.59963 23.8194 9.42075 24 9.20033 24H3.59968C3.48981 24 3.38964 23.954 3.31764 23.8811C3.24495 23.8091 3.2004 23.7087 3.2004 23.5996V12.3975H0.398546V12.3967C0.296893 12.396 0.194446 12.3544 0.11579 12.2738C-0.0371146 12.114 -0.0400714 11.864 0.11579 11.7076L11.7201 0.117284C11.8767 -0.0390948 12.1298 -0.0390948 12.2863 0.117284L23.8899 11.7076C24.0465 11.864 24.0265 12.0995 23.8899 12.2737ZM12.0029 0.964625L1.37086 11.5854L3.59968 11.5839V11.5999C3.65537 11.5999 3.70804 11.611 3.75557 11.6307C3.89952 11.692 4.00046 11.8339 4.00046 11.9996V23.1991H8.79955V15.2003C8.79955 14.9789 8.97917 14.8002 9.20033 14.8002H14.7995C15.0207 14.8002 15.2003 14.9789 15.2003 15.2003V23.1991H20.0001V11.9996C20.0001 11.8339 20.1003 11.692 20.2443 11.6307C20.2918 11.611 20.3453 11.5999 20.4001 11.5999V11.5713L22.6193 11.5691L12.0029 0.964625Z",
                                    "fill": "currentColor"
                                  },
                                  "childNodes": [],
                                  "isSVG": true,
                                  "id": 48
                                },
                                {
                                  "type": 3,
                                  "textContent": "\n",
                                  "id": 49
                                }
                              ],
                              "isSVG": true,
                              "id": 46
                            },
                            {
                              "type": 3,
                              "textContent": "\n",
                              "id": 50
                            }
                          ],
                          "id": 44
                        },
                        {
                          "type": 2,
                          "tagName": "div",
                          "attributes": {
                            "class": "taro-navigation-bar-back"
                          },
                          "childNodes": [
                            {
                              "type": 3,
                              "textContent": "\n",
                              "id": 52
                            },
                            {
                              "type": 2,
                              "tagName": "svg",
                              "attributes": {
                                "width": "24",
                                "height": "24",
                                "viewBox": "0 0 24 24",
                                "fill": "none",
                                "xmlns": "http://www.w3.org/2000/svg"
                              },
                              "childNodes": [
                                {
                                  "type": 3,
                                  "textContent": "\n    ",
                                  "id": 54
                                },
                                {
                                  "type": 2,
                                  "tagName": "path",
                                  "attributes": {
                                    "d": "M17.8206 22.9016L7.45515 11.8756L17.8206 1.09845C18.0598 0.849741 18.0598 0.435233 17.8206 0.186528C17.5814 -0.0621762 17.1827 -0.0621762 16.9435 0.186528L6.1794 11.4611C5.9402 11.7098 5.9402 12.1244 6.1794 12.3731L16.9435 23.8135C17.1827 24.0622 17.5814 24.0622 17.8206 23.8135C18.0598 23.5648 18.0598 23.1503 17.8206 22.9016Z",
                                    "fill": "currentColor"
                                  },
                                  "childNodes": [],
                                  "isSVG": true,
                                  "id": 55
                                },
                                {
                                  "type": 3,
                                  "textContent": "\n",
                                  "id": 56
                                }
                              ],
                              "isSVG": true,
                              "id": 53
                            },
                            {
                              "type": 3,
                              "textContent": "\n",
                              "id": 57
                            }
                          ],
                          "id": 51
                        },
                        {
                          "type": 2,
                          "tagName": "div",
                          "attributes": {
                            "class": "taro-navigation-bar-title-wrap"
                          },
                          "childNodes": [
                            {
                              "type": 2,
                              "tagName": "div",
                              "attributes": {
                                "class": "taro-navigation-bar-loading"
                              },
                              "childNodes": [
                                {
                                  "type": 3,
                                  "textContent": "\n",
                                  "id": 60
                                },
                                {
                                  "type": 2,
                                  "tagName": "svg",
                                  "attributes": {
                                    "t": "1709608074670",
                                    "class": "icon",
                                    "viewBox": "0 0 1024 1024",
                                    "version": "1.1",
                                    "xmlns": "http://www.w3.org/2000/svg",
                                    "p-id": "4741",
                                    "width": "24",
                                    "height": "24"
                                  },
                                  "childNodes": [
                                    {
                                      "type": 2,
                                      "tagName": "path",
                                      "attributes": {
                                        "d": "M256 529.066667H85.333333a17.066667 17.066667 0 1 1 0-34.133334h170.666667a17.066667 17.066667 0 0 1 0 34.133334z",
                                        "opacity": ".278",
                                        "p-id": "4742"
                                      },
                                      "childNodes": [],
                                      "isSVG": true,
                                      "id": 62
                                    },
                                    {
                                      "type": 2,
                                      "tagName": "path",
                                      "attributes": {
                                        "d": "M99.84 640a17.066667 17.066667 0 0 1-4.437333-33.553067l164.693333-44.373333a17.066667 17.066667 0 1 1 8.891733 32.9728l-164.693333 44.373333a17.544533 17.544533 0 0 1-4.4544 0.580267z",
                                        "opacity": ".322",
                                        "p-id": "4743"
                                      },
                                      "childNodes": [],
                                      "isSVG": true,
                                      "id": 63
                                    },
                                    {
                                      "type": 2,
                                      "tagName": "path",
                                      "attributes": {
                                        "d": "M264.533333 462.523733a16.896 16.896 0 0 1-4.369066-0.580266l-164.693334-43.52a17.0496 17.0496 0 1 1 8.721067-32.989867l164.693333 43.52a17.066667 17.066667 0 1 1-4.352 33.570133z",
                                        "opacity": ".239",
                                        "p-id": "4744"
                                      },
                                      "childNodes": [],
                                      "isSVG": true,
                                      "id": 64
                                    },
                                    {
                                      "type": 2,
                                      "tagName": "path",
                                      "attributes": {
                                        "d": "M384.017067 307.2a17.032533 17.032533 0 0 1-14.7968-8.533333l-85.333334-147.626667a17.066667 17.066667 0 0 1 29.559467-17.083733l85.333333 147.626666A17.066667 17.066667 0 0 1 384.017067 307.2z",
                                        "opacity": ".122",
                                        "p-id": "4745"
                                      },
                                      "childNodes": [],
                                      "isSVG": true,
                                      "id": 65
                                    },
                                    {
                                      "type": 2,
                                      "tagName": "path",
                                      "attributes": {
                                        "d": "M639.982933 307.2a17.0496 17.0496 0 0 1-14.762666-25.6l85.333333-147.626667a17.066667 17.066667 0 1 1 29.559467 17.066667l-85.333334 147.626667a17.032533 17.032533 0 0 1-14.7968 8.533333z",
                                        "opacity": ".922",
                                        "p-id": "4746"
                                      },
                                      "childNodes": [],
                                      "isSVG": true,
                                      "id": 66
                                    },
                                    {
                                      "type": 2,
                                      "tagName": "path",
                                      "attributes": {
                                        "d": "M692.906667 347.306667a17.066667 17.066667 0 0 1-12.117334-29.098667l120.337067-121.173333a17.066667 17.066667 0 1 1 24.234667 24.046933l-120.337067 121.173333a17.1008 17.1008 0 0 1-12.117333 5.051734z",
                                        "opacity": ".878",
                                        "p-id": "4747"
                                      },
                                      "childNodes": [],
                                      "isSVG": true,
                                      "id": 67
                                    },
                                    {
                                      "type": 2,
                                      "tagName": "path",
                                      "attributes": {
                                        "d": "M733.883733 401.066667a17.066667 17.066667 0 0 1-8.5504-31.8464l147.626667-85.333334a17.0496 17.0496 0 1 1 17.066667 29.5424l-147.626667 85.333334a16.776533 16.776533 0 0 1-8.516267 2.304z",
                                        "opacity": ".839",
                                        "p-id": "4748"
                                      },
                                      "childNodes": [],
                                      "isSVG": true,
                                      "id": 68
                                    },
                                    {
                                      "type": 2,
                                      "tagName": "path",
                                      "attributes": {
                                        "d": "M512 273.066667a17.066667 17.066667 0 0 1-17.066667-17.066667V85.333333a17.066667 17.066667 0 0 1 34.133334 0v170.666667a17.066667 17.066667 0 0 1-17.066667 17.066667z",
                                        "p-id": "4749"
                                      },
                                      "childNodes": [],
                                      "isSVG": true,
                                      "id": 69
                                    },
                                    {
                                      "type": 2,
                                      "tagName": "path",
                                      "attributes": {
                                        "d": "M578.577067 281.6a17.066667 17.066667 0 0 1-16.520534-21.418667l43.52-164.693333a17.066667 17.066667 0 0 1 33.006934 8.721067l-43.52 164.693333a17.066667 17.066667 0 0 1-16.4864 12.6976z",
                                        "opacity": ".961",
                                        "p-id": "4750"
                                      },
                                      "childNodes": [],
                                      "isSVG": true,
                                      "id": 70
                                    },
                                    {
                                      "type": 2,
                                      "tagName": "path",
                                      "attributes": {
                                        "d": "M445.44 282.453333a17.066667 17.066667 0 0 1-16.469333-12.629333l-44.373334-164.693333a17.066667 17.066667 0 0 1 32.955734-8.891734l44.373333 164.693334a17.066667 17.066667 0 0 1-16.4864 21.521066z",
                                        "opacity": ".078",
                                        "p-id": "4751"
                                      },
                                      "childNodes": [],
                                      "isSVG": true,
                                      "id": 71
                                    },
                                    {
                                      "type": 2,
                                      "tagName": "path",
                                      "attributes": {
                                        "d": "M924.177067 640c-1.4848 0-2.9696-0.187733-4.4544-0.580267l-164.693334-44.373333a17.066667 17.066667 0 0 1 8.874667-32.9728l164.693333 44.373333a17.066667 17.066667 0 0 1-4.420266 33.553067z",
                                        "opacity": ".722",
                                        "p-id": "4752"
                                      },
                                      "childNodes": [],
                                      "isSVG": true,
                                      "id": 72
                                    },
                                    {
                                      "type": 2,
                                      "tagName": "path",
                                      "attributes": {
                                        "d": "M881.476267 742.4a17.015467 17.015467 0 0 1-8.482134-2.269867l-148.48-85.333333a17.0496 17.0496 0 1 1 16.9984-29.5936l148.48 85.333333a17.0496 17.0496 0 0 1-8.516266 31.863467z",
                                        "opacity": ".678",
                                        "p-id": "4753"
                                      },
                                      "childNodes": [],
                                      "isSVG": true,
                                      "id": 73
                                    },
                                    {
                                      "type": 2,
                                      "tagName": "path",
                                      "attributes": {
                                        "d": "M813.226667 830.293333a17.015467 17.015467 0 0 1-12.066134-5.000533l-120.337066-120.337067a17.0496 17.0496 0 1 1 24.132266-24.132266l120.337067 120.337066a17.0496 17.0496 0 0 1-12.066133 29.1328z",
                                        "opacity": ".639",
                                        "p-id": "4754"
                                      },
                                      "childNodes": [],
                                      "isSVG": true,
                                      "id": 74
                                    },
                                    {
                                      "type": 2,
                                      "tagName": "path",
                                      "attributes": {
                                        "d": "M938.666667 529.066667H768a17.066667 17.066667 0 1 1 0-34.133334h170.666667a17.066667 17.066667 0 1 1 0 34.133334z",
                                        "opacity": ".761",
                                        "p-id": "4755"
                                      },
                                      "childNodes": [],
                                      "isSVG": true,
                                      "id": 75
                                    },
                                    {
                                      "type": 2,
                                      "tagName": "path",
                                      "attributes": {
                                        "d": "M401.066667 941.226667a17.066667 17.066667 0 0 1-16.4864-21.504l44.373333-164.693334a17.066667 17.066667 0 1 1 32.955733 8.874667l-44.373333 164.693333a17.066667 17.066667 0 0 1-16.469333 12.629334z",
                                        "opacity": ".478",
                                        "p-id": "4756"
                                      },
                                      "childNodes": [],
                                      "isSVG": true,
                                      "id": 76
                                    },
                                    {
                                      "type": 2,
                                      "tagName": "path",
                                      "attributes": {
                                        "d": "M298.6496 898.56a17.066667 17.066667 0 0 1-14.779733-25.565867l85.333333-148.48a17.083733 17.083733 0 0 1 29.5936 16.9984l-85.333333 148.48a17.032533 17.032533 0 0 1-14.813867 8.567467z",
                                        "opacity": ".439",
                                        "p-id": "4757"
                                      },
                                      "childNodes": [],
                                      "isSVG": true,
                                      "id": 77
                                    },
                                    {
                                      "type": 2,
                                      "tagName": "path",
                                      "attributes": {
                                        "d": "M512 955.733333a17.066667 17.066667 0 0 1-17.066667-17.066666V768a17.066667 17.066667 0 1 1 34.133334 0v170.666667a17.066667 17.066667 0 0 1-17.066667 17.066666z",
                                        "opacity": ".522",
                                        "p-id": "4758"
                                      },
                                      "childNodes": [],
                                      "isSVG": true,
                                      "id": 78
                                    },
                                    {
                                      "type": 2,
                                      "tagName": "path",
                                      "attributes": {
                                        "d": "M725.3504 898.56a17.032533 17.032533 0 0 1-14.7968-8.533333l-85.333333-147.626667a17.066667 17.066667 0 0 1 29.559466-17.066667l85.333334 147.626667a17.066667 17.066667 0 0 1-14.762667 25.6z",
                                        "opacity": ".6",
                                        "p-id": "4759"
                                      },
                                      "childNodes": [],
                                      "isSVG": true,
                                      "id": 79
                                    },
                                    {
                                      "type": 2,
                                      "tagName": "path",
                                      "attributes": {
                                        "d": "M622.062933 942.08c-7.509333 0-14.421333-5.0176-16.469333-12.629333l-44.3904-164.693334a17.066667 17.066667 0 1 1 32.9728-8.874666l44.3904 164.693333a17.066667 17.066667 0 0 1-16.503467 21.504z",
                                        "opacity": ".561",
                                        "p-id": "4760"
                                      },
                                      "childNodes": [],
                                      "isSVG": true,
                                      "id": 80
                                    },
                                    {
                                      "type": 2,
                                      "tagName": "path",
                                      "attributes": {
                                        "d": "M759.4496 463.36a17.083733 17.083733 0 0 1-4.420267-33.553067l164.693334-44.373333a17.066667 17.066667 0 0 1 8.874666 32.955733l-164.693333 44.373334a16.657067 16.657067 0 0 1-4.4544 0.597333z",
                                        "opacity": ".702",
                                        "p-id": "4761"
                                      },
                                      "childNodes": [],
                                      "isSVG": true,
                                      "id": 81
                                    },
                                    {
                                      "type": 2,
                                      "tagName": "path",
                                      "attributes": {
                                        "d": "M330.24 347.306667a17.015467 17.015467 0 0 1-12.066133-5.000534l-120.32-120.32a17.0496 17.0496 0 1 1 24.132266-24.132266l120.32 120.32a17.0496 17.0496 0 0 1-12.066133 29.1328z",
                                        "opacity": ".161",
                                        "p-id": "4762"
                                      },
                                      "childNodes": [],
                                      "isSVG": true,
                                      "id": 82
                                    },
                                    {
                                      "type": 2,
                                      "tagName": "path",
                                      "attributes": {
                                        "d": "M290.116267 401.066667a17.032533 17.032533 0 0 1-8.533334-2.286934l-147.626666-85.333333a17.066667 17.066667 0 1 1 17.083733-29.5424l147.626667 85.333333a17.066667 17.066667 0 0 1-8.5504 31.829334z",
                                        "opacity": ".2",
                                        "p-id": "4763"
                                      },
                                      "childNodes": [],
                                      "isSVG": true,
                                      "id": 83
                                    },
                                    {
                                      "type": 2,
                                      "tagName": "path",
                                      "attributes": {
                                        "d": "M142.523733 742.4a17.066667 17.066667 0 0 1-8.567466-31.8464l147.626666-85.333333a17.066667 17.066667 0 1 1 17.083734 29.559466l-147.626667 85.333334a16.930133 16.930133 0 0 1-8.516267 2.286933z",
                                        "opacity": ".361",
                                        "p-id": "4764"
                                      },
                                      "childNodes": [],
                                      "isSVG": true,
                                      "id": 84
                                    },
                                    {
                                      "type": 2,
                                      "tagName": "path",
                                      "attributes": {
                                        "d": "M209.92 830.293333a17.066667 17.066667 0 0 1-12.117333-29.098666l120.32-121.173334a17.066667 17.066667 0 0 1 24.2176 24.029867l-120.32 121.1904a16.896 16.896 0 0 1-12.100267 5.051733z",
                                        "opacity": ".4",
                                        "p-id": "4765"
                                      },
                                      "childNodes": [],
                                      "isSVG": true,
                                      "id": 85
                                    }
                                  ],
                                  "isSVG": true,
                                  "id": 61
                                },
                                {
                                  "type": 3,
                                  "textContent": "\n",
                                  "id": 86
                                }
                              ],
                              "id": 59
                            },
                            {
                              "type": 2,
                              "tagName": "div",
                              "attributes": {
                                "class": "taro-navigation-bar-title"
                              },
                              "childNodes": [],
                              "id": 87
                            }
                          ],
                          "id": 58
                        }
                      ],
                      "id": 43
                    },
                    {
                      "type": 2,
                      "tagName": "div",
                      "attributes": {
                        "id": "app",
                        "class": "taro_router",
                        "data-v-app": ""
                      },
                      "childNodes": [
                        {
                          "type": 3,
                          "textContent": "",
                          "id": 89
                        },
                        {
                          "type": 3,
                          "textContent": "",
                          "id": 90
                        },
                        {
                          "type": 2,
                          "tagName": "div",
                          "attributes": {
                            "id": "/pages/html/index?stamp=AA",
                            "class": "taro_page taro_page_show taro_page_stationed"
                          },
                          "childNodes": [
                            {
                              "type": 2,
                              "tagName": "taro-view-core",
                              "attributes": {
                                "class": "imc-html-page",
                                "option": "[object Object]"
                              },
                              "childNodes": [
                                {
                                  "type": 5,
                                  "textContent": "",
                                  "id": 93
                                },
                                {
                                  "type": 3,
                                  "textContent": "",
                                  "id": 94
                                },
                                {
                                  "type": 3,
                                  "textContent": "",
                                  "id": 95
                                },
                                {
                                  "type": 2,
                                  "tagName": "taro-view-core",
                                  "attributes": {
                                    "class": "imclient-chat-component imclient-html-chat",
                                    "report": "[object Object]"
                                  },
                                  "childNodes": [
                                    {
                                      "type": 5,
                                      "textContent": "",
                                      "id": 97
                                    },
                                    {
                                      "type": 3,
                                      "textContent": "",
                                      "id": 98
                                    },
                                    {
                                      "type": 3,
                                      "textContent": "",
                                      "id": 99
                                    },
                                    {
                                      "type": 3,
                                      "textContent": "",
                                      "id": 100
                                    },
                                    {
                                      "type": 3,
                                      "textContent": "",
                                      "id": 101
                                    },
                                    {
                                      "type": 3,
                                      "textContent": "",
                                      "id": 102
                                    },
                                    {
                                      "type": 3,
                                      "textContent": "",
                                      "id": 103
                                    },
                                    {
                                      "type": 3,
                                      "textContent": "",
                                      "id": 104
                                    },
                                    {
                                      "type": 3,
                                      "textContent": "",
                                      "id": 105
                                    },
                                    {
                                      "type": 3,
                                      "textContent": "",
                                      "id": 106
                                    },
                                    {
                                      "type": 3,
                                      "textContent": "",
                                      "id": 107
                                    },
                                    {
                                      "type": 3,
                                      "textContent": "",
                                      "id": 108
                                    },
                                    {
                                      "type": 2,
                                      "tagName": "taro-view-core",
                                      "attributes": {
                                        "class": "imclient-overlay",
                                        "catchmove": "",
                                        "style": "background-color: transparent;"
                                      },
                                      "childNodes": [
                                        {
                                          "type": 5,
                                          "textContent": "",
                                          "id": 110
                                        },
                                        {
                                          "type": 3,
                                          "textContent": "",
                                          "id": 111
                                        }
                                      ],
                                      "id": 109
                                    },
                                    {
                                      "type": 2,
                                      "tagName": "taro-view-core",
                                      "attributes": {
                                        "class": "imclient-chat-popup full-screen-radius",
                                        "catchmove": "",
                                        "style": "max-height: 78%; z-index: 15; bottom: 0px; transition-duration: 350ms;"
                                      },
                                      "childNodes": [
                                        {
                                          "type": 5,
                                          "textContent": "",
                                          "id": 113
                                        },
                                        {
                                          "type": 3,
                                          "textContent": "",
                                          "id": 114
                                        },
                                        {
                                          "type": 3,
                                          "textContent": "",
                                          "id": 115
                                        },
                                        {
                                          "type": 3,
                                          "textContent": "",
                                          "id": 116
                                        },
                                        {
                                          "type": 3,
                                          "textContent": "",
                                          "id": 117
                                        },
                                        {
                                          "type": 3,
                                          "textContent": "",
                                          "id": 118
                                        },
                                        {
                                          "type": 3,
                                          "textContent": "",
                                          "id": 119
                                        },
                                        {
                                          "type": 3,
                                          "textContent": "",
                                          "id": 120
                                        },
                                        {
                                          "type": 3,
                                          "textContent": "",
                                          "id": 121
                                        },
                                        {
                                          "type": 3,
                                          "textContent": "",
                                          "id": 122
                                        },
                                        {
                                          "type": 3,
                                          "textContent": "",
                                          "id": 123
                                        },
                                        {
                                          "type": 3,
                                          "textContent": "",
                                          "id": 124
                                        },
                                        {
                                          "type": 3,
                                          "textContent": "",
                                          "id": 125
                                        },
                                        {
                                          "type": 3,
                                          "textContent": "",
                                          "id": 126
                                        },
                                        {
                                          "type": 3,
                                          "textContent": "",
                                          "id": 127
                                        },
                                        {
                                          "type": 3,
                                          "textContent": "",
                                          "id": 128
                                        },
                                        {
                                          "type": 3,
                                          "textContent": "",
                                          "id": 129
                                        },
                                        {
                                          "type": 3,
                                          "textContent": "",
                                          "id": 130
                                        },
                                        {
                                          "type": 3,
                                          "textContent": "",
                                          "id": 131
                                        },
                                        {
                                          "type": 2,
                                          "tagName": "taro-view-core",
                                          "attributes": {
                                            "class": ""
                                          },
                                          "childNodes": [
                                            {
                                              "type": 5,
                                              "textContent": "",
                                              "id": 133
                                            },
                                            {
                                              "type": 3,
                                              "textContent": "",
                                              "id": 134
                                            }
                                          ],
                                          "id": 132
                                        },
                                        {
                                          "type": 3,
                                          "textContent": "",
                                          "id": 135
                                        },
                                        {
                                          "type": 2,
                                          "tagName": "taro-view-core",
                                          "attributes": {
                                            "class": "imclient-top-guide"
                                          },
                                          "childNodes": [
                                            {
                                              "type": 5,
                                              "textContent": "",
                                              "id": 137
                                            },
                                            {
                                              "type": 3,
                                              "textContent": "",
                                              "id": 138
                                            },
                                            {
                                              "type": 3,
                                              "textContent": "",
                                              "id": 139
                                            },
                                            {
                                              "type": 2,
                                              "tagName": "taro-scroll-view-core",
                                              "attributes": {
                                                "class": "top-guide-scroll taro-scroll-view__scroll-x",
                                                "show-scrollbar": "false",
                                                "enable-flex": "true",
                                                "scroll-with-animation": "false"
                                              },
                                              "childNodes": [
                                                {
                                                  "type": 5,
                                                  "textContent": "",
                                                  "id": 141
                                                },
                                                {
                                                  "type": 3,
                                                  "textContent": "",
                                                  "id": 142
                                                },
                                                {
                                                  "type": 3,
                                                  "textContent": "",
                                                  "id": 143
                                                },
                                                {
                                                  "type": 3,
                                                  "textContent": "",
                                                  "id": 144
                                                },
                                                {
                                                  "type": 3,
                                                  "textContent": "",
                                                  "id": 145
                                                },
                                                {
                                                  "type": 3,
                                                  "textContent": "",
                                                  "id": 146
                                                },
                                                {
                                                  "type": 3,
                                                  "textContent": "",
                                                  "id": 147
                                                },
                                                {
                                                  "type": 3,
                                                  "textContent": "",
                                                  "id": 148
                                                },
                                                {
                                                  "type": 3,
                                                  "textContent": "",
                                                  "id": 149
                                                },
                                                {
                                                  "type": 3,
                                                  "textContent": "",
                                                  "id": 150
                                                },
                                                {
                                                  "type": 3,
                                                  "textContent": "",
                                                  "id": 151
                                                },
                                                {
                                                  "type": 2,
                                                  "tagName": "taro-view-core",
                                                  "attributes": {
                                                    "class": "top-guide-content"
                                                  },
                                                  "childNodes": [
                                                    {
                                                      "type": 5,
                                                      "textContent": "",
                                                      "id": 153
                                                    },
                                                    {
                                                      "type": 3,
                                                      "textContent": "",
                                                      "id": 154
                                                    },
                                                    {
                                                      "type": 3,
                                                      "textContent": "",
                                                      "id": 155
                                                    },
                                                    {
                                                      "type": 3,
                                                      "textContent": "",
                                                      "id": 156
                                                    },
                                                    {
                                                      "type": 2,
                                                      "tagName": "taro-image-core",
                                                      "attributes": {
                                                        "class": "action-image"
                                                      },
                                                      "childNodes": [
                                                        {
                                                          "type": 2,
                                                          "tagName": "img",
                                                          "attributes": {
                                                            "class": "taro-img__mode-scaletofill",
                                                            "src": "https://coss-platform.fenqile.com/platformresource200/M00/ex/20260304163912-0b791fd5-758f-416d-9173-57555a565a6d.png"
                                                          },
                                                          "childNodes": [],
                                                          "id": 158
                                                        }
                                                      ],
                                                      "id": 157
                                                    },
                                                    {
                                                      "type": 2,
                                                      "tagName": "taro-text-core",
                                                      "attributes": {
                                                        "class": "action-text"
                                                      },
                                                      "childNodes": [
                                                        {
                                                          "type": 5,
                                                          "textContent": "",
                                                          "id": 160
                                                        },
                                                        {
                                                          "type": 3,
                                                          "textContent": "",
                                                          "id": 161
                                                        },
                                                        {
                                                          "type": 3,
                                                          "textContent": "",
                                                          "id": 162
                                                        },
                                                        {
                                                          "type": 3,
                                                          "textContent": "我要提额",
                                                          "id": 163
                                                        }
                                                      ],
                                                      "id": 159
                                                    }
                                                  ],
                                                  "id": 152
                                                },
                                                {
                                                  "type": 2,
                                                  "tagName": "taro-view-core",
                                                  "attributes": {
                                                    "class": "top-guide-content"
                                                  },
                                                  "childNodes": [
                                                    {
                                                      "type": 5,
                                                      "textContent": "",
                                                      "id": 165
                                                    },
                                                    {
                                                      "type": 3,
                                                      "textContent": "",
                                                      "id": 166
                                                    },
                                                    {
                                                      "type": 3,
                                                      "textContent": "",
                                                      "id": 167
                                                    },
                                                    {
                                                      "type": 3,
                                                      "textContent": "",
                                                      "id": 168
                                                    },
                                                    {
                                                      "type": 2,
                                                      "tagName": "taro-image-core",
                                                      "attributes": {
                                                        "class": "action-image"
                                                      },
                                                      "childNodes": [
                                                        {
                                                          "type": 2,
                                                          "tagName": "img",
                                                          "attributes": {
                                                            "class": "taro-img__mode-scaletofill",
                                                            "src": "https://coss-platform.fenqile.com/platformresource200/M00/ex/20260304163912-20586fc0-1d7f-4819-a492-12229cb7730b.png"
                                                          },
                                                          "childNodes": [],
                                                          "id": 170
                                                        }
                                                      ],
                                                      "id": 169
                                                    },
                                                    {
                                                      "type": 2,
                                                      "tagName": "taro-text-core",
                                                      "attributes": {
                                                        "class": "action-text"
                                                      },
                                                      "childNodes": [
                                                        {
                                                          "type": 5,
                                                          "textContent": "",
                                                          "id": 172
                                                        },
                                                        {
                                                          "type": 3,
                                                          "textContent": "",
                                                          "id": 173
                                                        },
                                                        {
                                                          "type": 3,
                                                          "textContent": "",
                                                          "id": 174
                                                        },
                                                        {
                                                          "type": 3,
                                                          "textContent": "修改手机号",
                                                          "id": 175
                                                        }
                                                      ],
                                                      "id": 171
                                                    }
                                                  ],
                                                  "id": 164
                                                },
                                                {
                                                  "type": 2,
                                                  "tagName": "taro-view-core",
                                                  "attributes": {
                                                    "class": "top-guide-content"
                                                  },
                                                  "childNodes": [
                                                    {
                                                      "type": 5,
                                                      "textContent": "",
                                                      "id": 177
                                                    },
                                                    {
                                                      "type": 3,
                                                      "textContent": "",
                                                      "id": 178
                                                    },
                                                    {
                                                      "type": 3,
                                                      "textContent": "",
                                                      "id": 179
                                                    },
                                                    {
                                                      "type": 3,
                                                      "textContent": "",
                                                      "id": 180
                                                    },
                                                    {
                                                      "type": 2,
                                                      "tagName": "taro-image-core",
                                                      "attributes": {
                                                        "class": "action-image"
                                                      },
                                                      "childNodes": [
                                                        {
                                                          "type": 2,
                                                          "tagName": "img",
                                                          "attributes": {
                                                            "class": "taro-img__mode-scaletofill",
                                                            "src": "https://coss-platform.fenqile.com/platformresource200/M00/ex/20260304163912-4a497c32-0caf-4f9b-9521-55557a2a60a8.png"
                                                          },
                                                          "childNodes": [],
                                                          "id": 182
                                                        }
                                                      ],
                                                      "id": 181
                                                    },
                                                    {
                                                      "type": 2,
                                                      "tagName": "taro-text-core",
                                                      "attributes": {
                                                        "class": "action-text"
                                                      },
                                                      "childNodes": [
                                                        {
                                                          "type": 5,
                                                          "textContent": "",
                                                          "id": 184
                                                        },
                                                        {
                                                          "type": 3,
                                                          "textContent": "",
                                                          "id": 185
                                                        },
                                                        {
                                                          "type": 3,
                                                          "textContent": "",
                                                          "id": 186
                                                        },
                                                        {
                                                          "type": 3,
                                                          "textContent": "结清证明",
                                                          "id": 187
                                                        }
                                                      ],
                                                      "id": 183
                                                    }
                                                  ],
                                                  "id": 176
                                                },
                                                {
                                                  "type": 2,
                                                  "tagName": "taro-view-core",
                                                  "attributes": {
                                                    "class": "top-guide-content"
                                                  },
                                                  "childNodes": [
                                                    {
                                                      "type": 5,
                                                      "textContent": "",
                                                      "id": 189
                                                    },
                                                    {
                                                      "type": 3,
                                                      "textContent": "",
                                                      "id": 190
                                                    },
                                                    {
                                                      "type": 3,
                                                      "textContent": "",
                                                      "id": 191
                                                    },
                                                    {
                                                      "type": 3,
                                                      "textContent": "",
                                                      "id": 192
                                                    },
                                                    {
                                                      "type": 2,
                                                      "tagName": "taro-image-core",
                                                      "attributes": {
                                                        "class": "action-image"
                                                      },
                                                      "childNodes": [
                                                        {
                                                          "type": 2,
                                                          "tagName": "img",
                                                          "attributes": {
                                                            "class": "taro-img__mode-scaletofill",
                                                            "src": "https://coss-platform.fenqile.com/platformresource200/M00/ex/20260304163912-db2e2116-a6cb-4d04-9dc3-1c2fb0fd1e1b.png"
                                                          },
                                                          "childNodes": [],
                                                          "id": 194
                                                        }
                                                      ],
                                                      "id": 193
                                                    },
                                                    {
                                                      "type": 2,
                                                      "tagName": "taro-text-core",
                                                      "attributes": {
                                                        "class": "action-text"
                                                      },
                                                      "childNodes": [
                                                        {
                                                          "type": 5,
                                                          "textContent": "",
                                                          "id": 196
                                                        },
                                                        {
                                                          "type": 3,
                                                          "textContent": "",
                                                          "id": 197
                                                        },
                                                        {
                                                          "type": 3,
                                                          "textContent": "",
                                                          "id": 198
                                                        },
                                                        {
                                                          "type": 3,
                                                          "textContent": "退换售后",
                                                          "id": 199
                                                        }
                                                      ],
                                                      "id": 195
                                                    }
                                                  ],
                                                  "id": 188
                                                },
                                                {
                                                  "type": 2,
                                                  "tagName": "taro-view-core",
                                                  "attributes": {
                                                    "class": "top-guide-content"
                                                  },
                                                  "childNodes": [
                                                    {
                                                      "type": 5,
                                                      "textContent": "",
                                                      "id": 201
                                                    },
                                                    {
                                                      "type": 3,
                                                      "textContent": "",
                                                      "id": 202
                                                    },
                                                    {
                                                      "type": 3,
                                                      "textContent": "",
                                                      "id": 203
                                                    },
                                                    {
                                                      "type": 3,
                                                      "textContent": "",
                                                      "id": 204
                                                    },
                                                    {
                                                      "type": 2,
                                                      "tagName": "taro-image-core",
                                                      "attributes": {
                                                        "class": "action-image"
                                                      },
                                                      "childNodes": [
                                                        {
                                                          "type": 2,
                                                          "tagName": "img",
                                                          "attributes": {
                                                            "class": "taro-img__mode-scaletofill",
                                                            "src": "https://coss-platform.fenqile.com/platformresource200/M00/ex/20260304163912-4994ec1b-163b-4c19-9c17-7a6a27460f92.png"
                                                          },
                                                          "childNodes": [],
                                                          "id": 206
                                                        }
                                                      ],
                                                      "id": 205
                                                    },
                                                    {
                                                      "type": 2,
                                                      "tagName": "taro-text-core",
                                                      "attributes": {
                                                        "class": "action-text"
                                                      },
                                                      "childNodes": [
                                                        {
                                                          "type": 5,
                                                          "textContent": "",
                                                          "id": 208
                                                        },
                                                        {
                                                          "type": 3,
                                                          "textContent": "",
                                                          "id": 209
                                                        },
                                                        {
                                                          "type": 3,
                                                          "textContent": "",
                                                          "id": 210
                                                        },
                                                        {
                                                          "type": 3,
                                                          "textContent": "服务进度",
                                                          "id": 211
                                                        }
                                                      ],
                                                      "id": 207
                                                    }
                                                  ],
                                                  "id": 200
                                                },
                                                {
                                                  "type": 2,
                                                  "tagName": "taro-view-core",
                                                  "attributes": {
                                                    "class": "top-guide-content"
                                                  },
                                                  "childNodes": [
                                                    {
                                                      "type": 5,
                                                      "textContent": "",
                                                      "id": 213
                                                    },
                                                    {
                                                      "type": 3,
                                                      "textContent": "",
                                                      "id": 214
                                                    },
                                                    {
                                                      "type": 3,
                                                      "textContent": "",
                                                      "id": 215
                                                    },
                                                    {
                                                      "type": 3,
                                                      "textContent": "",
                                                      "id": 216
                                                    },
                                                    {
                                                      "type": 2,
                                                      "tagName": "taro-image-core",
                                                      "attributes": {
                                                        "class": "action-image"
                                                      },
                                                      "childNodes": [
                                                        {
                                                          "type": 2,
                                                          "tagName": "img",
                                                          "attributes": {
                                                            "class": "taro-img__mode-scaletofill",
                                                            "src": "https://coss-platform.fenqile.com/platformresource200/M00/ex/20260304163912-ee873092-fcb9-4ff8-87ef-2ebb5f3971f1.png"
                                                          },
                                                          "childNodes": [],
                                                          "id": 218
                                                        }
                                                      ],
                                                      "id": 217
                                                    },
                                                    {
                                                      "type": 2,
                                                      "tagName": "taro-text-core",
                                                      "attributes": {
                                                        "class": "action-text"
                                                      },
                                                      "childNodes": [
                                                        {
                                                          "type": 5,
                                                          "textContent": "",
                                                          "id": 220
                                                        },
                                                        {
                                                          "type": 3,
                                                          "textContent": "",
                                                          "id": 221
                                                        },
                                                        {
                                                          "type": 3,
                                                          "textContent": "",
                                                          "id": 222
                                                        },
                                                        {
                                                          "type": 3,
                                                          "textContent": "投诉举报",
                                                          "id": 223
                                                        }
                                                      ],
                                                      "id": 219
                                                    }
                                                  ],
                                                  "id": 212
                                                },
                                                {
                                                  "type": 3,
                                                  "textContent": "",
                                                  "id": 224
                                                }
                                              ],
                                              "id": 140
                                            }
                                          ],
                                          "id": 136
                                        },
                                        {
                                          "type": 2,
                                          "tagName": "taro-view-core",
                                          "attributes": {
                                            "class": "im-chat-body-wrap",
                                            "id": "scrollViewWrap"
                                          },
                                          "childNodes": [
                                            {
                                              "type": 5,
                                              "textContent": "",
                                              "id": 226
                                            },
                                            {
                                              "type": 3,
                                              "textContent": "",
                                              "id": 227
                                            },
                                            {
                                              "type": 3,
                                              "textContent": "",
                                              "id": 228
                                            },
                                            {
                                              "type": 3,
                                              "textContent": "",
                                              "id": 229
                                            },
                                            {
                                              "type": 3,
                                              "textContent": "",
                                              "id": 230
                                            },
                                            {
                                              "type": 2,
                                              "tagName": "taro-scroll-view-core",
                                              "attributes": {
                                                "class": "taro-scroll-view__scroll-y im-chat-body",
                                                "id": "scrollViewContainer",
                                                "scrollintoviewalignment": "end",
                                                "scrollwithanimation": "true",
                                                "scrollanimationduration": "200",
                                                "enablepassive": "true",
                                                "scroll-top": "334",
                                                "showscrollbar": "true",
                                                "rr_scrollTop": 334
                                              },
                                              "childNodes": [
                                                {
                                                  "type": 5,
                                                  "textContent": "",
                                                  "id": 232
                                                },
                                                {
                                                  "type": 3,
                                                  "textContent": "",
                                                  "id": 233
                                                },
                                                {
                                                  "type": 3,
                                                  "textContent": "",
                                                  "id": 234
                                                },
                                                {
                                                  "type": 3,
                                                  "textContent": "",
                                                  "id": 235
                                                },
                                                {
                                                  "type": 2,
                                                  "tagName": "taro-view-core",
                                                  "attributes": {
                                                    "class": "im-chat-body-magic-scroller im-chat-body-scroller",
                                                    "id": "scrollViewScroller",
                                                    "data-observed-resize": "1"
                                                  },
                                                  "childNodes": [
                                                    {
                                                      "type": 5,
                                                      "textContent": "",
                                                      "id": 237
                                                    },
                                                    {
                                                      "type": 3,
                                                      "textContent": "",
                                                      "id": 238
                                                    },
                                                    {
                                                      "type": 3,
                                                      "textContent": "",
                                                      "id": 239
                                                    },
                                                    {
                                                      "type": 3,
                                                      "textContent": "",
                                                      "id": 240
                                                    },
                                                    {
                                                      "type": 3,
                                                      "textContent": "",
                                                      "id": 241
                                                    },
                                                    {
                                                      "type": 3,
                                                      "textContent": "",
                                                      "id": 242
                                                    },
                                                    {
                                                      "type": 5,
                                                      "textContent": "",
                                                      "id": 243
                                                    },
                                                    {
                                                      "type": 3,
                                                      "textContent": "",
                                                      "id": 244
                                                    },
                                                    {
                                                      "type": 2,
                                                      "tagName": "taro-view-core",
                                                      "attributes": {
                                                        "class": "message-category-container",
                                                        "id": "mk_250929165443001"
                                                      },
                                                      "childNodes": [
                                                        {
                                                          "type": 5,
                                                          "textContent": "",
                                                          "id": 246
                                                        },
                                                        {
                                                          "type": 3,
                                                          "textContent": "",
                                                          "id": 247
                                                        },
                                                        {
                                                          "type": 3,
                                                          "textContent": "",
                                                          "id": 248
                                                        },
                                                        {
                                                          "type": 3,
                                                          "textContent": "",
                                                          "id": 249
                                                        },
                                                        {
                                                          "type": 2,
                                                          "tagName": "taro-view-core",
                                                          "attributes": {
                                                            "class": "imclient-time-display"
                                                          },
                                                          "childNodes": [
                                                            {
                                                              "type": 5,
                                                              "textContent": "",
                                                              "id": 251
                                                            },
                                                            {
                                                              "type": 3,
                                                              "textContent": "",
                                                              "id": 252
                                                            },
                                                            {
                                                              "type": 3,
                                                              "textContent": "",
                                                              "id": 253
                                                            },
                                                            {
                                                              "type": 2,
                                                              "tagName": "taro-text-core",
                                                              "attributes": {
                                                                "class": "plain-text"
                                                              },
                                                              "childNodes": [
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 255
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 256
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 257
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "2025-09-29 16:54",
                                                                  "id": 258
                                                                }
                                                              ],
                                                              "id": 254
                                                            }
                                                          ],
                                                          "id": 250
                                                        },
                                                        {
                                                          "type": 2,
                                                          "tagName": "taro-view-core",
                                                          "attributes": {
                                                            "class": "imclient-message-wrap"
                                                          },
                                                          "childNodes": [
                                                            {
                                                              "type": 5,
                                                              "textContent": "",
                                                              "id": 260
                                                            },
                                                            {
                                                              "type": 3,
                                                              "textContent": "",
                                                              "id": 261
                                                            },
                                                            {
                                                              "type": 3,
                                                              "textContent": "",
                                                              "id": 262
                                                            },
                                                            {
                                                              "type": 3,
                                                              "textContent": "",
                                                              "id": 263
                                                            },
                                                            {
                                                              "type": 2,
                                                              "tagName": "taro-image-core",
                                                              "attributes": {
                                                                "class": "message-avatar taro-img__widthfix"
                                                              },
                                                              "childNodes": [
                                                                {
                                                                  "type": 2,
                                                                  "tagName": "img",
                                                                  "attributes": {
                                                                    "class": "taro-img__mode-widthfix",
                                                                    "src": "https://coss-platform.fenqile.com/platformresource200/M00/ex/20251211175539-42948ef7-ba0e-48b3-9193-6de8b94c7364.png"
                                                                  },
                                                                  "childNodes": [],
                                                                  "id": 265
                                                                }
                                                              ],
                                                              "id": 264
                                                            },
                                                            {
                                                              "type": 2,
                                                              "tagName": "taro-view-core",
                                                              "attributes": {
                                                                "class": "message-content"
                                                              },
                                                              "childNodes": [
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 267
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 268
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 269
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 270
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 271
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 272
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 273
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 274
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 275
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 276
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 277
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 278
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 279
                                                                },
                                                                {
                                                                  "type": 2,
                                                                  "tagName": "taro-view-core",
                                                                  "attributes": {
                                                                    "class": "im-message-text"
                                                                  },
                                                                  "childNodes": [
                                                                    {
                                                                      "type": 5,
                                                                      "textContent": "",
                                                                      "id": 281
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 282
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 283
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 284
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 285
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 286
                                                                    },
                                                                    {
                                                                      "type": 2,
                                                                      "tagName": "taro-text-core",
                                                                      "attributes": {
                                                                        "class": "message-text-txt",
                                                                        "style": "--line-clamp: 11;"
                                                                      },
                                                                      "childNodes": [
                                                                        {
                                                                          "type": 5,
                                                                          "textContent": "",
                                                                          "id": 288
                                                                        },
                                                                        {
                                                                          "type": 3,
                                                                          "textContent": "",
                                                                          "id": 289
                                                                        },
                                                                        {
                                                                          "type": 3,
                                                                          "textContent": "",
                                                                          "id": 290
                                                                        },
                                                                        {
                                                                          "type": 3,
                                                                          "textContent": "你好，我是您的专属顾问，请问有什么可以帮您☺",
                                                                          "id": 291
                                                                        }
                                                                      ],
                                                                      "id": 287
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 292
                                                                    }
                                                                  ],
                                                                  "id": 280
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 293
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 294
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 295
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 296
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 297
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 298
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 299
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 300
                                                                }
                                                              ],
                                                              "id": 266
                                                            }
                                                          ],
                                                          "id": 259
                                                        }
                                                      ],
                                                      "id": 245
                                                    },
                                                    {
                                                      "type": 2,
                                                      "tagName": "taro-view-core",
                                                      "attributes": {
                                                        "class": "message-category-container",
                                                        "id": "mk_250929165450002"
                                                      },
                                                      "childNodes": [
                                                        {
                                                          "type": 5,
                                                          "textContent": "",
                                                          "id": 302
                                                        },
                                                        {
                                                          "type": 3,
                                                          "textContent": "",
                                                          "id": 303
                                                        },
                                                        {
                                                          "type": 3,
                                                          "textContent": "",
                                                          "id": 304
                                                        },
                                                        {
                                                          "type": 3,
                                                          "textContent": "",
                                                          "id": 305
                                                        },
                                                        {
                                                          "type": 5,
                                                          "textContent": "",
                                                          "id": 306
                                                        },
                                                        {
                                                          "type": 2,
                                                          "tagName": "taro-view-core",
                                                          "attributes": {
                                                            "class": "imclient-message-wrap imclient-message-wrap-user"
                                                          },
                                                          "childNodes": [
                                                            {
                                                              "type": 5,
                                                              "textContent": "",
                                                              "id": 308
                                                            },
                                                            {
                                                              "type": 3,
                                                              "textContent": "",
                                                              "id": 309
                                                            },
                                                            {
                                                              "type": 3,
                                                              "textContent": "",
                                                              "id": 310
                                                            },
                                                            {
                                                              "type": 3,
                                                              "textContent": "",
                                                              "id": 311
                                                            },
                                                            {
                                                              "type": 2,
                                                              "tagName": "taro-image-core",
                                                              "attributes": {
                                                                "class": "message-avatar message-avatar-user taro-img__widthfix"
                                                              },
                                                              "childNodes": [
                                                                {
                                                                  "type": 2,
                                                                  "tagName": "img",
                                                                  "attributes": {
                                                                    "class": "taro-img__mode-widthfix",
                                                                    "src": "https://coss-platform.fenqile.com/platformresource200/M00/ex/20251211175755-25223520-a94f-463f-969a-c28098e20f38.png"
                                                                  },
                                                                  "childNodes": [],
                                                                  "id": 313
                                                                }
                                                              ],
                                                              "id": 312
                                                            },
                                                            {
                                                              "type": 2,
                                                              "tagName": "taro-view-core",
                                                              "attributes": {
                                                                "class": "message-content"
                                                              },
                                                              "childNodes": [
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 315
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 316
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 317
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 318
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 319
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 320
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 321
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 322
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 323
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 324
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 325
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 326
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 327
                                                                },
                                                                {
                                                                  "type": 2,
                                                                  "tagName": "taro-view-core",
                                                                  "attributes": {
                                                                    "class": "im-message-text im-message-text-user"
                                                                  },
                                                                  "childNodes": [
                                                                    {
                                                                      "type": 5,
                                                                      "textContent": "",
                                                                      "id": 329
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 330
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 331
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 332
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 333
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 334
                                                                    },
                                                                    {
                                                                      "type": 2,
                                                                      "tagName": "taro-text-core",
                                                                      "attributes": {
                                                                        "class": "message-text-txt",
                                                                        "style": "--line-clamp: 11;"
                                                                      },
                                                                      "childNodes": [
                                                                        {
                                                                          "type": 5,
                                                                          "textContent": "",
                                                                          "id": 336
                                                                        },
                                                                        {
                                                                          "type": 3,
                                                                          "textContent": "",
                                                                          "id": 337
                                                                        },
                                                                        {
                                                                          "type": 3,
                                                                          "textContent": "",
                                                                          "id": 338
                                                                        },
                                                                        {
                                                                          "type": 3,
                                                                          "textContent": "觉得很多基督教",
                                                                          "id": 339
                                                                        }
                                                                      ],
                                                                      "id": 335
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 340
                                                                    }
                                                                  ],
                                                                  "id": 328
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 341
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 342
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 343
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 344
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 345
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 346
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 347
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 348
                                                                }
                                                              ],
                                                              "id": 314
                                                            }
                                                          ],
                                                          "id": 307
                                                        }
                                                      ],
                                                      "id": 301
                                                    },
                                                    {
                                                      "type": 2,
                                                      "tagName": "taro-view-core",
                                                      "attributes": {
                                                        "class": "message-category-container",
                                                        "id": "mk_250929165455003"
                                                      },
                                                      "childNodes": [
                                                        {
                                                          "type": 5,
                                                          "textContent": "",
                                                          "id": 350
                                                        },
                                                        {
                                                          "type": 3,
                                                          "textContent": "",
                                                          "id": 351
                                                        },
                                                        {
                                                          "type": 3,
                                                          "textContent": "",
                                                          "id": 352
                                                        },
                                                        {
                                                          "type": 3,
                                                          "textContent": "",
                                                          "id": 353
                                                        },
                                                        {
                                                          "type": 5,
                                                          "textContent": "",
                                                          "id": 354
                                                        },
                                                        {
                                                          "type": 2,
                                                          "tagName": "taro-view-core",
                                                          "attributes": {
                                                            "class": "imclient-message-wrap imclient-message-wrap-user"
                                                          },
                                                          "childNodes": [
                                                            {
                                                              "type": 5,
                                                              "textContent": "",
                                                              "id": 356
                                                            },
                                                            {
                                                              "type": 3,
                                                              "textContent": "",
                                                              "id": 357
                                                            },
                                                            {
                                                              "type": 3,
                                                              "textContent": "",
                                                              "id": 358
                                                            },
                                                            {
                                                              "type": 3,
                                                              "textContent": "",
                                                              "id": 359
                                                            },
                                                            {
                                                              "type": 2,
                                                              "tagName": "taro-image-core",
                                                              "attributes": {
                                                                "class": "message-avatar message-avatar-user taro-img__widthfix"
                                                              },
                                                              "childNodes": [
                                                                {
                                                                  "type": 2,
                                                                  "tagName": "img",
                                                                  "attributes": {
                                                                    "class": "taro-img__mode-widthfix",
                                                                    "src": "https://coss-platform.fenqile.com/platformresource200/M00/ex/20251211175755-25223520-a94f-463f-969a-c28098e20f38.png"
                                                                  },
                                                                  "childNodes": [],
                                                                  "id": 361
                                                                }
                                                              ],
                                                              "id": 360
                                                            },
                                                            {
                                                              "type": 2,
                                                              "tagName": "taro-view-core",
                                                              "attributes": {
                                                                "class": "message-content"
                                                              },
                                                              "childNodes": [
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 363
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 364
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 365
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 366
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 367
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 368
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 369
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 370
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 371
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 372
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 373
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 374
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 375
                                                                },
                                                                {
                                                                  "type": 2,
                                                                  "tagName": "taro-view-core",
                                                                  "attributes": {
                                                                    "class": "im-message-text im-message-text-user"
                                                                  },
                                                                  "childNodes": [
                                                                    {
                                                                      "type": 5,
                                                                      "textContent": "",
                                                                      "id": 377
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 378
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 379
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 380
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 381
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 382
                                                                    },
                                                                    {
                                                                      "type": 2,
                                                                      "tagName": "taro-text-core",
                                                                      "attributes": {
                                                                        "class": "message-text-txt",
                                                                        "style": "--line-clamp: 11;"
                                                                      },
                                                                      "childNodes": [
                                                                        {
                                                                          "type": 5,
                                                                          "textContent": "",
                                                                          "id": 384
                                                                        },
                                                                        {
                                                                          "type": 3,
                                                                          "textContent": "",
                                                                          "id": 385
                                                                        },
                                                                        {
                                                                          "type": 3,
                                                                          "textContent": "",
                                                                          "id": 386
                                                                        },
                                                                        {
                                                                          "type": 3,
                                                                          "textContent": "觉得亟待解决的",
                                                                          "id": 387
                                                                        }
                                                                      ],
                                                                      "id": 383
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 388
                                                                    }
                                                                  ],
                                                                  "id": 376
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 389
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 390
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 391
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 392
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 393
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 394
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 395
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 396
                                                                }
                                                              ],
                                                              "id": 362
                                                            }
                                                          ],
                                                          "id": 355
                                                        }
                                                      ],
                                                      "id": 349
                                                    },
                                                    {
                                                      "type": 2,
                                                      "tagName": "taro-view-core",
                                                      "attributes": {
                                                        "class": "message-category-container",
                                                        "id": "mk_250929165647004"
                                                      },
                                                      "childNodes": [
                                                        {
                                                          "type": 5,
                                                          "textContent": "",
                                                          "id": 398
                                                        },
                                                        {
                                                          "type": 3,
                                                          "textContent": "",
                                                          "id": 399
                                                        },
                                                        {
                                                          "type": 3,
                                                          "textContent": "",
                                                          "id": 400
                                                        },
                                                        {
                                                          "type": 3,
                                                          "textContent": "",
                                                          "id": 401
                                                        },
                                                        {
                                                          "type": 5,
                                                          "textContent": "",
                                                          "id": 402
                                                        },
                                                        {
                                                          "type": 2,
                                                          "tagName": "taro-view-core",
                                                          "attributes": {
                                                            "class": "imclient-message-wrap imclient-message-wrap-user"
                                                          },
                                                          "childNodes": [
                                                            {
                                                              "type": 5,
                                                              "textContent": "",
                                                              "id": 404
                                                            },
                                                            {
                                                              "type": 3,
                                                              "textContent": "",
                                                              "id": 405
                                                            },
                                                            {
                                                              "type": 3,
                                                              "textContent": "",
                                                              "id": 406
                                                            },
                                                            {
                                                              "type": 3,
                                                              "textContent": "",
                                                              "id": 407
                                                            },
                                                            {
                                                              "type": 2,
                                                              "tagName": "taro-image-core",
                                                              "attributes": {
                                                                "class": "message-avatar message-avatar-user taro-img__widthfix"
                                                              },
                                                              "childNodes": [
                                                                {
                                                                  "type": 2,
                                                                  "tagName": "img",
                                                                  "attributes": {
                                                                    "class": "taro-img__mode-widthfix",
                                                                    "src": "https://coss-platform.fenqile.com/platformresource200/M00/ex/20251211175755-25223520-a94f-463f-969a-c28098e20f38.png"
                                                                  },
                                                                  "childNodes": [],
                                                                  "id": 409
                                                                }
                                                              ],
                                                              "id": 408
                                                            },
                                                            {
                                                              "type": 2,
                                                              "tagName": "taro-view-core",
                                                              "attributes": {
                                                                "class": "message-content"
                                                              },
                                                              "childNodes": [
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 411
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 412
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 413
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 414
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 415
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 416
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 417
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 418
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 419
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 420
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 421
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 422
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 423
                                                                },
                                                                {
                                                                  "type": 2,
                                                                  "tagName": "taro-view-core",
                                                                  "attributes": {
                                                                    "class": "im-message-text im-message-text-user"
                                                                  },
                                                                  "childNodes": [
                                                                    {
                                                                      "type": 5,
                                                                      "textContent": "",
                                                                      "id": 425
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 426
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 427
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 428
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 429
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 430
                                                                    },
                                                                    {
                                                                      "type": 2,
                                                                      "tagName": "taro-text-core",
                                                                      "attributes": {
                                                                        "class": "message-text-txt",
                                                                        "style": "--line-clamp: 11;"
                                                                      },
                                                                      "childNodes": [
                                                                        {
                                                                          "type": 5,
                                                                          "textContent": "",
                                                                          "id": 432
                                                                        },
                                                                        {
                                                                          "type": 3,
                                                                          "textContent": "",
                                                                          "id": 433
                                                                        },
                                                                        {
                                                                          "type": 3,
                                                                          "textContent": "",
                                                                          "id": 434
                                                                        },
                                                                        {
                                                                          "type": 3,
                                                                          "textContent": "觉得记得记得",
                                                                          "id": 435
                                                                        }
                                                                      ],
                                                                      "id": 431
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 436
                                                                    }
                                                                  ],
                                                                  "id": 424
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 437
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 438
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 439
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 440
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 441
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 442
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 443
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 444
                                                                }
                                                              ],
                                                              "id": 410
                                                            }
                                                          ],
                                                          "id": 403
                                                        }
                                                      ],
                                                      "id": 397
                                                    },
                                                    {
                                                      "type": 2,
                                                      "tagName": "taro-view-core",
                                                      "attributes": {
                                                        "class": "message-category-container",
                                                        "id": "mk_250929174620001"
                                                      },
                                                      "childNodes": [
                                                        {
                                                          "type": 5,
                                                          "textContent": "",
                                                          "id": 446
                                                        },
                                                        {
                                                          "type": 3,
                                                          "textContent": "",
                                                          "id": 447
                                                        },
                                                        {
                                                          "type": 3,
                                                          "textContent": "",
                                                          "id": 448
                                                        },
                                                        {
                                                          "type": 3,
                                                          "textContent": "",
                                                          "id": 449
                                                        },
                                                        {
                                                          "type": 2,
                                                          "tagName": "taro-view-core",
                                                          "attributes": {
                                                            "class": "imclient-time-display"
                                                          },
                                                          "childNodes": [
                                                            {
                                                              "type": 5,
                                                              "textContent": "",
                                                              "id": 451
                                                            },
                                                            {
                                                              "type": 3,
                                                              "textContent": "",
                                                              "id": 452
                                                            },
                                                            {
                                                              "type": 3,
                                                              "textContent": "",
                                                              "id": 453
                                                            },
                                                            {
                                                              "type": 2,
                                                              "tagName": "taro-text-core",
                                                              "attributes": {
                                                                "class": "plain-text"
                                                              },
                                                              "childNodes": [
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 455
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 456
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 457
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "2025-09-29 17:46",
                                                                  "id": 458
                                                                }
                                                              ],
                                                              "id": 454
                                                            }
                                                          ],
                                                          "id": 450
                                                        },
                                                        {
                                                          "type": 2,
                                                          "tagName": "taro-view-core",
                                                          "attributes": {
                                                            "class": "imclient-message-wrap imclient-message-wrap-user"
                                                          },
                                                          "childNodes": [
                                                            {
                                                              "type": 5,
                                                              "textContent": "",
                                                              "id": 460
                                                            },
                                                            {
                                                              "type": 3,
                                                              "textContent": "",
                                                              "id": 461
                                                            },
                                                            {
                                                              "type": 3,
                                                              "textContent": "",
                                                              "id": 462
                                                            },
                                                            {
                                                              "type": 3,
                                                              "textContent": "",
                                                              "id": 463
                                                            },
                                                            {
                                                              "type": 2,
                                                              "tagName": "taro-image-core",
                                                              "attributes": {
                                                                "class": "message-avatar message-avatar-user taro-img__widthfix"
                                                              },
                                                              "childNodes": [
                                                                {
                                                                  "type": 2,
                                                                  "tagName": "img",
                                                                  "attributes": {
                                                                    "class": "taro-img__mode-widthfix",
                                                                    "src": "https://coss-platform.fenqile.com/platformresource200/M00/ex/20251211175755-25223520-a94f-463f-969a-c28098e20f38.png"
                                                                  },
                                                                  "childNodes": [],
                                                                  "id": 465
                                                                }
                                                              ],
                                                              "id": 464
                                                            },
                                                            {
                                                              "type": 2,
                                                              "tagName": "taro-view-core",
                                                              "attributes": {
                                                                "class": "message-content"
                                                              },
                                                              "childNodes": [
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 467
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 468
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 469
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 470
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 471
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 472
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 473
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 474
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 475
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 476
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 477
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 478
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 479
                                                                },
                                                                {
                                                                  "type": 2,
                                                                  "tagName": "taro-view-core",
                                                                  "attributes": {
                                                                    "class": "im-message-text im-message-text-user"
                                                                  },
                                                                  "childNodes": [
                                                                    {
                                                                      "type": 5,
                                                                      "textContent": "",
                                                                      "id": 481
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 482
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 483
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 484
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 485
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 486
                                                                    },
                                                                    {
                                                                      "type": 2,
                                                                      "tagName": "taro-text-core",
                                                                      "attributes": {
                                                                        "class": "message-text-txt",
                                                                        "style": "--line-clamp: 11;"
                                                                      },
                                                                      "childNodes": [
                                                                        {
                                                                          "type": 5,
                                                                          "textContent": "",
                                                                          "id": 488
                                                                        },
                                                                        {
                                                                          "type": 3,
                                                                          "textContent": "",
                                                                          "id": 489
                                                                        },
                                                                        {
                                                                          "type": 3,
                                                                          "textContent": "",
                                                                          "id": 490
                                                                        },
                                                                        {
                                                                          "type": 3,
                                                                          "textContent": "觉得基督教的",
                                                                          "id": 491
                                                                        }
                                                                      ],
                                                                      "id": 487
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 492
                                                                    }
                                                                  ],
                                                                  "id": 480
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 493
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 494
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 495
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 496
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 497
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 498
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 499
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 500
                                                                }
                                                              ],
                                                              "id": 466
                                                            }
                                                          ],
                                                          "id": 459
                                                        }
                                                      ],
                                                      "id": 445
                                                    },
                                                    {
                                                      "type": 2,
                                                      "tagName": "taro-view-core",
                                                      "attributes": {
                                                        "class": "message-category-container",
                                                        "id": "mk_250929174627002"
                                                      },
                                                      "childNodes": [
                                                        {
                                                          "type": 5,
                                                          "textContent": "",
                                                          "id": 502
                                                        },
                                                        {
                                                          "type": 3,
                                                          "textContent": "",
                                                          "id": 503
                                                        },
                                                        {
                                                          "type": 3,
                                                          "textContent": "",
                                                          "id": 504
                                                        },
                                                        {
                                                          "type": 3,
                                                          "textContent": "",
                                                          "id": 505
                                                        },
                                                        {
                                                          "type": 5,
                                                          "textContent": "",
                                                          "id": 506
                                                        },
                                                        {
                                                          "type": 2,
                                                          "tagName": "taro-view-core",
                                                          "attributes": {
                                                            "class": "imclient-message-wrap imclient-message-wrap-user"
                                                          },
                                                          "childNodes": [
                                                            {
                                                              "type": 5,
                                                              "textContent": "",
                                                              "id": 508
                                                            },
                                                            {
                                                              "type": 3,
                                                              "textContent": "",
                                                              "id": 509
                                                            },
                                                            {
                                                              "type": 3,
                                                              "textContent": "",
                                                              "id": 510
                                                            },
                                                            {
                                                              "type": 3,
                                                              "textContent": "",
                                                              "id": 511
                                                            },
                                                            {
                                                              "type": 2,
                                                              "tagName": "taro-image-core",
                                                              "attributes": {
                                                                "class": "message-avatar message-avatar-user taro-img__widthfix"
                                                              },
                                                              "childNodes": [
                                                                {
                                                                  "type": 2,
                                                                  "tagName": "img",
                                                                  "attributes": {
                                                                    "class": "taro-img__mode-widthfix",
                                                                    "src": "https://coss-platform.fenqile.com/platformresource200/M00/ex/20251211175755-25223520-a94f-463f-969a-c28098e20f38.png"
                                                                  },
                                                                  "childNodes": [],
                                                                  "id": 513
                                                                }
                                                              ],
                                                              "id": 512
                                                            },
                                                            {
                                                              "type": 2,
                                                              "tagName": "taro-view-core",
                                                              "attributes": {
                                                                "class": "message-content"
                                                              },
                                                              "childNodes": [
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 515
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 516
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 517
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 518
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 519
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 520
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 521
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 522
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 523
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 524
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 525
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 526
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 527
                                                                },
                                                                {
                                                                  "type": 2,
                                                                  "tagName": "taro-view-core",
                                                                  "attributes": {
                                                                    "class": "im-message-text im-message-text-user"
                                                                  },
                                                                  "childNodes": [
                                                                    {
                                                                      "type": 5,
                                                                      "textContent": "",
                                                                      "id": 529
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 530
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 531
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 532
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 533
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 534
                                                                    },
                                                                    {
                                                                      "type": 2,
                                                                      "tagName": "taro-text-core",
                                                                      "attributes": {
                                                                        "class": "message-text-txt",
                                                                        "style": "--line-clamp: 11;"
                                                                      },
                                                                      "childNodes": [
                                                                        {
                                                                          "type": 5,
                                                                          "textContent": "",
                                                                          "id": 536
                                                                        },
                                                                        {
                                                                          "type": 3,
                                                                          "textContent": "",
                                                                          "id": 537
                                                                        },
                                                                        {
                                                                          "type": 3,
                                                                          "textContent": "",
                                                                          "id": 538
                                                                        },
                                                                        {
                                                                          "type": 3,
                                                                          "textContent": "觉得基督教简单好多好多好多姐姐",
                                                                          "id": 539
                                                                        }
                                                                      ],
                                                                      "id": 535
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 540
                                                                    }
                                                                  ],
                                                                  "id": 528
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 541
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 542
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 543
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 544
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 545
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 546
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 547
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 548
                                                                }
                                                              ],
                                                              "id": 514
                                                            }
                                                          ],
                                                          "id": 507
                                                        }
                                                      ],
                                                      "id": 501
                                                    },
                                                    {
                                                      "type": 2,
                                                      "tagName": "taro-view-core",
                                                      "attributes": {
                                                        "class": "message-category-container",
                                                        "id": "mk_250929174705003"
                                                      },
                                                      "childNodes": [
                                                        {
                                                          "type": 5,
                                                          "textContent": "",
                                                          "id": 550
                                                        },
                                                        {
                                                          "type": 3,
                                                          "textContent": "",
                                                          "id": 551
                                                        },
                                                        {
                                                          "type": 3,
                                                          "textContent": "",
                                                          "id": 552
                                                        },
                                                        {
                                                          "type": 3,
                                                          "textContent": "",
                                                          "id": 553
                                                        },
                                                        {
                                                          "type": 5,
                                                          "textContent": "",
                                                          "id": 554
                                                        },
                                                        {
                                                          "type": 2,
                                                          "tagName": "taro-view-core",
                                                          "attributes": {
                                                            "class": "imclient-message-wrap imclient-message-wrap-user"
                                                          },
                                                          "childNodes": [
                                                            {
                                                              "type": 5,
                                                              "textContent": "",
                                                              "id": 556
                                                            },
                                                            {
                                                              "type": 3,
                                                              "textContent": "",
                                                              "id": 557
                                                            },
                                                            {
                                                              "type": 3,
                                                              "textContent": "",
                                                              "id": 558
                                                            },
                                                            {
                                                              "type": 3,
                                                              "textContent": "",
                                                              "id": 559
                                                            },
                                                            {
                                                              "type": 2,
                                                              "tagName": "taro-image-core",
                                                              "attributes": {
                                                                "class": "message-avatar message-avatar-user taro-img__widthfix"
                                                              },
                                                              "childNodes": [
                                                                {
                                                                  "type": 2,
                                                                  "tagName": "img",
                                                                  "attributes": {
                                                                    "class": "taro-img__mode-widthfix",
                                                                    "src": "https://coss-platform.fenqile.com/platformresource200/M00/ex/20251211175755-25223520-a94f-463f-969a-c28098e20f38.png"
                                                                  },
                                                                  "childNodes": [],
                                                                  "id": 561
                                                                }
                                                              ],
                                                              "id": 560
                                                            },
                                                            {
                                                              "type": 2,
                                                              "tagName": "taro-view-core",
                                                              "attributes": {
                                                                "class": "message-content"
                                                              },
                                                              "childNodes": [
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 563
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 564
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 565
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 566
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 567
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 568
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 569
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 570
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 571
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 572
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 573
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 574
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 575
                                                                },
                                                                {
                                                                  "type": 2,
                                                                  "tagName": "taro-view-core",
                                                                  "attributes": {
                                                                    "class": "im-message-text im-message-text-user"
                                                                  },
                                                                  "childNodes": [
                                                                    {
                                                                      "type": 5,
                                                                      "textContent": "",
                                                                      "id": 577
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 578
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 579
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 580
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 581
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 582
                                                                    },
                                                                    {
                                                                      "type": 2,
                                                                      "tagName": "taro-text-core",
                                                                      "attributes": {
                                                                        "class": "message-text-txt",
                                                                        "style": "--line-clamp: 11;"
                                                                      },
                                                                      "childNodes": [
                                                                        {
                                                                          "type": 5,
                                                                          "textContent": "",
                                                                          "id": 584
                                                                        },
                                                                        {
                                                                          "type": 3,
                                                                          "textContent": "",
                                                                          "id": 585
                                                                        },
                                                                        {
                                                                          "type": 3,
                                                                          "textContent": "",
                                                                          "id": 586
                                                                        },
                                                                        {
                                                                          "type": 3,
                                                                          "textContent": "好多简单的嫩嫩的",
                                                                          "id": 587
                                                                        }
                                                                      ],
                                                                      "id": 583
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 588
                                                                    }
                                                                  ],
                                                                  "id": 576
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 589
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 590
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 591
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 592
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 593
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 594
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 595
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 596
                                                                }
                                                              ],
                                                              "id": 562
                                                            }
                                                          ],
                                                          "id": 555
                                                        }
                                                      ],
                                                      "id": 549
                                                    },
                                                    {
                                                      "type": 2,
                                                      "tagName": "taro-view-core",
                                                      "attributes": {
                                                        "class": "message-category-container",
                                                        "id": "mk_250929174715004"
                                                      },
                                                      "childNodes": [
                                                        {
                                                          "type": 5,
                                                          "textContent": "",
                                                          "id": 598
                                                        },
                                                        {
                                                          "type": 3,
                                                          "textContent": "",
                                                          "id": 599
                                                        },
                                                        {
                                                          "type": 3,
                                                          "textContent": "",
                                                          "id": 600
                                                        },
                                                        {
                                                          "type": 3,
                                                          "textContent": "",
                                                          "id": 601
                                                        },
                                                        {
                                                          "type": 5,
                                                          "textContent": "",
                                                          "id": 602
                                                        },
                                                        {
                                                          "type": 2,
                                                          "tagName": "taro-view-core",
                                                          "attributes": {
                                                            "class": "imclient-message-wrap imclient-message-wrap-user"
                                                          },
                                                          "childNodes": [
                                                            {
                                                              "type": 5,
                                                              "textContent": "",
                                                              "id": 604
                                                            },
                                                            {
                                                              "type": 3,
                                                              "textContent": "",
                                                              "id": 605
                                                            },
                                                            {
                                                              "type": 3,
                                                              "textContent": "",
                                                              "id": 606
                                                            },
                                                            {
                                                              "type": 3,
                                                              "textContent": "",
                                                              "id": 607
                                                            },
                                                            {
                                                              "type": 2,
                                                              "tagName": "taro-image-core",
                                                              "attributes": {
                                                                "class": "message-avatar message-avatar-user taro-img__widthfix"
                                                              },
                                                              "childNodes": [
                                                                {
                                                                  "type": 2,
                                                                  "tagName": "img",
                                                                  "attributes": {
                                                                    "class": "taro-img__mode-widthfix",
                                                                    "src": "https://coss-platform.fenqile.com/platformresource200/M00/ex/20251211175755-25223520-a94f-463f-969a-c28098e20f38.png"
                                                                  },
                                                                  "childNodes": [],
                                                                  "id": 609
                                                                }
                                                              ],
                                                              "id": 608
                                                            },
                                                            {
                                                              "type": 2,
                                                              "tagName": "taro-view-core",
                                                              "attributes": {
                                                                "class": "message-content"
                                                              },
                                                              "childNodes": [
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 611
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 612
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 613
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 614
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 615
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 616
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 617
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 618
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 619
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 620
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 621
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 622
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 623
                                                                },
                                                                {
                                                                  "type": 2,
                                                                  "tagName": "taro-view-core",
                                                                  "attributes": {
                                                                    "class": "im-message-text im-message-text-user"
                                                                  },
                                                                  "childNodes": [
                                                                    {
                                                                      "type": 5,
                                                                      "textContent": "",
                                                                      "id": 625
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 626
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 627
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 628
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 629
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 630
                                                                    },
                                                                    {
                                                                      "type": 2,
                                                                      "tagName": "taro-text-core",
                                                                      "attributes": {
                                                                        "class": "message-text-txt",
                                                                        "style": "--line-clamp: 11;"
                                                                      },
                                                                      "childNodes": [
                                                                        {
                                                                          "type": 5,
                                                                          "textContent": "",
                                                                          "id": 632
                                                                        },
                                                                        {
                                                                          "type": 3,
                                                                          "textContent": "",
                                                                          "id": 633
                                                                        },
                                                                        {
                                                                          "type": 3,
                                                                          "textContent": "",
                                                                          "id": 634
                                                                        },
                                                                        {
                                                                          "type": 3,
                                                                          "textContent": "好多好多好觉得基督教简单好多基督教简单减肥季节的觉得基督教的基督教",
                                                                          "id": 635
                                                                        }
                                                                      ],
                                                                      "id": 631
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 636
                                                                    }
                                                                  ],
                                                                  "id": 624
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 637
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 638
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 639
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 640
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 641
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 642
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 643
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 644
                                                                }
                                                              ],
                                                              "id": 610
                                                            }
                                                          ],
                                                          "id": 603
                                                        }
                                                      ],
                                                      "id": 597
                                                    },
                                                    {
                                                      "type": 2,
                                                      "tagName": "taro-view-core",
                                                      "attributes": {
                                                        "class": "message-category-container",
                                                        "id": "mk_250929174747005"
                                                      },
                                                      "childNodes": [
                                                        {
                                                          "type": 5,
                                                          "textContent": "",
                                                          "id": 646
                                                        },
                                                        {
                                                          "type": 3,
                                                          "textContent": "",
                                                          "id": 647
                                                        },
                                                        {
                                                          "type": 3,
                                                          "textContent": "",
                                                          "id": 648
                                                        },
                                                        {
                                                          "type": 3,
                                                          "textContent": "",
                                                          "id": 649
                                                        },
                                                        {
                                                          "type": 5,
                                                          "textContent": "",
                                                          "id": 650
                                                        },
                                                        {
                                                          "type": 2,
                                                          "tagName": "taro-view-core",
                                                          "attributes": {
                                                            "class": "imclient-message-wrap imclient-message-wrap-user"
                                                          },
                                                          "childNodes": [
                                                            {
                                                              "type": 5,
                                                              "textContent": "",
                                                              "id": 652
                                                            },
                                                            {
                                                              "type": 3,
                                                              "textContent": "",
                                                              "id": 653
                                                            },
                                                            {
                                                              "type": 3,
                                                              "textContent": "",
                                                              "id": 654
                                                            },
                                                            {
                                                              "type": 3,
                                                              "textContent": "",
                                                              "id": 655
                                                            },
                                                            {
                                                              "type": 2,
                                                              "tagName": "taro-image-core",
                                                              "attributes": {
                                                                "class": "message-avatar message-avatar-user taro-img__widthfix"
                                                              },
                                                              "childNodes": [
                                                                {
                                                                  "type": 2,
                                                                  "tagName": "img",
                                                                  "attributes": {
                                                                    "class": "taro-img__mode-widthfix",
                                                                    "src": "https://coss-platform.fenqile.com/platformresource200/M00/ex/20251211175755-25223520-a94f-463f-969a-c28098e20f38.png"
                                                                  },
                                                                  "childNodes": [],
                                                                  "id": 657
                                                                }
                                                              ],
                                                              "id": 656
                                                            },
                                                            {
                                                              "type": 2,
                                                              "tagName": "taro-view-core",
                                                              "attributes": {
                                                                "class": "message-content"
                                                              },
                                                              "childNodes": [
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 659
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 660
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 661
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 662
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 663
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 664
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 665
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 666
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 667
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 668
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 669
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 670
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 671
                                                                },
                                                                {
                                                                  "type": 2,
                                                                  "tagName": "taro-view-core",
                                                                  "attributes": {
                                                                    "class": "im-message-text im-message-text-user"
                                                                  },
                                                                  "childNodes": [
                                                                    {
                                                                      "type": 5,
                                                                      "textContent": "",
                                                                      "id": 673
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 674
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 675
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 676
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 677
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 678
                                                                    },
                                                                    {
                                                                      "type": 2,
                                                                      "tagName": "taro-text-core",
                                                                      "attributes": {
                                                                        "class": "message-text-txt",
                                                                        "style": "--line-clamp: 11;"
                                                                      },
                                                                      "childNodes": [
                                                                        {
                                                                          "type": 5,
                                                                          "textContent": "",
                                                                          "id": 680
                                                                        },
                                                                        {
                                                                          "type": 3,
                                                                          "textContent": "",
                                                                          "id": 681
                                                                        },
                                                                        {
                                                                          "type": 3,
                                                                          "textContent": "",
                                                                          "id": 682
                                                                        },
                                                                        {
                                                                          "type": 3,
                                                                          "textContent": "觉得基督教的基督教",
                                                                          "id": 683
                                                                        }
                                                                      ],
                                                                      "id": 679
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 684
                                                                    }
                                                                  ],
                                                                  "id": 672
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 685
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 686
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 687
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 688
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 689
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 690
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 691
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 692
                                                                }
                                                              ],
                                                              "id": 658
                                                            }
                                                          ],
                                                          "id": 651
                                                        }
                                                      ],
                                                      "id": 645
                                                    },
                                                    {
                                                      "type": 2,
                                                      "tagName": "taro-view-core",
                                                      "attributes": {
                                                        "class": "message-category-container",
                                                        "id": "mk_250929174812006"
                                                      },
                                                      "childNodes": [
                                                        {
                                                          "type": 5,
                                                          "textContent": "",
                                                          "id": 694
                                                        },
                                                        {
                                                          "type": 3,
                                                          "textContent": "",
                                                          "id": 695
                                                        },
                                                        {
                                                          "type": 3,
                                                          "textContent": "",
                                                          "id": 696
                                                        },
                                                        {
                                                          "type": 3,
                                                          "textContent": "",
                                                          "id": 697
                                                        },
                                                        {
                                                          "type": 5,
                                                          "textContent": "",
                                                          "id": 698
                                                        },
                                                        {
                                                          "type": 2,
                                                          "tagName": "taro-view-core",
                                                          "attributes": {
                                                            "class": "imclient-message-wrap imclient-message-wrap-user"
                                                          },
                                                          "childNodes": [
                                                            {
                                                              "type": 5,
                                                              "textContent": "",
                                                              "id": 700
                                                            },
                                                            {
                                                              "type": 3,
                                                              "textContent": "",
                                                              "id": 701
                                                            },
                                                            {
                                                              "type": 3,
                                                              "textContent": "",
                                                              "id": 702
                                                            },
                                                            {
                                                              "type": 3,
                                                              "textContent": "",
                                                              "id": 703
                                                            },
                                                            {
                                                              "type": 2,
                                                              "tagName": "taro-image-core",
                                                              "attributes": {
                                                                "class": "message-avatar message-avatar-user taro-img__widthfix"
                                                              },
                                                              "childNodes": [
                                                                {
                                                                  "type": 2,
                                                                  "tagName": "img",
                                                                  "attributes": {
                                                                    "class": "taro-img__mode-widthfix",
                                                                    "src": "https://coss-platform.fenqile.com/platformresource200/M00/ex/20251211175755-25223520-a94f-463f-969a-c28098e20f38.png"
                                                                  },
                                                                  "childNodes": [],
                                                                  "id": 705
                                                                }
                                                              ],
                                                              "id": 704
                                                            },
                                                            {
                                                              "type": 2,
                                                              "tagName": "taro-view-core",
                                                              "attributes": {
                                                                "class": "message-content"
                                                              },
                                                              "childNodes": [
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 707
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 708
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 709
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 710
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 711
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 712
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 713
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 714
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 715
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 716
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 717
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 718
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 719
                                                                },
                                                                {
                                                                  "type": 2,
                                                                  "tagName": "taro-view-core",
                                                                  "attributes": {
                                                                    "class": "im-message-text im-message-text-user"
                                                                  },
                                                                  "childNodes": [
                                                                    {
                                                                      "type": 5,
                                                                      "textContent": "",
                                                                      "id": 721
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 722
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 723
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 724
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 725
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 726
                                                                    },
                                                                    {
                                                                      "type": 2,
                                                                      "tagName": "taro-text-core",
                                                                      "attributes": {
                                                                        "class": "message-text-txt",
                                                                        "style": "--line-clamp: 11;"
                                                                      },
                                                                      "childNodes": [
                                                                        {
                                                                          "type": 5,
                                                                          "textContent": "",
                                                                          "id": 728
                                                                        },
                                                                        {
                                                                          "type": 3,
                                                                          "textContent": "",
                                                                          "id": 729
                                                                        },
                                                                        {
                                                                          "type": 3,
                                                                          "textContent": "",
                                                                          "id": 730
                                                                        },
                                                                        {
                                                                          "type": 3,
                                                                          "textContent": "觉得觉得基督教",
                                                                          "id": 731
                                                                        }
                                                                      ],
                                                                      "id": 727
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 732
                                                                    }
                                                                  ],
                                                                  "id": 720
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 733
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 734
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 735
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 736
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 737
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 738
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 739
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 740
                                                                }
                                                              ],
                                                              "id": 706
                                                            }
                                                          ],
                                                          "id": 699
                                                        }
                                                      ],
                                                      "id": 693
                                                    },
                                                    {
                                                      "type": 2,
                                                      "tagName": "taro-view-core",
                                                      "attributes": {
                                                        "class": "message-category-container",
                                                        "id": "mk_250929174814007"
                                                      },
                                                      "childNodes": [
                                                        {
                                                          "type": 5,
                                                          "textContent": "",
                                                          "id": 742
                                                        },
                                                        {
                                                          "type": 3,
                                                          "textContent": "",
                                                          "id": 743
                                                        },
                                                        {
                                                          "type": 3,
                                                          "textContent": "",
                                                          "id": 744
                                                        },
                                                        {
                                                          "type": 3,
                                                          "textContent": "",
                                                          "id": 745
                                                        },
                                                        {
                                                          "type": 5,
                                                          "textContent": "",
                                                          "id": 746
                                                        },
                                                        {
                                                          "type": 2,
                                                          "tagName": "taro-view-core",
                                                          "attributes": {
                                                            "class": "imclient-message-wrap imclient-message-wrap-user"
                                                          },
                                                          "childNodes": [
                                                            {
                                                              "type": 5,
                                                              "textContent": "",
                                                              "id": 748
                                                            },
                                                            {
                                                              "type": 3,
                                                              "textContent": "",
                                                              "id": 749
                                                            },
                                                            {
                                                              "type": 3,
                                                              "textContent": "",
                                                              "id": 750
                                                            },
                                                            {
                                                              "type": 3,
                                                              "textContent": "",
                                                              "id": 751
                                                            },
                                                            {
                                                              "type": 2,
                                                              "tagName": "taro-image-core",
                                                              "attributes": {
                                                                "class": "message-avatar message-avatar-user taro-img__widthfix"
                                                              },
                                                              "childNodes": [
                                                                {
                                                                  "type": 2,
                                                                  "tagName": "img",
                                                                  "attributes": {
                                                                    "class": "taro-img__mode-widthfix",
                                                                    "src": "https://coss-platform.fenqile.com/platformresource200/M00/ex/20251211175755-25223520-a94f-463f-969a-c28098e20f38.png"
                                                                  },
                                                                  "childNodes": [],
                                                                  "id": 753
                                                                }
                                                              ],
                                                              "id": 752
                                                            },
                                                            {
                                                              "type": 2,
                                                              "tagName": "taro-view-core",
                                                              "attributes": {
                                                                "class": "message-content"
                                                              },
                                                              "childNodes": [
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 755
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 756
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 757
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 758
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 759
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 760
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 761
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 762
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 763
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 764
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 765
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 766
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 767
                                                                },
                                                                {
                                                                  "type": 2,
                                                                  "tagName": "taro-view-core",
                                                                  "attributes": {
                                                                    "class": "im-message-text im-message-text-user"
                                                                  },
                                                                  "childNodes": [
                                                                    {
                                                                      "type": 5,
                                                                      "textContent": "",
                                                                      "id": 769
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 770
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 771
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 772
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 773
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 774
                                                                    },
                                                                    {
                                                                      "type": 2,
                                                                      "tagName": "taro-text-core",
                                                                      "attributes": {
                                                                        "class": "message-text-txt",
                                                                        "style": "--line-clamp: 11;"
                                                                      },
                                                                      "childNodes": [
                                                                        {
                                                                          "type": 5,
                                                                          "textContent": "",
                                                                          "id": 776
                                                                        },
                                                                        {
                                                                          "type": 3,
                                                                          "textContent": "",
                                                                          "id": 777
                                                                        },
                                                                        {
                                                                          "type": 3,
                                                                          "textContent": "",
                                                                          "id": 778
                                                                        },
                                                                        {
                                                                          "type": 3,
                                                                          "textContent": "好多基督教的",
                                                                          "id": 779
                                                                        }
                                                                      ],
                                                                      "id": 775
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 780
                                                                    }
                                                                  ],
                                                                  "id": 768
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 781
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 782
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 783
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 784
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 785
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 786
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 787
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 788
                                                                }
                                                              ],
                                                              "id": 754
                                                            }
                                                          ],
                                                          "id": 747
                                                        }
                                                      ],
                                                      "id": 741
                                                    },
                                                    {
                                                      "type": 2,
                                                      "tagName": "taro-view-core",
                                                      "attributes": {
                                                        "class": "message-category-container",
                                                        "id": "mk_250929174819008"
                                                      },
                                                      "childNodes": [
                                                        {
                                                          "type": 5,
                                                          "textContent": "",
                                                          "id": 790
                                                        },
                                                        {
                                                          "type": 3,
                                                          "textContent": "",
                                                          "id": 791
                                                        },
                                                        {
                                                          "type": 3,
                                                          "textContent": "",
                                                          "id": 792
                                                        },
                                                        {
                                                          "type": 3,
                                                          "textContent": "",
                                                          "id": 793
                                                        },
                                                        {
                                                          "type": 5,
                                                          "textContent": "",
                                                          "id": 794
                                                        },
                                                        {
                                                          "type": 2,
                                                          "tagName": "taro-view-core",
                                                          "attributes": {
                                                            "class": "imclient-message-wrap imclient-message-wrap-user"
                                                          },
                                                          "childNodes": [
                                                            {
                                                              "type": 5,
                                                              "textContent": "",
                                                              "id": 796
                                                            },
                                                            {
                                                              "type": 3,
                                                              "textContent": "",
                                                              "id": 797
                                                            },
                                                            {
                                                              "type": 3,
                                                              "textContent": "",
                                                              "id": 798
                                                            },
                                                            {
                                                              "type": 3,
                                                              "textContent": "",
                                                              "id": 799
                                                            },
                                                            {
                                                              "type": 2,
                                                              "tagName": "taro-image-core",
                                                              "attributes": {
                                                                "class": "message-avatar message-avatar-user taro-img__widthfix"
                                                              },
                                                              "childNodes": [
                                                                {
                                                                  "type": 2,
                                                                  "tagName": "img",
                                                                  "attributes": {
                                                                    "class": "taro-img__mode-widthfix",
                                                                    "src": "https://coss-platform.fenqile.com/platformresource200/M00/ex/20251211175755-25223520-a94f-463f-969a-c28098e20f38.png"
                                                                  },
                                                                  "childNodes": [],
                                                                  "id": 801
                                                                }
                                                              ],
                                                              "id": 800
                                                            },
                                                            {
                                                              "type": 2,
                                                              "tagName": "taro-view-core",
                                                              "attributes": {
                                                                "class": "message-content"
                                                              },
                                                              "childNodes": [
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 803
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 804
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 805
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 806
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 807
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 808
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 809
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 810
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 811
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 812
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 813
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 814
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 815
                                                                },
                                                                {
                                                                  "type": 2,
                                                                  "tagName": "taro-view-core",
                                                                  "attributes": {
                                                                    "class": "im-message-text im-message-text-user"
                                                                  },
                                                                  "childNodes": [
                                                                    {
                                                                      "type": 5,
                                                                      "textContent": "",
                                                                      "id": 817
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 818
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 819
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 820
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 821
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 822
                                                                    },
                                                                    {
                                                                      "type": 2,
                                                                      "tagName": "taro-text-core",
                                                                      "attributes": {
                                                                        "class": "message-text-txt",
                                                                        "style": "--line-clamp: 11;"
                                                                      },
                                                                      "childNodes": [
                                                                        {
                                                                          "type": 5,
                                                                          "textContent": "",
                                                                          "id": 824
                                                                        },
                                                                        {
                                                                          "type": 3,
                                                                          "textContent": "",
                                                                          "id": 825
                                                                        },
                                                                        {
                                                                          "type": 3,
                                                                          "textContent": "",
                                                                          "id": 826
                                                                        },
                                                                        {
                                                                          "type": 3,
                                                                          "textContent": "军事基地的大家觉得基督教",
                                                                          "id": 827
                                                                        }
                                                                      ],
                                                                      "id": 823
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 828
                                                                    }
                                                                  ],
                                                                  "id": 816
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 829
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 830
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 831
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 832
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 833
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 834
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 835
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 836
                                                                }
                                                              ],
                                                              "id": 802
                                                            }
                                                          ],
                                                          "id": 795
                                                        }
                                                      ],
                                                      "id": 789
                                                    },
                                                    {
                                                      "type": 2,
                                                      "tagName": "taro-view-core",
                                                      "attributes": {
                                                        "class": "message-category-container",
                                                        "id": "mk_250929174821009"
                                                      },
                                                      "childNodes": [
                                                        {
                                                          "type": 5,
                                                          "textContent": "",
                                                          "id": 838
                                                        },
                                                        {
                                                          "type": 3,
                                                          "textContent": "",
                                                          "id": 839
                                                        },
                                                        {
                                                          "type": 3,
                                                          "textContent": "",
                                                          "id": 840
                                                        },
                                                        {
                                                          "type": 3,
                                                          "textContent": "",
                                                          "id": 841
                                                        },
                                                        {
                                                          "type": 5,
                                                          "textContent": "",
                                                          "id": 842
                                                        },
                                                        {
                                                          "type": 2,
                                                          "tagName": "taro-view-core",
                                                          "attributes": {
                                                            "class": "imclient-message-wrap imclient-message-wrap-user"
                                                          },
                                                          "childNodes": [
                                                            {
                                                              "type": 5,
                                                              "textContent": "",
                                                              "id": 844
                                                            },
                                                            {
                                                              "type": 3,
                                                              "textContent": "",
                                                              "id": 845
                                                            },
                                                            {
                                                              "type": 3,
                                                              "textContent": "",
                                                              "id": 846
                                                            },
                                                            {
                                                              "type": 3,
                                                              "textContent": "",
                                                              "id": 847
                                                            },
                                                            {
                                                              "type": 2,
                                                              "tagName": "taro-image-core",
                                                              "attributes": {
                                                                "class": "message-avatar message-avatar-user taro-img__widthfix"
                                                              },
                                                              "childNodes": [
                                                                {
                                                                  "type": 2,
                                                                  "tagName": "img",
                                                                  "attributes": {
                                                                    "class": "taro-img__mode-widthfix",
                                                                    "src": "https://coss-platform.fenqile.com/platformresource200/M00/ex/20251211175755-25223520-a94f-463f-969a-c28098e20f38.png"
                                                                  },
                                                                  "childNodes": [],
                                                                  "id": 849
                                                                }
                                                              ],
                                                              "id": 848
                                                            },
                                                            {
                                                              "type": 2,
                                                              "tagName": "taro-view-core",
                                                              "attributes": {
                                                                "class": "message-content"
                                                              },
                                                              "childNodes": [
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 851
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 852
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 853
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 854
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 855
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 856
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 857
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 858
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 859
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 860
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 861
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 862
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 863
                                                                },
                                                                {
                                                                  "type": 2,
                                                                  "tagName": "taro-view-core",
                                                                  "attributes": {
                                                                    "class": "im-message-text im-message-text-user"
                                                                  },
                                                                  "childNodes": [
                                                                    {
                                                                      "type": 5,
                                                                      "textContent": "",
                                                                      "id": 865
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 866
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 867
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 868
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 869
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 870
                                                                    },
                                                                    {
                                                                      "type": 2,
                                                                      "tagName": "taro-text-core",
                                                                      "attributes": {
                                                                        "class": "message-text-txt",
                                                                        "style": "--line-clamp: 11;"
                                                                      },
                                                                      "childNodes": [
                                                                        {
                                                                          "type": 5,
                                                                          "textContent": "",
                                                                          "id": 872
                                                                        },
                                                                        {
                                                                          "type": 3,
                                                                          "textContent": "",
                                                                          "id": 873
                                                                        },
                                                                        {
                                                                          "type": 3,
                                                                          "textContent": "",
                                                                          "id": 874
                                                                        },
                                                                        {
                                                                          "type": 3,
                                                                          "textContent": "军事基地就基督教的",
                                                                          "id": 875
                                                                        }
                                                                      ],
                                                                      "id": 871
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 876
                                                                    }
                                                                  ],
                                                                  "id": 864
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 877
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 878
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 879
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 880
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 881
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 882
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 883
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 884
                                                                }
                                                              ],
                                                              "id": 850
                                                            }
                                                          ],
                                                          "id": 843
                                                        }
                                                      ],
                                                      "id": 837
                                                    },
                                                    {
                                                      "type": 2,
                                                      "tagName": "taro-view-core",
                                                      "attributes": {
                                                        "class": "message-category-container",
                                                        "id": "mk_250929174823010"
                                                      },
                                                      "childNodes": [
                                                        {
                                                          "type": 5,
                                                          "textContent": "",
                                                          "id": 886
                                                        },
                                                        {
                                                          "type": 3,
                                                          "textContent": "",
                                                          "id": 887
                                                        },
                                                        {
                                                          "type": 3,
                                                          "textContent": "",
                                                          "id": 888
                                                        },
                                                        {
                                                          "type": 3,
                                                          "textContent": "",
                                                          "id": 889
                                                        },
                                                        {
                                                          "type": 5,
                                                          "textContent": "",
                                                          "id": 890
                                                        },
                                                        {
                                                          "type": 2,
                                                          "tagName": "taro-view-core",
                                                          "attributes": {
                                                            "class": "imclient-message-wrap imclient-message-wrap-user"
                                                          },
                                                          "childNodes": [
                                                            {
                                                              "type": 5,
                                                              "textContent": "",
                                                              "id": 892
                                                            },
                                                            {
                                                              "type": 3,
                                                              "textContent": "",
                                                              "id": 893
                                                            },
                                                            {
                                                              "type": 3,
                                                              "textContent": "",
                                                              "id": 894
                                                            },
                                                            {
                                                              "type": 3,
                                                              "textContent": "",
                                                              "id": 895
                                                            },
                                                            {
                                                              "type": 2,
                                                              "tagName": "taro-image-core",
                                                              "attributes": {
                                                                "class": "message-avatar message-avatar-user taro-img__widthfix"
                                                              },
                                                              "childNodes": [
                                                                {
                                                                  "type": 2,
                                                                  "tagName": "img",
                                                                  "attributes": {
                                                                    "class": "taro-img__mode-widthfix",
                                                                    "src": "https://coss-platform.fenqile.com/platformresource200/M00/ex/20251211175755-25223520-a94f-463f-969a-c28098e20f38.png"
                                                                  },
                                                                  "childNodes": [],
                                                                  "id": 897
                                                                }
                                                              ],
                                                              "id": 896
                                                            },
                                                            {
                                                              "type": 2,
                                                              "tagName": "taro-view-core",
                                                              "attributes": {
                                                                "class": "message-content"
                                                              },
                                                              "childNodes": [
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 899
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 900
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 901
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 902
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 903
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 904
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 905
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 906
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 907
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 908
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 909
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 910
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 911
                                                                },
                                                                {
                                                                  "type": 2,
                                                                  "tagName": "taro-view-core",
                                                                  "attributes": {
                                                                    "class": "im-message-text im-message-text-user"
                                                                  },
                                                                  "childNodes": [
                                                                    {
                                                                      "type": 5,
                                                                      "textContent": "",
                                                                      "id": 913
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 914
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 915
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 916
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 917
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 918
                                                                    },
                                                                    {
                                                                      "type": 2,
                                                                      "tagName": "taro-text-core",
                                                                      "attributes": {
                                                                        "class": "message-text-txt",
                                                                        "style": "--line-clamp: 11;"
                                                                      },
                                                                      "childNodes": [
                                                                        {
                                                                          "type": 5,
                                                                          "textContent": "",
                                                                          "id": 920
                                                                        },
                                                                        {
                                                                          "type": 3,
                                                                          "textContent": "",
                                                                          "id": 921
                                                                        },
                                                                        {
                                                                          "type": 3,
                                                                          "textContent": "",
                                                                          "id": 922
                                                                        },
                                                                        {
                                                                          "type": 3,
                                                                          "textContent": "大家觉得基督教家",
                                                                          "id": 923
                                                                        }
                                                                      ],
                                                                      "id": 919
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 924
                                                                    }
                                                                  ],
                                                                  "id": 912
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 925
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 926
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 927
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 928
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 929
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 930
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 931
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 932
                                                                }
                                                              ],
                                                              "id": 898
                                                            }
                                                          ],
                                                          "id": 891
                                                        }
                                                      ],
                                                      "id": 885
                                                    },
                                                    {
                                                      "type": 2,
                                                      "tagName": "taro-view-core",
                                                      "attributes": {
                                                        "class": "message-category-container",
                                                        "id": "mk_260114154214001"
                                                      },
                                                      "childNodes": [
                                                        {
                                                          "type": 5,
                                                          "textContent": "",
                                                          "id": 934
                                                        },
                                                        {
                                                          "type": 3,
                                                          "textContent": "",
                                                          "id": 935
                                                        },
                                                        {
                                                          "type": 3,
                                                          "textContent": "",
                                                          "id": 936
                                                        },
                                                        {
                                                          "type": 3,
                                                          "textContent": "",
                                                          "id": 937
                                                        },
                                                        {
                                                          "type": 2,
                                                          "tagName": "taro-view-core",
                                                          "attributes": {
                                                            "class": "imclient-time-display"
                                                          },
                                                          "childNodes": [
                                                            {
                                                              "type": 5,
                                                              "textContent": "",
                                                              "id": 939
                                                            },
                                                            {
                                                              "type": 3,
                                                              "textContent": "",
                                                              "id": 940
                                                            },
                                                            {
                                                              "type": 3,
                                                              "textContent": "",
                                                              "id": 941
                                                            },
                                                            {
                                                              "type": 2,
                                                              "tagName": "taro-text-core",
                                                              "attributes": {
                                                                "class": "plain-text"
                                                              },
                                                              "childNodes": [
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 943
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 944
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 945
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "01-14 15:42",
                                                                  "id": 946
                                                                }
                                                              ],
                                                              "id": 942
                                                            }
                                                          ],
                                                          "id": 938
                                                        },
                                                        {
                                                          "type": 2,
                                                          "tagName": "taro-view-core",
                                                          "attributes": {
                                                            "class": "imclient-message-wrap"
                                                          },
                                                          "childNodes": [
                                                            {
                                                              "type": 5,
                                                              "textContent": "",
                                                              "id": 948
                                                            },
                                                            {
                                                              "type": 3,
                                                              "textContent": "",
                                                              "id": 949
                                                            },
                                                            {
                                                              "type": 3,
                                                              "textContent": "",
                                                              "id": 950
                                                            },
                                                            {
                                                              "type": 3,
                                                              "textContent": "",
                                                              "id": 951
                                                            },
                                                            {
                                                              "type": 2,
                                                              "tagName": "taro-image-core",
                                                              "attributes": {
                                                                "class": "message-avatar taro-img__widthfix"
                                                              },
                                                              "childNodes": [
                                                                {
                                                                  "type": 2,
                                                                  "tagName": "img",
                                                                  "attributes": {
                                                                    "class": "taro-img__mode-widthfix",
                                                                    "src": "https://coss-platform.fenqile.com/platformresource200/M00/ex/20251211175539-42948ef7-ba0e-48b3-9193-6de8b94c7364.png"
                                                                  },
                                                                  "childNodes": [],
                                                                  "id": 953
                                                                }
                                                              ],
                                                              "id": 952
                                                            },
                                                            {
                                                              "type": 2,
                                                              "tagName": "taro-view-core",
                                                              "attributes": {
                                                                "class": "message-content"
                                                              },
                                                              "childNodes": [
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 955
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 956
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 957
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 958
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 959
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 960
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 961
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 962
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 963
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 964
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 965
                                                                },
                                                                {
                                                                  "type": 3,
                                                                  "textContent": "",
                                                                  "id": 966
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 967
                                                                },
                                                                {
                                                                  "type": 2,
                                                                  "tagName": "taro-view-core",
                                                                  "attributes": {
                                                                    "class": "im-message-text"
                                                                  },
                                                                  "childNodes": [
                                                                    {
                                                                      "type": 5,
                                                                      "textContent": "",
                                                                      "id": 969
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 970
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 971
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 972
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 973
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 974
                                                                    },
                                                                    {
                                                                      "type": 2,
                                                                      "tagName": "taro-text-core",
                                                                      "attributes": {
                                                                        "class": "message-text-txt",
                                                                        "style": "--line-clamp: 11;"
                                                                      },
                                                                      "childNodes": [
                                                                        {
                                                                          "type": 5,
                                                                          "textContent": "",
                                                                          "id": 976
                                                                        },
                                                                        {
                                                                          "type": 3,
                                                                          "textContent": "",
                                                                          "id": 977
                                                                        },
                                                                        {
                                                                          "type": 3,
                                                                          "textContent": "",
                                                                          "id": 978
                                                                        },
                                                                        {
                                                                          "type": 3,
                                                                          "textContent": "32232",
                                                                          "id": 979
                                                                        }
                                                                      ],
                                                                      "id": 975
                                                                    },
                                                                    {
                                                                      "type": 3,
                                                                      "textContent": "",
                                                                      "id": 980
                                                                    }
                                                                  ],
                                                                  "id": 968
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 981
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 982
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 983
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 984
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 985
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 986
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 987
                                                                },
                                                                {
                                                                  "type": 5,
                                                                  "textContent": "",
                                                                  "id": 988
                                                                }
                                                              ],
                                                              "id": 954
                                                            }
                                                          ],
                                                          "id": 947
                                                        }
                                                      ],
                                                      "id": 933
                                                    },
                                                    {
                                                      "type": 3,
                                                      "textContent": "",
                                                      "id": 989
                                                    },
                                                    {
                                                      "type": 5,
                                                      "textContent": "",
                                                      "id": 990
                                                    },
                                                    {
                                                      "type": 2,
                                                      "tagName": "taro-view-core",
                                                      "attributes": {
                                                        "class": "im-chat-empty end",
                                                        "id": "end"
                                                      },
                                                      "childNodes": [
                                                        {
                                                          "type": 5,
                                                          "textContent": "",
                                                          "id": 992
                                                        },
                                                        {
                                                          "type": 3,
                                                          "textContent": "",
                                                          "id": 993
                                                        },
                                                        {
                                                          "type": 3,
                                                          "textContent": "",
                                                          "id": 994
                                                        },
                                                        {
                                                          "type": 2,
                                                          "tagName": "taro-text-core",
                                                          "attributes": {
                                                            "class": ""
                                                          },
                                                          "childNodes": [
                                                            {
                                                              "type": 5,
                                                              "textContent": "",
                                                              "id": 996
                                                            },
                                                            {
                                                              "type": 3,
                                                              "textContent": "",
                                                              "id": 997
                                                            },
                                                            {
                                                              "type": 3,
                                                              "textContent": "",
                                                              "id": 998
                                                            },
                                                            {
                                                              "type": 3,
                                                              "textContent": "本次会话已结束！",
                                                              "id": 999
                                                            }
                                                          ],
                                                          "id": 995
                                                        }
                                                      ],
                                                      "id": 991
                                                    }
                                                  ],
                                                  "id": 236
                                                },
                                                {
                                                  "type": 2,
                                                  "tagName": "taro-view-core",
                                                  "attributes": {
                                                    "class": "im-chat-lastmsg",
                                                    "id": "scroll-to-bottom-node"
                                                  },
                                                  "childNodes": [
                                                    {
                                                      "type": 5,
                                                      "textContent": "",
                                                      "id": 1001
                                                    },
                                                    {
                                                      "type": 3,
                                                      "textContent": "",
                                                      "id": 1002
                                                    }
                                                  ],
                                                  "id": 1000
                                                }
                                              ],
                                              "id": 231
                                            },
                                            {
                                              "type": 5,
                                              "textContent": "",
                                              "id": 1003
                                            },
                                            {
                                              "type": 2,
                                              "tagName": "taro-view-core",
                                              "attributes": {
                                                "class": "im-new-message-indicator"
                                              },
                                              "childNodes": [
                                                {
                                                  "type": 5,
                                                  "textContent": "",
                                                  "id": 1005
                                                },
                                                {
                                                  "type": 3,
                                                  "textContent": "",
                                                  "id": 1006
                                                },
                                                {
                                                  "type": 3,
                                                  "textContent": "",
                                                  "id": 1007
                                                },
                                                {
                                                  "type": 3,
                                                  "textContent": "",
                                                  "id": 1008
                                                },
                                                {
                                                  "type": 2,
                                                  "tagName": "taro-image-core",
                                                  "attributes": {
                                                    "class": "im-new-message-icon"
                                                  },
                                                  "childNodes": [
                                                    {
                                                      "type": 2,
                                                      "tagName": "img",
                                                      "attributes": {
                                                        "class": "taro-img__mode-scaletofill",
                                                        "src": "https://coss-platform.fenqile.com/platformresource200/M00/ex/20260105154307-0a0e6cab-9516-4af8-b48a-abebd39fb01f.png"
                                                      },
                                                      "childNodes": [],
                                                      "id": 1010
                                                    }
                                                  ],
                                                  "id": 1009
                                                },
                                                {
                                                  "type": 2,
                                                  "tagName": "taro-text-core",
                                                  "attributes": {
                                                    "class": "im-new-message-tips"
                                                  },
                                                  "childNodes": [
                                                    {
                                                      "type": 5,
                                                      "textContent": "",
                                                      "id": 1012
                                                    },
                                                    {
                                                      "type": 3,
                                                      "textContent": "",
                                                      "id": 1013
                                                    },
                                                    {
                                                      "type": 3,
                                                      "textContent": "",
                                                      "id": 1014
                                                    },
                                                    {
                                                      "type": 3,
                                                      "textContent": "有新消息",
                                                      "id": 1015
                                                    }
                                                  ],
                                                  "id": 1011
                                                }
                                              ],
                                              "id": 1004
                                            }
                                          ],
                                          "id": 225
                                        },
                                        {
                                          "type": 3,
                                          "textContent": "",
                                          "id": 1016
                                        },
                                        {
                                          "type": 5,
                                          "textContent": "",
                                          "id": 1017
                                        },
                                        {
                                          "type": 3,
                                          "textContent": "",
                                          "id": 1018
                                        },
                                        {
                                          "type": 5,
                                          "textContent": "",
                                          "id": 1019
                                        },
                                        {
                                          "type": 5,
                                          "textContent": "",
                                          "id": 1020
                                        },
                                        {
                                          "type": 3,
                                          "textContent": "",
                                          "id": 1021
                                        },
                                        {
                                          "type": 2,
                                          "tagName": "taro-view-core",
                                          "attributes": {
                                            "class": "im-input-tips"
                                          },
                                          "childNodes": [
                                            {
                                              "type": 5,
                                              "textContent": "",
                                              "id": 1023
                                            },
                                            {
                                              "type": 3,
                                              "textContent": "",
                                              "id": 1024
                                            },
                                            {
                                              "type": 3,
                                              "textContent": "",
                                              "id": 1025
                                            },
                                            {
                                              "type": 3,
                                              "textContent": "",
                                              "id": 1026
                                            },
                                            {
                                              "type": 3,
                                              "textContent": "",
                                              "id": 1027
                                            },
                                            {
                                              "type": 3,
                                              "textContent": "",
                                              "id": 1028
                                            },
                                            {
                                              "type": 5,
                                              "textContent": "",
                                              "id": 1029
                                            },
                                            {
                                              "type": 5,
                                              "textContent": "",
                                              "id": 1030
                                            },
                                            {
                                              "type": 3,
                                              "textContent": "",
                                              "id": 1031
                                            },
                                            {
                                              "type": 3,
                                              "textContent": "",
                                              "id": 1032
                                            }
                                          ],
                                          "id": 1022
                                        },
                                        {
                                          "type": 2,
                                          "tagName": "taro-view-core",
                                          "attributes": {
                                            "class": "im-input-container bottom-safe-gap"
                                          },
                                          "childNodes": [
                                            {
                                              "type": 5,
                                              "textContent": "",
                                              "id": 1034
                                            },
                                            {
                                              "type": 3,
                                              "textContent": "",
                                              "id": 1035
                                            },
                                            {
                                              "type": 3,
                                              "textContent": "",
                                              "id": 1036
                                            },
                                            {
                                              "type": 3,
                                              "textContent": "",
                                              "id": 1037
                                            },
                                            {
                                              "type": 3,
                                              "textContent": "",
                                              "id": 1038
                                            },
                                            {
                                              "type": 3,
                                              "textContent": "",
                                              "id": 1039
                                            },
                                            {
                                              "type": 3,
                                              "textContent": "",
                                              "id": 1040
                                            },
                                            {
                                              "type": 3,
                                              "textContent": "",
                                              "id": 1041
                                            },
                                            {
                                              "type": 3,
                                              "textContent": "",
                                              "id": 1042
                                            },
                                            {
                                              "type": 3,
                                              "textContent": "",
                                              "id": 1043
                                            },
                                            {
                                              "type": 2,
                                              "tagName": "taro-textarea-core",
                                              "attributes": {
                                                "class": "im-input",
                                                "id": "imTextarea",
                                                "type": "text",
                                                "placeholderclass": "im-input-placeholder",
                                                "confirmtype": "send",
                                                "enterkeyhint": "send",
                                                "keyboard": "true",
                                                "defaultvalue": "",
                                                "confirmhold": "true",
                                                "controlled": "true",
                                                "disabledefaultpadding": "true",
                                                "show-confirm-bar": "false",
                                                "holdkeyboard": "true",
                                                "adjustposition": "false"
                                              },
                                              "childNodes": [
                                                {
                                                  "type": 2,
                                                  "tagName": "textarea",
                                                  "attributes": {
                                                    "class": "taro-textarea auto-height",
                                                    "placeholder": "请输入您想咨询的问题...",
                                                    "maxlength": "2000",
                                                    "enterkeyhint": "send",
                                                    "rows": "1"
                                                  },
                                                  "childNodes": [],
                                                  "id": 1045
                                                }
                                              ],
                                              "id": 1044
                                            },
                                            {
                                              "type": 3,
                                              "textContent": "",
                                              "id": 1046
                                            },
                                            {
                                              "type": 5,
                                              "textContent": "",
                                              "id": 1047
                                            },
                                            {
                                              "type": 2,
                                              "tagName": "taro-image-core",
                                              "attributes": {
                                                "class": "im-send-button right-button"
                                              },
                                              "childNodes": [
                                                {
                                                  "type": 2,
                                                  "tagName": "img",
                                                  "attributes": {
                                                    "class": "taro-img__mode-scaletofill",
                                                    "src": "https://coss-platform.fenqile.com/platformresource200/M00/ex/20251231184248-421f7300-9412-4119-bd98-de5a6010c926.png"
                                                  },
                                                  "childNodes": [],
                                                  "id": 1049
                                                }
                                              ],
                                              "id": 1048
                                            },
                                            {
                                              "type": 2,
                                              "tagName": "taro-image-core",
                                              "attributes": {
                                                "class": "im-send-button"
                                              },
                                              "childNodes": [
                                                {
                                                  "type": 2,
                                                  "tagName": "img",
                                                  "attributes": {
                                                    "class": "taro-img__mode-scaletofill",
                                                    "src": "https://coss-platform.fenqile.com/platformresource200/M00/ex/20251231184248-788b6f90-92b3-487d-8875-86d0522c1745.png"
                                                  },
                                                  "childNodes": [],
                                                  "id": 1051
                                                }
                                              ],
                                              "id": 1050
                                            },
                                            {
                                              "type": 5,
                                              "textContent": "",
                                              "id": 1052
                                            }
                                          ],
                                          "id": 1033
                                        },
                                        {
                                          "type": 5,
                                          "textContent": "",
                                          "id": 1053
                                        },
                                        {
                                          "type": 5,
                                          "textContent": "",
                                          "id": 1054
                                        },
                                        {
                                          "type": 3,
                                          "textContent": "",
                                          "id": 1055
                                        }
                                      ],
                                      "id": 112
                                    },
                                    {
                                      "type": 5,
                                      "textContent": "",
                                      "id": 1056
                                    },
                                    {
                                      "type": 5,
                                      "textContent": "",
                                      "id": 1057
                                    },
                                    {
                                      "type": 5,
                                      "textContent": "",
                                      "id": 1058
                                    },
                                    {
                                      "type": 3,
                                      "textContent": "",
                                      "id": 1059
                                    },
                                    {
                                      "type": 5,
                                      "textContent": "",
                                      "id": 1060
                                    },
                                    {
                                      "type": 5,
                                      "textContent": "",
                                      "id": 1061
                                    },
                                    {
                                      "type": 3,
                                      "textContent": "",
                                      "id": 1062
                                    },
                                    {
                                      "type": 5,
                                      "textContent": "",
                                      "id": 1063
                                    }
                                  ],
                                  "id": 96
                                }
                              ],
                              "id": 92
                            }
                          ],
                          "id": 91
                        },
                        {
                          "type": 3,
                          "textContent": "",
                          "id": 1064
                        },
                        {
                          "type": 3,
                          "textContent": "",
                          "id": 1065
                        }
                      ],
                      "id": 88
                    }
                  ],
                  "id": 42
                }
              ],
              "id": 3
            }
          ],
          "id": 1
        },
        "initialOffset": {
          "left": 0,
          "top": 0
        }
      },
      "timestamp": 1781071752109
    },
    {
      "type": 3,
      "data": {
        "source": 0,
        "texts": [],
        "attributes": [],
        "removes": [
          {
            "parentId": 236,
            "id": 991
          }
        ],
        "adds": [
          {
            "parentId": 236,
            "nextId": 989,
            "node": {
              "type": 2,
              "tagName": "taro-view-core",
              "attributes": {
                "class": "message-category-container",
                "id": "mk_260610140911001"
              },
              "childNodes": [],
              "id": 1066
            }
          },
          {
            "parentId": 1066,
            "nextId": null,
            "node": {
              "type": 2,
              "tagName": "taro-view-core",
              "attributes": {
                "class": "imclient-message-wrap"
              },
              "childNodes": [],
              "id": 1067
            }
          },
          {
            "parentId": 1067,
            "nextId": null,
            "node": {
              "type": 2,
              "tagName": "taro-view-core",
              "attributes": {
                "class": "message-content"
              },
              "childNodes": [],
              "id": 1068
            }
          },
          {
            "parentId": 1068,
            "nextId": null,
            "node": {
              "type": 5,
              "textContent": "",
              "id": 1069
            }
          },
          {
            "parentId": 236,
            "nextId": null,
            "node": {
              "type": 5,
              "textContent": "",
              "id": 1070
            }
          },
          {
            "parentId": 1066,
            "nextId": 1067,
            "node": {
              "type": 2,
              "tagName": "taro-view-core",
              "attributes": {
                "class": "imclient-time-display"
              },
              "childNodes": [],
              "id": 1071
            }
          },
          {
            "parentId": 1066,
            "nextId": 1071,
            "node": {
              "type": 5,
              "textContent": "",
              "id": 1072
            }
          },
          {
            "parentId": 1071,
            "nextId": null,
            "node": {
              "type": 2,
              "tagName": "taro-text-core",
              "attributes": {
                "class": "plain-text"
              },
              "childNodes": [],
              "id": 1073
            }
          },
          {
            "parentId": 1071,
            "nextId": 1073,
            "node": {
              "type": 5,
              "textContent": "",
              "id": 1074
            }
          },
          {
            "parentId": 1073,
            "nextId": null,
            "node": {
              "type": 3,
              "textContent": "14:09",
              "id": 1075
            }
          },
          {
            "parentId": 1073,
            "nextId": 1075,
            "node": {
              "type": 5,
              "textContent": "",
              "id": 1076
            }
          },
          {
            "parentId": 1067,
            "nextId": 1068,
            "node": {
              "type": 2,
              "tagName": "taro-image-core",
              "attributes": {
                "class": "message-avatar"
              },
              "childNodes": [],
              "id": 1077
            }
          },
          {
            "parentId": 1067,
            "nextId": 1077,
            "node": {
              "type": 5,
              "textContent": "",
              "id": 1078
            }
          },
          {
            "parentId": 1068,
            "nextId": 1069,
            "node": {
              "type": 5,
              "textContent": "",
              "id": 1079
            }
          },
          {
            "parentId": 1068,
            "nextId": 1079,
            "node": {
              "type": 5,
              "textContent": "",
              "id": 1080
            }
          },
          {
            "parentId": 1068,
            "nextId": 1080,
            "node": {
              "type": 5,
              "textContent": "",
              "id": 1081
            }
          },
          {
            "parentId": 1068,
            "nextId": 1081,
            "node": {
              "type": 5,
              "textContent": "",
              "id": 1082
            }
          },
          {
            "parentId": 1068,
            "nextId": 1082,
            "node": {
              "type": 5,
              "textContent": "",
              "id": 1083
            }
          },
          {
            "parentId": 1068,
            "nextId": 1083,
            "node": {
              "type": 5,
              "textContent": "",
              "id": 1084
            }
          },
          {
            "parentId": 1068,
            "nextId": 1084,
            "node": {
              "type": 5,
              "textContent": "",
              "id": 1085
            }
          },
          {
            "parentId": 1068,
            "nextId": 1085,
            "node": {
              "type": 2,
              "tagName": "taro-view-core",
              "attributes": {
                "class": "im-message-text"
              },
              "childNodes": [],
              "id": 1086
            }
          },
          {
            "parentId": 1068,
            "nextId": 1086,
            "node": {
              "type": 5,
              "textContent": "",
              "id": 1087
            }
          },
          {
            "parentId": 1068,
            "nextId": 1087,
            "node": {
              "type": 5,
              "textContent": "",
              "id": 1088
            }
          },
          {
            "parentId": 1086,
            "nextId": null,
            "node": {
              "type": 3,
              "textContent": "",
              "id": 1089
            }
          },
          {
            "parentId": 1086,
            "nextId": 1089,
            "node": {
              "type": 3,
              "textContent": "",
              "id": 1090
            }
          },
          {
            "parentId": 1086,
            "nextId": 1090,
            "node": {
              "type": 5,
              "textContent": "",
              "id": 1091
            }
          }
        ]
      },
      "timestamp": 1781071752964
    },
    {
      "type": 3,
      "data": {
        "source": 0,
        "texts": [],
        "attributes": [],
        "removes": [],
        "adds": [
          {
            "parentId": 1086,
            "nextId": 1089,
            "node": {
              "type": 2,
              "tagName": "taro-text-core",
              "attributes": {
                "class": "message-text-txt"
              },
              "childNodes": [],
              "id": 1092
            }
          },
          {
            "parentId": 1092,
            "nextId": null,
            "node": {
              "type": 3,
              "textContent": "测试欢迎语AI",
              "id": 1093
            }
          },
          {
            "parentId": 1092,
            "nextId": 1093,
            "node": {
              "type": 5,
              "textContent": "",
              "id": 1094
            }
          }
        ]
      },
      "timestamp": 1781071752966
    },
    {
      "type": 3,
      "data": {
        "source": 0,
        "texts": [],
        "attributes": [
          {
            "id": 1077,
            "attributes": {
              "class": "message-avatar taro-img__widthfix"
            }
          },
          {
            "id": 1092,
            "attributes": {
              "style": {
                "--line-clamp": "11"
              }
            }
          }
        ],
        "removes": [
          {
            "parentId": 1066,
            "id": 1067
          },
          {
            "parentId": 1066,
            "id": 1071
          },
          {
            "parentId": 1071,
            "id": 1073
          },
          {
            "parentId": 1073,
            "id": 1075
          },
          {
            "parentId": 1067,
            "id": 1068
          },
          {
            "parentId": 1067,
            "id": 1077
          },
          {
            "parentId": 1068,
            "id": 1069
          },
          {
            "parentId": 1068,
            "id": 1079
          },
          {
            "parentId": 1068,
            "id": 1080
          },
          {
            "parentId": 1068,
            "id": 1081
          },
          {
            "parentId": 1068,
            "id": 1082
          },
          {
            "parentId": 1068,
            "id": 1083
          },
          {
            "parentId": 1068,
            "id": 1084
          },
          {
            "parentId": 1068,
            "id": 1085
          },
          {
            "parentId": 1068,
            "id": 1086
          },
          {
            "parentId": 1068,
            "id": 1087
          },
          {
            "parentId": 1086,
            "id": 1089
          },
          {
            "parentId": 1086,
            "id": 1092
          },
          {
            "parentId": 1086,
            "id": 1090
          },
          {
            "parentId": 1092,
            "id": 1093
          }
        ],
        "adds": [
          {
            "parentId": 1066,
            "nextId": null,
            "node": {
              "type": 2,
              "tagName": "taro-view-core",
              "attributes": {
                "class": "imclient-message-wrap"
              },
              "childNodes": [],
              "id": 1067
            }
          },
          {
            "parentId": 1067,
            "nextId": 1068,
            "node": {
              "type": 2,
              "tagName": "taro-image-core",
              "attributes": {
                "class": "message-avatar taro-img__widthfix"
              },
              "childNodes": [],
              "id": 1077
            }
          },
          {
            "parentId": 1067,
            "nextId": null,
            "node": {
              "type": 2,
              "tagName": "taro-view-core",
              "attributes": {
                "class": "message-content"
              },
              "childNodes": [],
              "id": 1068
            }
          },
          {
            "parentId": 1068,
            "nextId": 1086,
            "node": {
              "type": 5,
              "textContent": "",
              "id": 1087
            }
          },
          {
            "parentId": 1068,
            "nextId": 1085,
            "node": {
              "type": 2,
              "tagName": "taro-view-core",
              "attributes": {
                "class": "im-message-text"
              },
              "childNodes": [],
              "id": 1086
            }
          },
          {
            "parentId": 1086,
            "nextId": 1092,
            "node": {
              "type": 3,
              "textContent": "",
              "id": 1090
            }
          },
          {
            "parentId": 1086,
            "nextId": 1089,
            "node": {
              "type": 2,
              "tagName": "taro-text-core",
              "attributes": {
                "class": "message-text-txt",
                "style": "--line-clamp: 11;"
              },
              "childNodes": [],
              "id": 1092
            }
          },
          {
            "parentId": 1092,
            "nextId": null,
            "node": {
              "type": 3,
              "textContent": "测试欢迎语AI",
              "id": 1093
            }
          },
          {
            "parentId": 1086,
            "nextId": null,
            "node": {
              "type": 3,
              "textContent": "",
              "id": 1089
            }
          },
          {
            "parentId": 1068,
            "nextId": 1084,
            "node": {
              "type": 5,
              "textContent": "",
              "id": 1085
            }
          },
          {
            "parentId": 1068,
            "nextId": 1083,
            "node": {
              "type": 5,
              "textContent": "",
              "id": 1084
            }
          },
          {
            "parentId": 1068,
            "nextId": 1082,
            "node": {
              "type": 5,
              "textContent": "",
              "id": 1083
            }
          },
          {
            "parentId": 1068,
            "nextId": 1081,
            "node": {
              "type": 5,
              "textContent": "",
              "id": 1082
            }
          },
          {
            "parentId": 1068,
            "nextId": 1080,
            "node": {
              "type": 5,
              "textContent": "",
              "id": 1081
            }
          },
          {
            "parentId": 1068,
            "nextId": 1079,
            "node": {
              "type": 5,
              "textContent": "",
              "id": 1080
            }
          },
          {
            "parentId": 1068,
            "nextId": 1069,
            "node": {
              "type": 5,
              "textContent": "",
              "id": 1079
            }
          },
          {
            "parentId": 1068,
            "nextId": null,
            "node": {
              "type": 5,
              "textContent": "",
              "id": 1069
            }
          },
          {
            "parentId": 1066,
            "nextId": 1067,
            "node": {
              "type": 2,
              "tagName": "taro-view-core",
              "attributes": {
                "class": "imclient-time-display"
              },
              "childNodes": [],
              "id": 1071
            }
          },
          {
            "parentId": 1071,
            "nextId": null,
            "node": {
              "type": 2,
              "tagName": "taro-text-core",
              "attributes": {
                "class": "plain-text"
              },
              "childNodes": [],
              "id": 1073
            }
          },
          {
            "parentId": 1073,
            "nextId": null,
            "node": {
              "type": 3,
              "textContent": "14:09",
              "id": 1075
            }
          },
          {
            "parentId": 1066,
            "nextId": 1071,
            "node": {
              "type": 3,
              "textContent": "",
              "id": 1095
            }
          },
          {
            "parentId": 1066,
            "nextId": 1095,
            "node": {
              "type": 3,
              "textContent": "",
              "id": 1096
            }
          },
          {
            "parentId": 1066,
            "nextId": 1096,
            "node": {
              "type": 3,
              "textContent": "",
              "id": 1097
            }
          },
          {
            "parentId": 1067,
            "nextId": 1077,
            "node": {
              "type": 3,
              "textContent": "",
              "id": 1098
            }
          },
          {
            "parentId": 1077,
            "nextId": null,
            "node": {
              "type": 2,
              "tagName": "img",
              "attributes": {
                "class": "taro-img__mode-widthfix",
                "src": "https://coss-platform.fenqile.com/platformresource200/M00/ex/20251211175539-42948ef7-ba0e-48b3-9193-6de8b94c7364.png"
              },
              "childNodes": [],
              "id": 1099
            }
          },
          {
            "parentId": 1068,
            "nextId": 1087,
            "node": {
              "type": 3,
              "textContent": "",
              "id": 1100
            }
          },
          {
            "parentId": 1086,
            "nextId": 1090,
            "node": {
              "type": 3,
              "textContent": "",
              "id": 1101
            }
          },
          {
            "parentId": 1092,
            "nextId": 1093,
            "node": {
              "type": 3,
              "textContent": "",
              "id": 1102
            }
          },
          {
            "parentId": 1071,
            "nextId": 1073,
            "node": {
              "type": 3,
              "textContent": "",
              "id": 1103
            }
          },
          {
            "parentId": 1073,
            "nextId": 1075,
            "node": {
              "type": 3,
              "textContent": "",
              "id": 1104
            }
          },
          {
            "parentId": 1067,
            "nextId": 1098,
            "node": {
              "type": 3,
              "textContent": "",
              "id": 1105
            }
          },
          {
            "parentId": 1067,
            "nextId": 1105,
            "node": {
              "type": 3,
              "textContent": "",
              "id": 1106
            }
          },
          {
            "parentId": 1067,
            "nextId": 1106,
            "node": {
              "type": 5,
              "textContent": "",
              "id": 1078
            }
          },
          {
            "parentId": 1068,
            "nextId": 1100,
            "node": {
              "type": 3,
              "textContent": "",
              "id": 1107
            }
          },
          {
            "parentId": 1068,
            "nextId": 1107,
            "node": {
              "type": 3,
              "textContent": "",
              "id": 1108
            }
          },
          {
            "parentId": 1068,
            "nextId": 1108,
            "node": {
              "type": 3,
              "textContent": "",
              "id": 1109
            }
          },
          {
            "parentId": 1068,
            "nextId": 1109,
            "node": {
              "type": 3,
              "textContent": "",
              "id": 1110
            }
          },
          {
            "parentId": 1068,
            "nextId": 1110,
            "node": {
              "type": 3,
              "textContent": "",
              "id": 1111
            }
          },
          {
            "parentId": 1068,
            "nextId": 1111,
            "node": {
              "type": 3,
              "textContent": "",
              "id": 1112
            }
          },
          {
            "parentId": 1068,
            "nextId": 1112,
            "node": {
              "type": 3,
              "textContent": "",
              "id": 1113
            }
          },
          {
            "parentId": 1068,
            "nextId": 1113,
            "node": {
              "type": 3,
              "textContent": "",
              "id": 1114
            }
          },
          {
            "parentId": 1068,
            "nextId": 1114,
            "node": {
              "type": 3,
              "textContent": "",
              "id": 1115
            }
          },
          {
            "parentId": 1068,
            "nextId": 1115,
            "node": {
              "type": 3,
              "textContent": "",
              "id": 1116
            }
          },
          {
            "parentId": 1068,
            "nextId": 1116,
            "node": {
              "type": 5,
              "textContent": "",
              "id": 1088
            }
          },
          {
            "parentId": 1086,
            "nextId": 1101,
            "node": {
              "type": 3,
              "textContent": "",
              "id": 1117
            }
          },
          {
            "parentId": 1086,
            "nextId": 1117,
            "node": {
              "type": 3,
              "textContent": "",
              "id": 1118
            }
          },
          {
            "parentId": 1086,
            "nextId": 1118,
            "node": {
              "type": 3,
              "textContent": "",
              "id": 1119
            }
          },
          {
            "parentId": 1086,
            "nextId": 1119,
            "node": {
              "type": 5,
              "textContent": "",
              "id": 1091
            }
          },
          {
            "parentId": 1092,
            "nextId": 1102,
            "node": {
              "type": 3,
              "textContent": "",
              "id": 1120
            }
          },
          {
            "parentId": 1092,
            "nextId": 1120,
            "node": {
              "type": 5,
              "textContent": "",
              "id": 1094
            }
          },
          {
            "parentId": 1071,
            "nextId": 1103,
            "node": {
              "type": 3,
              "textContent": "",
              "id": 1121
            }
          },
          {
            "parentId": 1071,
            "nextId": 1121,
            "node": {
              "type": 5,
              "textContent": "",
              "id": 1074
            }
          },
          {
            "parentId": 1073,
            "nextId": 1104,
            "node": {
              "type": 3,
              "textContent": "",
              "id": 1122
            }
          },
          {
            "parentId": 1073,
            "nextId": 1122,
            "node": {
              "type": 5,
              "textContent": "",
              "id": 1076
            }
          }
        ]
      },
      "timestamp": 1781071752973
    },
    {
      "type": 3,
      "data": {
        "source": 3,
        "id": 231,
        "x": 0,
        "y": 382
      },
      "timestamp": 1781071752987
    },
    {
      "type": 3,
      "data": {
        "source": 0,
        "texts": [],
        "attributes": [
          {
            "id": 231,
            "attributes": {
              "scroll-top": "382"
            }
          }
        ],
        "removes": [],
        "adds": []
      },
      "timestamp": 1781071752989
    },
    {
      "type": 3,
      "data": {
        "source": 3,
        "id": 231,
        "x": 0,
        "y": 382
      },
      "timestamp": 1781071753088
    },
    {
      "type": 3,
      "data": {
        "source": 2,
        "type": 7,
        "id": 1045,
        "x": 96.66666666666666,
        "y": 715.3333333333333
      },
      "timestamp": 1781071755665
    },
    {
      "type": 3,
      "data": {
        "source": 2,
        "type": 9,
        "id": 1045,
        "x": 96.66666666666666,
        "y": 715.3333333333333
      },
      "timestamp": 1781071755760
    },
    {
      "type": 3,
      "data": {
        "source": 1,
        "positions": [
          {
            "x": 97,
            "y": 715,
            "id": 1045,
            "timeOffset": 0
          }
        ]
      },
      "timestamp": 1781071755768
    },
    {
      "type": 3,
      "data": {
        "source": 2,
        "type": 1,
        "id": 1045,
        "x": 97,
        "y": 715
      },
      "timestamp": 1781071755768
    },
    {
      "type": 3,
      "data": {
        "source": 2,
        "type": 5,
        "id": 1045
      },
      "timestamp": 1781071755769
    },
    {
      "type": 3,
      "data": {
        "source": 2,
        "type": 5,
        "id": 1044
      },
      "timestamp": 1781071755769
    },
    {
      "type": 3,
      "data": {
        "source": 0,
        "texts": [],
        "attributes": [
          {
            "id": 1033,
            "attributes": {
              "class": "im-input-container"
            }
          },
          {
            "id": 112,
            "attributes": {
              "style": {
                "max-height": "37vh",
                "transition-duration": "0ms"
              }
            }
          }
        ],
        "removes": [
          {
            "parentId": 112,
            "id": 136
          },
          {
            "parentId": 225,
            "id": 1003
          }
        ],
        "adds": [
          {
            "parentId": 112,
            "nextId": 225,
            "node": {
              "type": 5,
              "textContent": "",
              "id": 1123
            }
          },
          {
            "parentId": 225,
            "nextId": 1004,
            "node": {
              "type": 2,
              "tagName": "taro-view-core",
              "attributes": {
                "class": "im-chat-body-mask"
              },
              "childNodes": [],
              "id": 1124
            }
          },
          {
            "parentId": 1124,
            "nextId": null,
            "node": {
              "type": 5,
              "textContent": "",
              "id": 1125
            }
          }
        ]
      },
      "timestamp": 1781071755781
    },
    {
      "type": 3,
      "data": {
        "source": 2,
        "type": 0,
        "id": 1033,
        "x": 97,
        "y": 715
      },
      "timestamp": 1781071755782
    },
    {
      "type": 3,
      "data": {
        "source": 2,
        "type": 2,
        "id": 1033,
        "x": 97,
        "y": 715
      },
      "timestamp": 1781071755782
    },
    {
      "type": 3,
      "data": {
        "source": 3,
        "id": 231,
        "x": 0,
        "y": 281
      },
      "timestamp": 1781071755783
    },
    {
      "type": 3,
      "data": {
        "source": 0,
        "texts": [],
        "attributes": [
          {
            "id": 231,
            "attributes": {
              "scroll-top": "281"
            }
          }
        ],
        "removes": [],
        "adds": []
      },
      "timestamp": 1781071755784
    },
    {
      "type": 3,
      "data": {
        "source": 0,
        "texts": [],
        "attributes": [
          {
            "id": 1045,
            "attributes": {
              "autofocus": ""
            }
          }
        ],
        "removes": [],
        "adds": [
          {
            "parentId": 1124,
            "nextId": null,
            "node": {
              "type": 3,
              "textContent": "",
              "id": 1126
            }
          }
        ]
      },
      "timestamp": 1781071755785
    },
    {
      "type": 3,
      "data": {
        "source": 5,
        "text": " ",
        "isChecked": false,
        "id": 1045
      },
      "timestamp": 1781071755787
    },
    {
      "type": 3,
      "data": {
        "source": 5,
        "text": "",
        "isChecked": false,
        "id": 1045
      },
      "timestamp": 1781071755871
    },
    {
      "type": 3,
      "data": {
        "source": 3,
        "id": 231,
        "x": 0,
        "y": 281
      },
      "timestamp": 1781071755883
    },
    {
      "type": 3,
      "data": {
        "source": 3,
        "id": 1,
        "x": 0,
        "y": 336
      },
      "timestamp": 1781071755984
    },
    {
      "type": 3,
      "data": {
        "source": 5,
        "text": "f",
        "isChecked": false,
        "id": 1045
      },
      "timestamp": 1781071756710
    },
    {
      "type": 3,
      "data": {
        "source": 0,
        "texts": [],
        "attributes": [
          {
            "id": 1045,
            "attributes": {
              "style": {
                "min-height": false,
                "height": false,
                "overflow-x": false,
                "overflow-y": false
              }
            }
          }
        ],
        "removes": [],
        "adds": []
      },
      "timestamp": 1781071756716
    },
    {
      "type": 3,
      "data": {
        "source": 0,
        "texts": [],
        "attributes": [],
        "removes": [
          {
            "parentId": 1022,
            "id": 1029
          }
        ],
        "adds": [
          {
            "parentId": 1022,
            "nextId": 1030,
            "node": {
              "type": 2,
              "tagName": "taro-view-core",
              "attributes": {
                "class": "component-relative-input"
              },
              "childNodes": [],
              "id": 1127
            }
          },
          {
            "parentId": 1127,
            "nextId": null,
            "node": {
              "type": 3,
              "textContent": "",
              "id": 1128
            }
          },
          {
            "parentId": 1127,
            "nextId": 1128,
            "node": {
              "type": 3,
              "textContent": "",
              "id": 1129
            }
          },
          {
            "parentId": 1127,
            "nextId": 1129,
            "node": {
              "type": 5,
              "textContent": "",
              "id": 1130
            }
          }
        ]
      },
      "timestamp": 1781071756721
    },
    {
      "type": 3,
      "data": {
        "source": 3,
        "id": 231,
        "x": 0,
        "y": 279
      },
      "timestamp": 1781071756725
    },
    {
      "type": 3,
      "data": {
        "source": 0,
        "texts": [],
        "attributes": [
          {
            "id": 231,
            "attributes": {
              "scroll-top": "279"
            }
          }
        ],
        "removes": [],
        "adds": []
      },
      "timestamp": 1781071756726
    },
    {
      "type": 3,
      "data": {
        "source": 0,
        "texts": [],
        "attributes": [],
        "removes": [
          {
            "parentId": 1127,
            "id": 1128
          },
          {
            "parentId": 1127,
            "id": 1129
          }
        ],
        "adds": [
          {
            "parentId": 1127,
            "nextId": null,
            "node": {
              "type": 3,
              "textContent": "",
              "id": 1128
            }
          },
          {
            "parentId": 1127,
            "nextId": 1128,
            "node": {
              "type": 3,
              "textContent": "",
              "id": 1129
            }
          },
          {
            "parentId": 1127,
            "nextId": 1129,
            "node": {
              "type": 3,
              "textContent": "",
              "id": 1131
            }
          },
          {
            "parentId": 1127,
            "nextId": 1131,
            "node": {
              "type": 3,
              "textContent": "",
              "id": 1132
            }
          },
          {
            "parentId": 1127,
            "nextId": 1132,
            "node": {
              "type": 3,
              "textContent": "",
              "id": 1133
            }
          }
        ]
      },
      "timestamp": 1781071756726
    },
    {
      "type": 3,
      "data": {
        "source": 3,
        "id": 231,
        "x": 0,
        "y": 279
      },
      "timestamp": 1781071756826
    },
    {
      "type": 3,
      "data": {
        "source": 5,
        "text": "f f",
        "isChecked": false,
        "id": 1045
      },
      "timestamp": 1781071756893
    },
    {
      "type": 3,
      "data": {
        "source": 0,
        "texts": [],
        "attributes": [
          {
            "id": 1045,
            "attributes": {
              "style": {
                "min-height": false,
                "height": false,
                "overflow-x": false,
                "overflow-y": false
              }
            }
          }
        ],
        "removes": [],
        "adds": []
      },
      "timestamp": 1781071756898
    },
    {
      "type": 3,
      "data": {
        "source": 5,
        "text": "f f f",
        "isChecked": false,
        "id": 1045
      },
      "timestamp": 1781071757032
    },
    {
      "type": 3,
      "data": {
        "source": 0,
        "texts": [],
        "attributes": [
          {
            "id": 1045,
            "attributes": {
              "style": {
                "min-height": false,
                "height": false,
                "overflow-x": false,
                "overflow-y": false
              }
            }
          }
        ],
        "removes": [],
        "adds": []
      },
      "timestamp": 1781071757037
    }
  ];

  return JSON.stringify(events);
}

/** LZ-String URI-safe compressed demo data (most common format for URL embedding) */
export const DEMO_DATA_URI = LZString.compressToEncodedURIComponent(createDemoSession());

/** LZ-String UTF-16 compressed demo data (common for localStorage) */
export const DEMO_DATA_UTF16 = LZString.compressToUTF16(createDemoSession());

/** Raw JSON (uncompressed — tests the Raw format detection path) */
export const DEMO_DATA_RAW = createDemoSession();
