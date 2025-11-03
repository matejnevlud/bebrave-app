"use client";

import {Avatar, Card, CardBody, Image} from "@heroui/react";
import React from "react";
import {Image as HeroImage} from "@heroui/image";
import {Button} from "@heroui/button";
import {Link} from "@heroui/link";
import {ArrowRight, Sparkles, Star, Zap} from "lucide-react";
import {motion} from "framer-motion";

export default function PromoBanner({ classType }: any) {
    const index = 1;
    const lastClass = classType.classes[classType.classes?.length - 1]
    return (
        <div
            key={'promo'}
            className={`relative flex flex-col md:flex-row gap-8 mt-10 overflow-visible ${index % 2 === 1 ? "md:flex-row-reverse" : ""}`}
        >
            <div
                className="flex-[1] block overflow-visible relative"
            >
                {/* Special event badge */}
                <div
                    className="rotate-12 absolute -top-3 -right-10 z-20 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1.5 rounded-full font-semibold text-xs shadow-lg"
                >
                    <div className="flex items-center gap-1 text-small ">
                        🎉 SPECIÁLNÍ UDÁLOST 🎉
                    </div>
                </div>
                
                <div
                    className="relative overflow-hidden rounded-xl"
                >
                    <HeroImage
                        isBlurred
                        alt={`${classType?.name} class image`}
                        className="rounded-xl hover:scale-105 transition-all duration-300 shadow-xl"
                        height={"30em"}
                        src={
                            `https://bebravestudio.cz/${classType?.image}` ||
                            "https://imagedelivery.net/eo8aTqb-9sQsvXZHFngPsQ/6d2f366d-4444-43c2-09cd-56ce13324c00/public"
                        }
                        style={{objectFit: "cover", objectPosition: "50% 50%"}}
                        width={"100%"}
                    />
                </div>
            </div>
            <div
                className={`leading-7 flex-1 content-start relative ${index % 2 === 1 ? "text-right" : ""}`}
            >
                <h1
                    className="font-sans font-bold text-3xl sm:text-5xl text-gray-900 dark:text-white text-center md:text-right"
                >
                    {classType?.name}
                </h1>
                <div
                    className="flex items-center gap-6 flex-wrap mt-6"
                    style={{
                        justifyContent: index % 2 === 1 ? "flex-end" : "flex-start",
                    }}
                >
                    {classType.trainerClassTypes.map((tct: any, idx: number) => (
                        <div
                            key={tct.trainer?.id}
                            className="flex items-center gap-3"
                        >
                            <img
                                alt={tct.trainer?.name}
                                className="w-10 h-10 rounded-full object-cover object-top border-2 border-gray-200 shadow-sm"
                                src={`https://bebravestudio.cz/${tct.trainer?.profilePicture}`}
                            />
                            <span className="text-medium font-medium text-gray-700 dark:text-gray-300">
                                {tct.trainer?.name}
                            </span>
                        </div>
                    ))}
                </div>
                <p
                    className="mt-6 text-lg leading-relaxed text-gray-600 dark:text-gray-300 text-center md:text-right"
                >
                    {classType.homepageText || classType.description}
                </p>
                
                <div
                    className="mt-8"
                >
                    <div className="flex justify-center md:justify-end ">
                        <Button
                            as={Link}
                            className="animate-wiggle bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 font-bold text-white px-10 py-4 shadow-xl border-0"
                            href={"/reservation?classId=" + lastClass?.id}
                            size="lg"
                            variant="shadow"
                        >
                            <div className="flex items-center gap-3">
                                Rezervovat místo
                                <div className="flex items-center justify-center">
                                    <ArrowRight size={20} />
                                </div>
                            </div>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}