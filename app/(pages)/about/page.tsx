'use client'

import Image from "next/image"
import profile from "../../assets/profile.png"

export default function About() {

    return (
        <div className="relative mt-10 mx-10 w-[600px] p-6 rounded-3xl bg-white/10">
            <Image src={profile} alt="profile" width={100} height={100} className="rounded-full"></Image>
            <p className="text-justify text-xl mt-4">
                {`My name is Nadav Eliash.`}
                <br />
                {`I'm a Frontend / Full Stack Web Developer with experience in writing single-page-applications using the latest technologies.
                I'v Graduate the "Coding Academy" - an intensive coding bootcamp (640 h) for Full Stack developers.`}
                <br />
                {`I'm a talented Designer and Animator. I have a full capacity of compositoning things in space and moving them to create satisfying and fully experience.`}
                <br />
                {`I used to work for an international companies like Matell and Disney, as well as locals, such as Israel Hayom and TLV Municipality.`}
                <br />
                {`I love to solve problems, and enthusiast to learn and understand how things works. those things were driven me to learn coding.`}
            </p>
        </div>
    )
}