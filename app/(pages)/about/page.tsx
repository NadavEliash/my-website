'use client'

import Image from "next/image"
import profile from "../../assets/profile.png"
import Link from "next/link"

export default function About() {

    return (
        <>
            <div className="relative mt-20 w-[92vw] mx-auto bg-white/10 p-3 rounded-lg md:mt-24 md:w-[660px] md:p-6 md:rounded-3xl">
                <Image src={profile} alt="profile" width={100} height={100} className="rounded-full"></Image>
                <p className="text-justify text-lg md:text-2xl mt-2 font-light">
                    {`My name is Nadav Eliash.`}
                    <br />
                    <br />
                    {`I'm a Frontend Web Developer with deep knowledge in Backend. I have two years experience of building and creating end-to-end applications.`}
                    <br />
                    <br />
                    {`I Have passion for crafting engaging digital experiences. My strong background in design (Adobe, Figma) and animation ensures that every project I work on is visually stunning and user-friendly.`}
                    <br />
                    <br />
                    {`With experience of working with international companies like Mattel and Disney, as well as local organizations like Israel Hayom and TLV Municipality, I've had the opportunity to collaborate on a variety of projects and solve complex challenges.`}
                    <br />
                    <br />
                    {`I'm driven by a love of problem-solving and a constant desire to learn. Let's create something amazing together.`}
                </p>
            </div>
            <div className="absolute top-16 flex md:gap-8 flex-col-reverse items-center justify-center right-2 md:static md:flex-row md:mt-10">
                <Link href="https://www.linkedin.com/in/nadav-eliash/" className="w-12 md:w-20 md:h-20 rounded-full">
                    <Image src="https://www.svgrepo.com/show/452051/linkedin.svg" alt="linkedin" width={60} height={60} className="rounded-full w-full h-full"></Image>
                </Link>
                <Link href="https://github.com/NadavEliash" className="w-12 md:w-20 md:h-20 rounded-full p-1">
                    <Image src="https://www.svgrepo.com/show/450156/github.svg" alt="github" width={60} height={60} className="rounded-full w-full h-full"></Image>
                </Link>
                <Link href="https://drive.google.com/file/d/1ZaJTI-GByj5o4FIRtB2yXsgm92WZ_dIa/view?usp=sharing" className="w-10 h-10 md:w-[72px] md:h-[72px] flex flex-col items-center p-1 md:px-3 md:py-1 m-1 bg-white/20 rounded-full">
                    <Image src="https://www.svgrepo.com/show/384666/career-detail-document-file-info-job.svg" alt="CV" width={60} height={60} className="invert w-16 h-16">
                    </Image>
                    <h1 className="hidden md:block text-sm text-white">cv</h1>
                </Link>
            </div>
        </>
    )
}