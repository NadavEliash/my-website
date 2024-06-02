/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
// @ts-nocheck

import { ImageResponse } from "next/og"

export const runtime = "edge"

export async function GET(req: Request) {
    try {

        const menlo = await fetch(new URL('../../../Menlo-Regular.ttf', import.meta.url)).then((res) => res.arrayBuffer())

        return new ImageResponse(
            (
                <div tw="w-full h-full flex flex-col items-center justify-center p-10" style={{ backgroundImage: 'linear-gradient(to top right, #0b0f27, #03274a)' }}>
                    <h1 tw="text-[7rem] text-white" style={{ fontFamily: "menlo" }}>Nadav Eliash</h1>
                    <h2 tw="text-5xl text-white" style={{ fontFamily: "menlo" }}>Frontend / Fullstack Developer </h2>
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
                    data: menlo,
                    name: "menlo"
                }]
            }
        )
    } catch (error) {
        return new Response('Failed to generate OG image', { status: 500 })
    }

}