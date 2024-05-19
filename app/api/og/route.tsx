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
                    <h2 tw="text-3xl text-white" style={{ fontFamily: "menlo" }}>Frontend / Fullstack developer | Designer | Animator</h2>
                    <div tw="relative flex items-center mt-10">
                        <div tw="w-28 h-28 border-2 border-white rounded-full"></div>
                        <div tw="w-28 h-28 border-2 border-white rounded-full ml-20"></div>
                        <div tw="w-28 h-28 border-2 border-white rounded-full ml-20"></div>

                        <div tw="absolute left-6 top-5 w-16 h-12 rounded-lg border-2 border-white text-white text-lg px-[12px] py-2">{'</>'}</div>
                        <div tw="absolute left-8 top-[70px] w-12 h-4 rounded-xl border-2 border-white"></div>
                        
                        <div tw="absolute left-[228px] top-[24px] w-10 h-3 rounded-sm border-2 border-white"></div>
                        <div tw="absolute left-[228px] top-[60px] w-10 h-6 rounded-lg border-2 border-white"></div>
                        <div tw="absolute left-[228px] top-10 w-4 h-4 rounded-sm border-2 border-white"></div>
                        <div tw="absolute left-[250px] top-[42px] w-4 h-1 rounded-md bg-white"></div>
                        <div tw="absolute left-[250px] top-[50px] w-4 h-1 rounded-md bg-white"></div>
                        <div tw="absolute left-[232px] top-[64px] w-3 h-3 rounded-xl border-2 border-white"></div>
                        
                        <div tw="absolute left-[410px] top-6 w-6 h-6 rounded-full bg-white/20"></div>
                        <div tw="absolute left-[420px] top-[30px] w-6 h-6 rounded-full bg-white/40"></div>
                        <div tw="absolute left-[430px] top-[40px] w-6 h-6 rounded-full bg-white/60"></div>
                        <div tw="absolute left-[438px] top-[52px] w-6 h-6 rounded-full bg-white"></div>
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