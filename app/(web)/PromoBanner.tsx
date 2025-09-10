"use client";

import {Avatar, Card, CardBody, Image} from "@heroui/react";
import React from "react";
import {Image as HeroImage} from "@heroui/image";
import {Button} from "@heroui/button";
import {Link} from "@heroui/link";
import {ArrowRight} from "lucide-react";

export default function PromoBanner({ classType }: any) {
    const index = 1;
    return (
        <div
            key={'promo'}
            className={`flex flex-col md:flex-row gap-8 mt-10 overflow-visible ${index % 2 === 1 ? "md:flex-row-reverse" : ""}`}
        >
            <div className="flex-[1] block overflow-visible">
                <HeroImage
                    isBlurred
                    alt={`${classType.name} class image`}
                    className="rounded-md hover:scale-[1.02] transition-transform duration-300"
                    height={"30em"}
                    src={
                        `https://bebravestudio.cz/${classType.image}` ||
                        "https://imagedelivery.net/eo8aTqb-9sQsvXZHFngPsQ/6d2f366d-4444-43c2-09cd-56ce13324c00/public"
                    }
                    style={{objectFit: "cover", objectPosition: "50% 50%"}}
                    width={"100%"}
                />
            </div>
            <div
                className={`leading-7 flex-1 content-start ${index % 2 === 1 ? "text-right" : ""}`}
            >
                <h1 className="font-sans font-bold text-2xl sm:text-4xl">
                    {classType.name}
                </h1>
                <div
                    className="flex items-center gap-8 flex-wrap mt-4 h-10"
                    style={{
                        justifyContent: index % 2 === 1 ? "flex-end" : "flex-start",
                    }}
                >
                    {classType.trainerClassTypes.map((tct: any) => (
                        <div key={tct.trainer.id}>
                            <img
                                alt={tct.trainer.name}
                                className="inline-flex me-2 hover:scale-125 transition-transform duration-200 w-10 h-10 rounded-full object-cover object-top"
                                src={`https://bebravestudio.cz/${tct.trainer.profilePicture}`}

                            />
                            <span className="text-medium font-medium">
                    {tct.trainer.name}
                  </span>
                        </div>
                    ))}
                </div>
                <p className="mt-4">
                    {classType.homepageText || classType.description}
                </p>
                <div className="mt-6">
                    <Button
                        as={Link}
                        className="animate-wiggle transition-all duration-1000"
                        color="success"
                        href="/reservation?classId=293"
                        size="lg"
                        style={{color: "#ffffff"}}
                        variant="shadow"
                    >
                        Rezervovat místo
                    </Button>
                </div>
            </div>
        </div>
    );
}