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
                    <h1 tw="text-7xl text-white" style={{ fontFamily: "menlo" }}>Nadav Eliash</h1>
                    <h2 tw="text-4xl text-white" style={{ fontFamily: "menlo" }}>Frontend / Fullstack Developer </h2>
                    <div tw="relative flex items-center mt-10">
                        <div tw="w-28 h-28 border-2 border-white rounded-full"></div>
                        <div tw="w-28 h-28 border-2 border-white rounded-full ml-20"></div>
                        <div tw="w-28 h-28 border-2 border-white rounded-full ml-20"></div>

                        <div tw="absolute left-6 top-5 w-16 h-12 rounded-lg border-2 border-white text-white text-lg px-[12px] py-2">{'</>'}</div>
                        <div tw="absolute left-8 top-[70px] w-12 h-4 rounded-xl border-2 border-white"></div>
                        
                        <div tw="absolute left-[218px] top-[30px] w-16 h-12 rounded-md border-2 border-white"></div>
                        <div tw="absolute left-[230px] top-9 w-4 h-4 rounded-full border-2 border-white"></div>
                        <div tw="absolute left-[250px] top-[38px] w-4 h-1 rounded-md bg-white"></div>
                        <div tw="absolute left-[250px] top-[46px] w-4 h-1 rounded-md bg-white"></div>
                        <div tw="absolute left-[232px] top-[58px] w-9 h-3 border-2 border-white"></div>
                        
                        <div tw="absolute left-[408px] top-[40px] w-16 h-8 rounded-full bg-white/10"></div>
                        <div tw="absolute left-[400px] top-[36px] w-20 h-10 rounded-full bg-white/5"></div>
                        <div tw="absolute left-[416px] top-12 w-12 h-4 rounded-full bg-white/70 text-xs px-[5px]"> CLICK</div>
                        <div tw="absolute left-[420px] top-[20px] text-white text-sm h-[10px] overflow-hidden">\</div>
                        <div tw="absolute left-[440px] top-[20px] text-white text-sm h-[10px] overflow-hidden">|</div>
                        <div tw="absolute left-[460px] top-[20px] text-white text-sm h-[10px] overflow-hidden">/</div>
                        <div tw="absolute left-[460px] top-[84px] text-white text-sm h-[10px] overflow-hidden">\</div>
                        <div tw="absolute left-[440px] top-[84px] text-white text-sm h-[10px] overflow-hidden">|</div>
                        <div tw="absolute left-[420px] top-[84px] text-white text-sm h-[10px] overflow-hidden">/</div>
                        
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