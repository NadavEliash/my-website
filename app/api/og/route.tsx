/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
// @ts-nocheck

import { ImageResponse } from "next/og"


export const runtime = "edge"

export async function GET(req: Request) {
    try {

        const menlo = await fetch(new URL('../../../Menlo-Regular.ttf', import.meta.url)).then((res) => res.arrayBuffer())
        const imageSrc = await fetch(new URL('../../assets/about.png', import.meta.url)).then((res) => res.arrayBuffer()) 

        return new ImageResponse(
            (
                <div tw="w-full h-full flex flex-col items-center justify-center p-10" style={{backgroundImage: 'linear-gradient(to top right, #0b0f27, #03274a)'}}>
                    <img src={imageSrc} alt="ptofile" />
                    {/* <h1 tw="text-5xl text-white" style={{fontFamily: "menlo"}}>Nadav Eliash</h1> */}
                    {/* <a href="https://www.linkedin.com/in/nadav-eliash/" style={{background: "#111c57", width: "50px", height: "50px", borderRadius: "50%", border: "white"}}></a> */}
                </div>
            ),
            {
                fonts:[{
                    data: menlo,
                    name: "menlo"
                }]
            }
        )
    } catch (error) {
        return new Response('Failed to generate OG image', { status: 500 })
    }

}