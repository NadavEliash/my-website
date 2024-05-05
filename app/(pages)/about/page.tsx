'use client'

import Image from "next/image"
import profile from "../../assets/profile.png"
import Link from "next/link"

export default function About() {

    return (
        <>
            <div className="relative mt-16 mx-6 md:w-[600px] p-6 rounded-3xl bg-white/10">
                <Image src={profile} alt="profile" width={100} height={100} className="rounded-full"></Image>
                <p className="text-justify text-lg md:text-xl mt-4">
                    {`My name is Nadav Eliash.`}
                    <br />
                    {`I'm a Frontend / Full Stack Web Developer with experience in writing single-page-applications using the latest technologies.
                I'v Graduate the "Coding Academy" - an intensive coding bootcamp (640 h) for Full Stack developers.`}
                    <br />
                    {`I'm a talented Designer and Animator, and have a full capacity of compositoning things in space and moving them around to create satisfying and fully experience for users.`}
                    <br />
                    {`I used to work for an international companies like Matell and Disney, as well as locals, such as Israel Hayom and TLV Municipality.`}
                    <br />
                    {`I love to solve problems, and enthusiast to learn and understand how things works. those things were driven me to learn coding.`}
                </p>
            </div>
            <div className="absolute opacity-80 top-4 flex gap-2 flex-col right-2 md:static md:flex-row md:mx-10 md:mt-10">
                <Link href="https://www.linkedin.com/in/nadav-eliash/">
                    <Image src="https://www.svgrepo.com/show/452051/linkedin.svg" alt="linkedin" width={60} height={60}></Image>
                </Link>
                <Link href="https://github.com/NadavEliash" className="bg-black/50 rounded-full">
                    <Image src="https://www.svgrepo.com/show/452211/github.svg" alt="github" width={60} height={60}></Image>
                </Link>
                <Link href="https://drive.google.com/file/d/1ZaJTI-GByj5o4FIRtB2yXsgm92WZ_dIa/view?usp=sharing" className="flex flex-col items-center w-14 h-14 px-3 py-1 bg-white/30 rounded-full">
                    <Image src="https://www.svgrepo.com/show/384666/career-detail-document-file-info-job.svg" alt="CV" width={60} height={60}>
                    </Image>
                    <h1 className="text-sm text-black font-bold">CV</h1>
                </Link>
            </div>
        </>
    )
}