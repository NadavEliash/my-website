'use client'

import Image from "next/image"
import profile from "../../assets/profile.png"
import Link from "next/link"

export default function About() {

    return (
        <>
            <div className="relative mt-20 w-[92vw] mx-auto bg-white/10 p-3 rounded-lg md:mt-24 md:w-[660px] md:p-6 md:rounded-3xl">
                <Image src={profile} alt="profile" width={100} height={100} className="rounded-full"></Image>
                <p className="text-justify text-lg md:text-2xl mt-8 font-light">
                    {`Hey there! My name is Nadav Eliash.`}
                    <br />
                    <br />
                    {`I'm a passionate Web Developer with 2 years of experience building end-to-end applications. My strong foundation in both frontend and backend development, combined with a keen eye for design, allows me to craft visually stunning and user-friendly digital experiences.`}
                    <br />
                    <br />
                    {`I've had the privilege of working with renowned brands like Mattel and Disney, as well as local organizations, where I've honed my skills in problem-solving, collaboration, and adaptability. My ability to seamlessly blend technical expertise with creative vision ensures that every project I undertake exceeds expectations.`}
                    <br />
                    <br />
                    {`Let's create something amazing together. Contact me today to discuss your project.`}
                </p>
            </div>
            <div className="absolute top-16 flex md:gap-8 flex-col-reverse items-center justify-center right-2 md:static md:flex-row md:mt-10">
                <Link href="https://www.linkedin.com/in/nadav-eliash/" className="w-12 md:w-20 md:h-20 rounded-full">
                    <Image src="https://www.svgrepo.com/show/452051/linkedin.svg" alt="linkedin" width={60} height={60} className="rounded-full w-full h-full"></Image>
                </Link>
                <Link href="https://github.com/NadavEliash" className="w-12 md:w-20 md:h-20 rounded-full p-1">
                    <Image src="https://www.svgrepo.com/show/450156/github.svg" alt="github" width={60} height={60} className="rounded-full w-full h-full"></Image>
                </Link>
                <Link href="https://drive.google.com/file/d/1ZaJTI-GByj5o4FIRtB2yXsgm92WZ_dIa/view?usp=drive_link" className="w-10 h-10 md:w-[72px] md:h-[72px] flex flex-col items-center p-1 md:px-3 md:py-1 m-1 bg-white/20 rounded-full">
                    <Image src="https://www.svgrepo.com/show/384666/career-detail-document-file-info-job.svg" alt="CV" width={60} height={60} className="invert w-16 h-16">
                    </Image>
                    <h1 className="hidden md:block text-sm text-white">cv</h1>
                </Link>
            </div>
        </>
    )
}