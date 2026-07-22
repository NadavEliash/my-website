/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
// @ts-nocheck

import { ImageResponse } from "next/og"

export const runtime = "edge"

// fetch a Google font subset that covers exactly `text` — needed to render Hebrew
// glyphs in the generated image (the default Roboto card is Latin-only)
async function loadGoogleFont(family: string, text: string) {
    const url = `https://fonts.googleapis.com/css2?family=${family}&text=${encodeURIComponent(text)}`
    const css = await (await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } })).text()
    const src = css.match(/src: url\((.+?)\) format/)?.[1]
    if (!src) throw new Error(`failed to load font ${family}`)
    return fetch(src).then((res) => res.arrayBuffer())
}

// per-app share cards — shown when a food/bnb link is shared (WhatsApp, etc.)
const APPS: Record<string, { emoji: string; title: string; subtitle: string; bg: string }> = {
    food: {
        emoji: "🍕",
        title: "הזמנת אוכל אונליין",
        subtitle: "בוחרים מהתפריט, קובעים זמן איסוף ומשלמים — הכול מהנייד",
        bg: "linear-gradient(to top right, #431407, #b45309)",
    },
    bnb: {
        emoji: "🩴",
        title: "ים המלח · נכסים להשכרה",
        subtitle: "חופשה על חופי ים המלח — הנקודה הנמוכה ביותר בכדור הארץ",
        bg: "linear-gradient(to top right, #0c4a6e, #78350f)",
    },
}

export async function GET(req: Request) {
    try {
        const app = new URL(req.url).searchParams.get("app")
        const cfg = app ? APPS[app] : undefined

        // app-specific share card (Hebrew text + themed background)
        if (cfg) {
            const font = await loadGoogleFont("Heebo:wght@700", cfg.title + cfg.subtitle)
            return new ImageResponse(
                (
                    <div
                        tw="w-full h-full flex flex-col items-center justify-center text-center px-24"
                        style={{ backgroundImage: cfg.bg, fontFamily: "Heebo", direction: "rtl" }}
                    >
                        <div tw="text-[10rem]">{cfg.emoji}</div>
                        <div tw="text-8xl text-white mt-2" style={{ fontWeight: 700 }}>{cfg.title}</div>
                        <div tw="text-4xl text-white/80 mt-8 leading-relaxed">{cfg.subtitle}</div>
                    </div>
                ),
                {
                    width: 1200,
                    height: 630,
                    fonts: [{ data: font, name: "Heebo", weight: 700 }],
                }
            )
        }

        // default card — Nadav Eliash / developer portfolio
        const fontData = await fetch(
            'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff2'
        ).then((res) => res.arrayBuffer())

        return new ImageResponse(
            (
                <div tw="w-full h-full flex flex-col items-center justify-center p-10" style={{ backgroundImage: 'linear-gradient(to top right, #0b0f27, #03274a)' }}>
                    <h1 tw="text-[7rem] text-white" style={{ fontFamily: "Roboto" }}>Nadav Eliash</h1>
                    <h2 tw="text-5xl text-white" style={{ fontFamily: "Roboto" }}>Frontend / Fullstack Developer </h2>
                    <div tw="relative flex items-center mt-10">
                        <div tw="w-40 h-40 border-2 border-white rounded-full"></div>
                        <div tw="w-40 h-40 border-2 border-white rounded-full ml-24"></div>
                        <div tw="w-40 h-40 border-2 border-white rounded-full ml-24"></div>

                        <div tw="absolute left-10 top-8 w-20 h-16 rounded-lg border-2 border-white text-white text-3xl px-[10px] py-3">{'</>'}</div>
                        <div tw="absolute left-10 top-[100px] w-20 h-5 rounded-xl border-2 border-white"></div>

                        <div tw="absolute left-[298px] top-[40px] w-20 h-20 rounded-md border-2 border-white"></div>
                        <div tw="absolute left-[306px] top-12 w-6 h-6 rounded-full border-2 border-white"></div>
                        <div tw="absolute left-[338px] top-[50px] w-8 h-1 rounded-md bg-white"></div>
                        <div tw="absolute left-[338px] top-[58px] w-8 h-1 rounded-md bg-white"></div>
                        <div tw="absolute left-[338px] top-[66px] w-8 h-1 rounded-md bg-white"></div>
                        <div tw="absolute left-[310px] top-[82px] w-4 h-1 rounded-md bg-white/30"></div>
                        <div tw="absolute left-[310px] top-[100px] w-4 h-1 rounded-md bg-white/30"></div>
                        <div tw="absolute left-[338px] top-[78px] w-8 h-3 border-2 border-white rounded-full"></div>
                        <div tw="absolute left-[338px] top-[96px] w-8 h-3 border-2 border-white rounded-full"></div>

                        <div tw="absolute left-[536px] top-[50px] w-28 h-[60px] rounded-full bg-white/10"></div>
                        <div tw="absolute left-[544px] top-[56px] w-24 h-12 rounded-full bg-white/20"></div>
                        <div tw="absolute left-[552px] top-[64px] w-20 h-8 rounded-full bg-white/70 text-lg font-bold px-[12px] py-1"> CLICK</div>
                        <div tw="absolute left-[560px] top-[30px] text-white text-lg h-[16px] overflow-hidden">\</div>
                        <div tw="absolute left-[585px] top-[30px] text-white text-lg h-[16px] overflow-hidden">|</div>
                        <div tw="absolute left-[612px] top-[30px] text-white text-lg h-[16px] overflow-hidden">/</div>
                        <div tw="absolute left-[612px] top-[110px] text-white text-lg h-[16px] overflow-hidden">\</div>
                        <div tw="absolute left-[585px] top-[110px] text-white text-lg h-[16px] overflow-hidden">|</div>
                        <div tw="absolute left-[560px] top-[110px] text-white text-lg h-[16px] overflow-hidden">/</div>

                    </div>
                </div>
            ),
            {
                fonts: [{
                    data: fontData,
                    name: "Roboto"
                }]
            }
        )
    } catch (error) {
        return new Response('Failed to generate OG image', { status: 500 })
    }

}
