if(!self.define){let e,a={};const i=(i,s)=>(i=new URL(i+".js",s).href,a[i]||new Promise((a=>{if("document"in self){const e=document.createElement("script");e.src=i,e.onload=a,document.head.appendChild(e)}else e=i,importScripts(i),a()})).then((()=>{let e=a[i];if(!e)throw new Error(`Module ${i} didn’t register its module`);return e})));self.define=(s,n)=>{const r=e||("document"in self?document.currentScript.src:"")||location.href;if(a[r])return;let o={};const c=e=>i(e,r),d={module:{uri:r},exports:o,require:c};a[r]=Promise.all(s.map((e=>d[e]||c(e)))).then((e=>(n(...e),o)))}}define(["./workbox-f1770938"],(function(e){"use strict";importScripts(),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/_next/static/chunks/119.a93bb904f94cb649.js",revision:"a93bb904f94cb649"},{url:"/_next/static/chunks/198-4dd6905b67849771.js",revision:"4dd6905b67849771"},{url:"/_next/static/chunks/268-f455bc59b8accf37.js",revision:"f455bc59b8accf37"},{url:"/_next/static/chunks/383-19527f33a9c4b451.js",revision:"19527f33a9c4b451"},{url:"/_next/static/chunks/525.3b05f6c86fe1e0d8.js",revision:"3b05f6c86fe1e0d8"},{url:"/_next/static/chunks/531-6dd657862a60b164.js",revision:"6dd657862a60b164"},{url:"/_next/static/chunks/557-c0e7eb0811d3d379.js",revision:"c0e7eb0811d3d379"},{url:"/_next/static/chunks/603-03afb06023eb853b.js",revision:"03afb06023eb853b"},{url:"/_next/static/chunks/660.61e9cb6e3aed391c.js",revision:"61e9cb6e3aed391c"},{url:"/_next/static/chunks/675-f6b4bb7aa5cb9513.js",revision:"f6b4bb7aa5cb9513"},{url:"/_next/static/chunks/7112840a-35f9e75fa9cc5e3c.js",revision:"35f9e75fa9cc5e3c"},{url:"/_next/static/chunks/884.4e83996eea394d5b.js",revision:"4e83996eea394d5b"},{url:"/_next/static/chunks/891-d4644ded0bb20153.js",revision:"d4644ded0bb20153"},{url:"/_next/static/chunks/968.69e3b7a4f859c614.js",revision:"69e3b7a4f859c614"},{url:"/_next/static/chunks/b699185c-7887acc46871194e.js",revision:"7887acc46871194e"},{url:"/_next/static/chunks/c16184b3-3340890091125936.js",revision:"3340890091125936"},{url:"/_next/static/chunks/ea88be26-0b8b202a1eea634a.js",revision:"0b8b202a1eea634a"},{url:"/_next/static/chunks/framework-ecc4130bc7a58a64.js",revision:"ecc4130bc7a58a64"},{url:"/_next/static/chunks/main-d70f20e5bc70463d.js",revision:"d70f20e5bc70463d"},{url:"/_next/static/chunks/pages/Home/page-79082ca875c4c197.js",revision:"79082ca875c4c197"},{url:"/_next/static/chunks/pages/Onboarding/Avatar/page-4230fabbd837c327.js",revision:"4230fabbd837c327"},{url:"/_next/static/chunks/pages/Onboarding/Letstest/page-c4d056ae605f6b1f.js",revision:"c4d056ae605f6b1f"},{url:"/_next/static/chunks/pages/Onboarding/page-6e68d055ecd30c7f.js",revision:"6e68d055ecd30c7f"},{url:"/_next/static/chunks/pages/StatsPage-bef377ea62b6f849.js",revision:"bef377ea62b6f849"},{url:"/_next/static/chunks/pages/_app-f61c5632a707afd5.js",revision:"f61c5632a707afd5"},{url:"/_next/static/chunks/pages/_error-77823ddac6993d35.js",revision:"77823ddac6993d35"},{url:"/_next/static/chunks/pages/index-e7c63a5c96b8ac86.js",revision:"e7c63a5c96b8ac86"},{url:"/_next/static/chunks/pages/layout-c98f7b285edee703.js",revision:"c98f7b285edee703"},{url:"/_next/static/chunks/pages/profile/%5BfriendId%5D-5a32670d3be63a57.js",revision:"5a32670d3be63a57"},{url:"/_next/static/chunks/polyfills-78c92fac7aa8fdd8.js",revision:"79330112775102f91e1010318bae2bd3"},{url:"/_next/static/chunks/webpack-70d49b669cccf376.js",revision:"70d49b669cccf376"},{url:"/_next/static/css/19f8d56e890a1ed8.css",revision:"19f8d56e890a1ed8"},{url:"/_next/static/css/628765f20b848f76.css",revision:"628765f20b848f76"},{url:"/_next/static/css/65aa3619a1925c9d.css",revision:"65aa3619a1925c9d"},{url:"/_next/static/dy6KKRmkLisGE8_FfihH7/_buildManifest.js",revision:"a972ad98c652470eb9d241c22f4a37ff"},{url:"/_next/static/dy6KKRmkLisGE8_FfihH7/_ssgManifest.js",revision:"b6652df95db52feb4daf4eca35380933"},{url:"/_next/static/media/26a46d62cd723877-s.woff2",revision:"befd9c0fdfa3d8a645d5f95717ed6420"},{url:"/_next/static/media/55c55f0601d81cf3-s.woff2",revision:"43828e14271c77b87e3ed582dbff9f74"},{url:"/_next/static/media/581909926a08bbc8-s.woff2",revision:"f0b86e7c24f455280b8df606b89af891"},{url:"/_next/static/media/6d93bde91c0c2823-s.woff2",revision:"621a07228c8ccbfd647918f1021b4868"},{url:"/_next/static/media/97e0cb1ae144a2a9-s.woff2",revision:"e360c61c5bd8d90639fd4503c829c2dc"},{url:"/_next/static/media/a34f9d1faa5f3315-s.p.woff2",revision:"d4fe31e6a2aebc06b8d6e558c9141119"},{url:"/_next/static/media/boy1.1e4d471b.png",revision:"0a2a8f2521acf42e7cc0f90f76170383"},{url:"/_next/static/media/df0a9ae256c0569c-s.woff2",revision:"d54db44de5ccb18886ece2fda72bdfe0"},{url:"/android/android-launchericon-144-144.png",revision:"ca2c73292dc0e4c9e25e5e192ee2cf51"},{url:"/android/android-launchericon-192-192.png",revision:"022f05b76d260b442547401175132636"},{url:"/android/android-launchericon-48-48.png",revision:"ad7850d50c9afe7a3f37fe467bca9866"},{url:"/android/android-launchericon-512-512.png",revision:"9a481ca951bdaa00ef68f3d89908e909"},{url:"/android/android-launchericon-72-72.png",revision:"9018d98bc69faaff5e6aabf53596e464"},{url:"/android/android-launchericon-96-96.png",revision:"b2027c01be8ef41acf4b7db183c90be3"},{url:"/favicon.ico",revision:"6ddfcfbe32288e67b21b18201f11b320"},{url:"/fonts/GajrajOne-Regular.ttf",revision:"c5dfea9bf142347091ef070ddde39733"},{url:"/fonts/OFL.txt",revision:"99dd66cabc0b8b6ba6cdc6ca5ac3164a"},{url:"/img/boy1.png",revision:"0a2a8f2521acf42e7cc0f90f76170383"},{url:"/img/figo.png",revision:"7ea1685347f46eb183f0c14631654ce4"},{url:"/img/newbie1.png",revision:"16b18e64f0b5210ab3adfb9c560d0edc"},{url:"/ios/100.png",revision:"c22e46908048707a31f57ab0081ddbdb"},{url:"/ios/1024.png",revision:"9f03d811e32b5ec6e6f9af7d25983246"},{url:"/ios/114.png",revision:"bebcc1b38de2d94644759ffda33eae39"},{url:"/ios/120.png",revision:"5cc87ede33471ec54492b1aaaa16a731"},{url:"/ios/128.png",revision:"120d5b9f72286d9521cbd0a9b4c4a669"},{url:"/ios/144.png",revision:"ca2c73292dc0e4c9e25e5e192ee2cf51"},{url:"/ios/152.png",revision:"80a16ac787ffb0367052a29825deaf85"},{url:"/ios/16.png",revision:"8ddc12ce3f006d7493040911572a2f3d"},{url:"/ios/167.png",revision:"36391e85a707532ac6e01c624df3ba2c"},{url:"/ios/180.png",revision:"e9a6cac1d9201715a886aa99488a139c"},{url:"/ios/192.png",revision:"022f05b76d260b442547401175132636"},{url:"/ios/20.png",revision:"2a543051777eae33e37f68e14eb06dcd"},{url:"/ios/256.png",revision:"b7500af89a81c9527a6358f50a6dc4f7"},{url:"/ios/29.png",revision:"938c054af883855fbbab0251f8d6dfb6"},{url:"/ios/32.png",revision:"2574709322cd6a99f0c04731d54be87b"},{url:"/ios/40.png",revision:"bd91d3765aa79eb7374affe225010fdd"},{url:"/ios/50.png",revision:"3e8311d50b04027b8806b70e6a92f403"},{url:"/ios/512.png",revision:"9a481ca951bdaa00ef68f3d89908e909"},{url:"/ios/57.png",revision:"7dfa7524daa3c68c1170cccfa9cb540f"},{url:"/ios/58.png",revision:"62f7e08af3a4bf653cd81cb6e604e6a4"},{url:"/ios/60.png",revision:"f55b867e4499388d5564174d5817436f"},{url:"/ios/64.png",revision:"bb07eec4dd70567a5f6d1a65c68d4e71"},{url:"/ios/72.png",revision:"9018d98bc69faaff5e6aabf53596e464"},{url:"/ios/76.png",revision:"7bbc50bd5f44786f4920dfb28cf30882"},{url:"/ios/80.png",revision:"9fa8c01721e359f4f1bda898d122365c"},{url:"/ios/87.png",revision:"2062759343c1856477c4b8c8b7ad729c"},{url:"/lottie/avatar1.json",revision:"65c1070b69fae755a8f8c4905a54ca09"},{url:"/lottie/avatar10.json",revision:"582d3a17016caa8c5382b5d79bc76682"},{url:"/lottie/avatar11.json",revision:"9af262d46334a53db2d9ddd3b70f5646"},{url:"/lottie/avatar12.json",revision:"17c876d5aaca281d7845690748acb83c"},{url:"/lottie/avatar13.json",revision:"cfb84f49973c03eddce5cf1bb598711a"},{url:"/lottie/avatar2.json",revision:"61be6f16697badd747e52b545e4b7627"},{url:"/lottie/avatar3.json",revision:"1254c14edc632c72fec17a4f7247aaff"},{url:"/lottie/avatar4.json",revision:"d13a68a770db73118acf5d296feb29e5"},{url:"/lottie/avatar5.json",revision:"1da5ac8881fd448c316ef92126fa03fa"},{url:"/lottie/avatar6.json",revision:"5447b0d7f2280dfb35bd6da7f047dbf8"},{url:"/lottie/avatar7.json",revision:"386ae4525774fd87c8423bde3e9a8d43"},{url:"/lottie/avatar8.json",revision:"c8dbfa69d7f84a57b92193e0dc914781"},{url:"/lottie/avatar9.json",revision:"1f89ee60bcb3685f8d00550a66da174c"},{url:"/lottie/isloading.json",revision:"ff9ba30b51e4c81ee7e8074e57c0e076"},{url:"/lottie/loader.json",revision:"c2415b4c82427f26f979103271d239e9"},{url:"/lottie/loaderblack.json",revision:"c2415b4c82427f26f979103271d239e9"},{url:"/lottie/manifest.json",revision:"3a25861fdd6cf41632f94015310811bd"},{url:"/lottie/typing.json",revision:"4d4ab40a9725d4605df9230d2185808f"},{url:"/lottie/welcome.json",revision:"9c54fbc99bc5ad2057fabfb230eafab2"},{url:"/manifest.json",revision:"25e6ceb8e3113a8ea48372877d7348bf"},{url:"/next.svg",revision:"8e061864f388b47f33a1c3780831193e"},{url:"/vercel.svg",revision:"61c6b19abff40ea7acd577be818f3976"},{url:"/windows11/LargeTile.scale-100.png",revision:"aa4d782e523cd9a06e3c5f028393704e"},{url:"/windows11/LargeTile.scale-125.png",revision:"79c62d193c495320ff94ca7a9bb0884e"},{url:"/windows11/LargeTile.scale-150.png",revision:"52fafc90baf3133558b2db83c3a44ed5"},{url:"/windows11/LargeTile.scale-200.png",revision:"d297122c23eae90cded33a08bc5b1a65"},{url:"/windows11/LargeTile.scale-400.png",revision:"2d5550a05e75527b2fed741ebd314e9d"},{url:"/windows11/SmallTile.scale-100.png",revision:"240713a34ff8557549d4d43985667cbd"},{url:"/windows11/SmallTile.scale-125.png",revision:"1f1bb55405e1733d559765fe1322ebab"},{url:"/windows11/SmallTile.scale-150.png",revision:"c95d0998c240f526ddb1657ead078768"},{url:"/windows11/SmallTile.scale-200.png",revision:"44710e584cd500370a2e1f01c2032269"},{url:"/windows11/SmallTile.scale-400.png",revision:"8988e22bfd428018892d2f89fd6ce7f3"},{url:"/windows11/SplashScreen.scale-100.png",revision:"2344742e5958e3f09e4e63f742ae9fb7"},{url:"/windows11/SplashScreen.scale-125.png",revision:"4223c186c87e429116b1adfdf0be7863"},{url:"/windows11/SplashScreen.scale-150.png",revision:"39bca1c13ea5b0823558619193055899"},{url:"/windows11/SplashScreen.scale-200.png",revision:"4d46ccee8ebfb212758a7056646afee9"},{url:"/windows11/SplashScreen.scale-400.png",revision:"2a9689c75f5e563b0091566fd9740e88"},{url:"/windows11/Square150x150Logo.scale-100.png",revision:"cf8540e603ba1d15ee9b0c08a843fc5c"},{url:"/windows11/Square150x150Logo.scale-125.png",revision:"34548e653901eba8397a72a5fe7169c7"},{url:"/windows11/Square150x150Logo.scale-150.png",revision:"4c99f5467f3b8f67840f52c54b02d800"},{url:"/windows11/Square150x150Logo.scale-200.png",revision:"7eb0f56f82b85cb5bd2088cdeeeeea0c"},{url:"/windows11/Square150x150Logo.scale-400.png",revision:"1e7ab84426f62dec3ad14fcadeb1cb40"},{url:"/windows11/Square44x44Logo.altform-lightunplated_targetsize-16.png",revision:"8ddc12ce3f006d7493040911572a2f3d"},{url:"/windows11/Square44x44Logo.altform-lightunplated_targetsize-20.png",revision:"2a543051777eae33e37f68e14eb06dcd"},{url:"/windows11/Square44x44Logo.altform-lightunplated_targetsize-24.png",revision:"e85e8db060fc55f0632bcdd9c942b63a"},{url:"/windows11/Square44x44Logo.altform-lightunplated_targetsize-256.png",revision:"b7500af89a81c9527a6358f50a6dc4f7"},{url:"/windows11/Square44x44Logo.altform-lightunplated_targetsize-30.png",revision:"0b6147720cca13a0ab902987890b8065"},{url:"/windows11/Square44x44Logo.altform-lightunplated_targetsize-32.png",revision:"2574709322cd6a99f0c04731d54be87b"},{url:"/windows11/Square44x44Logo.altform-lightunplated_targetsize-36.png",revision:"97e90d2f1dc05bb50209deb04b841544"},{url:"/windows11/Square44x44Logo.altform-lightunplated_targetsize-40.png",revision:"bd91d3765aa79eb7374affe225010fdd"},{url:"/windows11/Square44x44Logo.altform-lightunplated_targetsize-44.png",revision:"06d8251609a6ecfe238a46138815ccfc"},{url:"/windows11/Square44x44Logo.altform-lightunplated_targetsize-48.png",revision:"ad7850d50c9afe7a3f37fe467bca9866"},{url:"/windows11/Square44x44Logo.altform-lightunplated_targetsize-60.png",revision:"f55b867e4499388d5564174d5817436f"},{url:"/windows11/Square44x44Logo.altform-lightunplated_targetsize-64.png",revision:"bb07eec4dd70567a5f6d1a65c68d4e71"},{url:"/windows11/Square44x44Logo.altform-lightunplated_targetsize-72.png",revision:"9018d98bc69faaff5e6aabf53596e464"},{url:"/windows11/Square44x44Logo.altform-lightunplated_targetsize-80.png",revision:"9fa8c01721e359f4f1bda898d122365c"},{url:"/windows11/Square44x44Logo.altform-lightunplated_targetsize-96.png",revision:"b2027c01be8ef41acf4b7db183c90be3"},{url:"/windows11/Square44x44Logo.altform-unplated_targetsize-16.png",revision:"8ddc12ce3f006d7493040911572a2f3d"},{url:"/windows11/Square44x44Logo.altform-unplated_targetsize-20.png",revision:"2a543051777eae33e37f68e14eb06dcd"},{url:"/windows11/Square44x44Logo.altform-unplated_targetsize-24.png",revision:"e85e8db060fc55f0632bcdd9c942b63a"},{url:"/windows11/Square44x44Logo.altform-unplated_targetsize-256.png",revision:"b7500af89a81c9527a6358f50a6dc4f7"},{url:"/windows11/Square44x44Logo.altform-unplated_targetsize-30.png",revision:"0b6147720cca13a0ab902987890b8065"},{url:"/windows11/Square44x44Logo.altform-unplated_targetsize-32.png",revision:"2574709322cd6a99f0c04731d54be87b"},{url:"/windows11/Square44x44Logo.altform-unplated_targetsize-36.png",revision:"97e90d2f1dc05bb50209deb04b841544"},{url:"/windows11/Square44x44Logo.altform-unplated_targetsize-40.png",revision:"bd91d3765aa79eb7374affe225010fdd"},{url:"/windows11/Square44x44Logo.altform-unplated_targetsize-44.png",revision:"06d8251609a6ecfe238a46138815ccfc"},{url:"/windows11/Square44x44Logo.altform-unplated_targetsize-48.png",revision:"ad7850d50c9afe7a3f37fe467bca9866"},{url:"/windows11/Square44x44Logo.altform-unplated_targetsize-60.png",revision:"f55b867e4499388d5564174d5817436f"},{url:"/windows11/Square44x44Logo.altform-unplated_targetsize-64.png",revision:"bb07eec4dd70567a5f6d1a65c68d4e71"},{url:"/windows11/Square44x44Logo.altform-unplated_targetsize-72.png",revision:"9018d98bc69faaff5e6aabf53596e464"},{url:"/windows11/Square44x44Logo.altform-unplated_targetsize-80.png",revision:"9fa8c01721e359f4f1bda898d122365c"},{url:"/windows11/Square44x44Logo.altform-unplated_targetsize-96.png",revision:"b2027c01be8ef41acf4b7db183c90be3"},{url:"/windows11/Square44x44Logo.scale-100.png",revision:"06d8251609a6ecfe238a46138815ccfc"},{url:"/windows11/Square44x44Logo.scale-125.png",revision:"5bf0020c9dd10f88a59fc7a61dcc6645"},{url:"/windows11/Square44x44Logo.scale-150.png",revision:"f902f733ff02c7a60643aa7ef97990e5"},{url:"/windows11/Square44x44Logo.scale-200.png",revision:"87ecee0e5a746c3d5665c6595c11bc7e"},{url:"/windows11/Square44x44Logo.scale-400.png",revision:"f0734e868fd44a9a8d455dc4736cea47"},{url:"/windows11/Square44x44Logo.targetsize-16.png",revision:"8ddc12ce3f006d7493040911572a2f3d"},{url:"/windows11/Square44x44Logo.targetsize-20.png",revision:"2a543051777eae33e37f68e14eb06dcd"},{url:"/windows11/Square44x44Logo.targetsize-24.png",revision:"e85e8db060fc55f0632bcdd9c942b63a"},{url:"/windows11/Square44x44Logo.targetsize-256.png",revision:"b7500af89a81c9527a6358f50a6dc4f7"},{url:"/windows11/Square44x44Logo.targetsize-30.png",revision:"0b6147720cca13a0ab902987890b8065"},{url:"/windows11/Square44x44Logo.targetsize-32.png",revision:"2574709322cd6a99f0c04731d54be87b"},{url:"/windows11/Square44x44Logo.targetsize-36.png",revision:"97e90d2f1dc05bb50209deb04b841544"},{url:"/windows11/Square44x44Logo.targetsize-40.png",revision:"bd91d3765aa79eb7374affe225010fdd"},{url:"/windows11/Square44x44Logo.targetsize-44.png",revision:"06d8251609a6ecfe238a46138815ccfc"},{url:"/windows11/Square44x44Logo.targetsize-48.png",revision:"ad7850d50c9afe7a3f37fe467bca9866"},{url:"/windows11/Square44x44Logo.targetsize-60.png",revision:"f55b867e4499388d5564174d5817436f"},{url:"/windows11/Square44x44Logo.targetsize-64.png",revision:"bb07eec4dd70567a5f6d1a65c68d4e71"},{url:"/windows11/Square44x44Logo.targetsize-72.png",revision:"9018d98bc69faaff5e6aabf53596e464"},{url:"/windows11/Square44x44Logo.targetsize-80.png",revision:"9fa8c01721e359f4f1bda898d122365c"},{url:"/windows11/Square44x44Logo.targetsize-96.png",revision:"b2027c01be8ef41acf4b7db183c90be3"},{url:"/windows11/StoreLogo.scale-100.png",revision:"5730ec82991dd73b03a252c55b60b16c"},{url:"/windows11/StoreLogo.scale-125.png",revision:"e891a916e16b3ed47e8f7f65560d7d1b"},{url:"/windows11/StoreLogo.scale-150.png",revision:"6e67fd71e74284628133fff63c56feab"},{url:"/windows11/StoreLogo.scale-200.png",revision:"154e58a6d088c5c2dacbbd778863e2af"},{url:"/windows11/StoreLogo.scale-400.png",revision:"d8e869d6f517178206c5de0901b6f76b"},{url:"/windows11/Wide310x150Logo.scale-100.png",revision:"9c2f3125bf2aa49cd33a868e6b97dfc5"},{url:"/windows11/Wide310x150Logo.scale-125.png",revision:"4cefc93fa3f263faad3b8b28b8ddb617"},{url:"/windows11/Wide310x150Logo.scale-150.png",revision:"8ac46481bd973d6a235b0915a83907f7"},{url:"/windows11/Wide310x150Logo.scale-200.png",revision:"2344742e5958e3f09e4e63f742ae9fb7"},{url:"/windows11/Wide310x150Logo.scale-400.png",revision:"4d46ccee8ebfb212758a7056646afee9"}],{ignoreURLParametersMatching:[/^utm_/,/^fbclid$/]}),e.cleanupOutdatedCaches(),e.registerRoute("/",new e.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({response:e})=>e&&"opaqueredirect"===e.type?new Response(e.body,{status:200,statusText:"OK",headers:e.headers}):e}]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,new e.CacheFirst({cacheName:"google-fonts-webfonts",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:31536e3})]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,new e.StaleWhileRevalidate({cacheName:"google-fonts-stylesheets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,new e.StaleWhileRevalidate({cacheName:"static-font-assets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,new e.StaleWhileRevalidate({cacheName:"static-image-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:2592e3})]}),"GET"),e.registerRoute(/\/_next\/static.+\.js$/i,new e.CacheFirst({cacheName:"next-static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/image\?url=.+$/i,new e.StaleWhileRevalidate({cacheName:"next-image",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp3|wav|ogg)$/i,new e.CacheFirst({cacheName:"static-audio-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp4|webm)$/i,new e.CacheFirst({cacheName:"static-video-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:js)$/i,new e.StaleWhileRevalidate({cacheName:"static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:48,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:css|less)$/i,new e.StaleWhileRevalidate({cacheName:"static-style-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/data\/.+\/.+\.json$/i,new e.StaleWhileRevalidate({cacheName:"next-data",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:json|xml|csv)$/i,new e.NetworkFirst({cacheName:"static-data-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({sameOrigin:e,url:{pathname:a}})=>!(!e||a.startsWith("/api/auth/callback")||!a.startsWith("/api/"))),new e.NetworkFirst({cacheName:"apis",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:16,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({request:e,url:{pathname:a},sameOrigin:i})=>"1"===e.headers.get("RSC")&&"1"===e.headers.get("Next-Router-Prefetch")&&i&&!a.startsWith("/api/")),new e.NetworkFirst({cacheName:"pages-rsc-prefetch",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({request:e,url:{pathname:a},sameOrigin:i})=>"1"===e.headers.get("RSC")&&i&&!a.startsWith("/api/")),new e.NetworkFirst({cacheName:"pages-rsc",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:{pathname:e},sameOrigin:a})=>a&&!e.startsWith("/api/")),new e.NetworkFirst({cacheName:"pages",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({sameOrigin:e})=>!e),new e.NetworkFirst({cacheName:"cross-origin",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:3600})]}),"GET")}));
