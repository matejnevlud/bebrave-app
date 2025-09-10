import {Button} from "@heroui/button";
import {ArrowRight, Coffee} from "lucide-react";
import {Link} from "@heroui/link";

import {Logo} from "@/components/icons";
import Lectors from "@/app/(web)/Lectors";
import HlsPlayer from "@/components/HLSPlayer";
import HLSPlayerControls from "@/components/HLSPlayerControls";
import HomepageClassTypes from "@/app/(web)/HomepageClassTypes";
import {getHomepageClassTypes, getTrainers} from "@/db/actions";
import {Avatar, Card, CardBody, Image} from "@heroui/react";
import React from "react";
import PromoBanner from "@/app/(web)/PromoBanner";

// Disable static generation for this page
export const dynamic = 'force-dynamic';

export default async function Home() {
    // Fetch data server-side for better performance
    // measure time
    const start = Date.now();
    const [homepageClassTypes, trainers] = await Promise.all([
        getHomepageClassTypes(),
        getTrainers(),
    ]);
    const end = Date.now();
    console.log("Homepage data fetching time: " + (end - start) + "ms");

    return (
        <div className="">
            <div className="max-w-none w-screen ml-[-1.5rem] aspect-[3/4] sm:aspect-[3/2] lg:aspect-[2/1] 2xl:aspect-[21/9]   bg-white">
                <HlsPlayer
                    src={
                        "https://customer-llaf4k9ibc46xjbf.cloudflarestream.com/d625d429477546b9d805abd99bff0cf9/manifest/video.m3u8"
                    }
                />
                <div className="relative h-full flex items-center justify-center pl-16 pr-8 sm:pl-20 sm:pr-16">
                    <Logo className="bg-blend-color-dodge" color={"white"} width={800}/>
                </div>
            </div>

            <section className={"max-w-7xl mx-auto w-full px-6 "}>
                <div className="hidden md:min-h-[40rem] h-[40vh] sm:h-[60vh] mx-auto bg-black">
                    <div className="absolute left-0 right-0 flex justify-center bg-white">
                        <img
                            alt="logo"
                            className="w-[120rem] md:min-h-[40rem] h-[40vh] sm:h-[60vh] object-cover hidden md:block"
                            src="/hero.jpg"
                            style={{objectPosition: "50% 70%"}}
                        />
                        <img
                            alt="logo"
                            className="w-[120rem] md:min-h-[40rem] h-[40vh] sm:h-[60vh] object-cover md:hidden block "
                            src="/photos/bebrave-10-wide.jpg"
                        />
                    </div>
                    <div className="relative h-full flex items-end pb-24 justify-center md:hidden ">
                        <Logo color={"white"} width={800}/>
                    </div>
                </div>


                <div className="flex flex-col my-10 flex-1 w-full">
                    <PromoBanner classType={homepageClassTypes[1]}/>
                </div>


                <div
                    className="flex flex-col sm:flex-row my-10 sm:my-20 gap-8"
                    id="onas"
                    style={{justifyContent: "space-around", alignItems: "center"}}
                >
                    <div className="block flex-1 text-center sm:text-left">
                        <h1 className="font-sans font-bold text-2xl sm:text-4xl">
                            Jsi připraven na výzvu?
                        </h1>
                        <h1 className="font-sans font-bold text-2xl sm:text-4xl">
                            Přidej se k nám ještě dnes.
                        </h1>
                    </div>
                    <div>
                        <Button
                            as={Link}
                            //className="animate-pulse-scale transition-transform duration-1000"
                            color="success"
                            endContent={<ArrowRight/>}
                            href="/reservation"
                            size="lg"
                            style={{color: "#ffffff"}}
                            variant="shadow"
                        >
                            Vybrat lekci
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8 mb-20 overflow-visible">
                    <div className="flex-[2]  block overflow-visible">
                        <HLSPlayerControls
                            src={
                                "https://customer-llaf4k9ibc46xjbf.cloudflarestream.com/04ef6b6b7aeb177554462a852c7866ff/manifest/video.m3u8"
                            }
                        />
                    </div>
                    <div className="leading-7 flex-1 content-start">
                        <h1 className="font-sans font-bold text-2xl sm:text-4xl">
                            Kdo jsme
                        </h1>

                        <p className=" mt-4">
                            Jsme místem, kde nejde jen o to „odcvičit si to své” – ale hlavně
                            se cítit dobře ve vlastním těle, najít si lekce, které tě budou
                            bavit, a obklopit se lidmi, se kterými sdílíš stejnou energii. V
                            našem studiu najdeš pestrou nabídku skupinových lekcí, které
                            sednou každému – stačí si jen najít tu svou.
                        </p>
                        <p className="font-bold mt-4">
                            Studio BeBrave není jen další fitness prostor – tvoříme zážitky,
                            komunitu a opravdovou radost z pohybu.
                        </p>
                    </div>
                </div>

                <div className="h-2" id="lekce"/>

                <div
                    className="flex flex-col sm:flex-row my-10 sm:my-20 gap-8"
                    style={{justifyContent: "space-around", alignItems: "center"}}
                >
                    <div className="block flex-1 text-center sm:text-center">
                        <h1 className="font-sans font-bold text-3xl lg:text-6xl">
                            Prohlédni si naše lekce
                        </h1>
                    </div>
                </div>

                <HomepageClassTypes classTypes={homepageClassTypes}/>

                <div className="h-6" id="instruktori"/>

                <div
                    className="flex flex-col sm:flex-row my-10 sm:my-20 gap-8"
                    style={{justifyContent: "space-around", alignItems: "center"}}
                >
                    <div className="block flex-1 text-center sm:text-center">
                        <h1 className="font-sans font-bold text-3xl lg:text-6xl">
                            Seznam se s instruktory
                        </h1>
                    </div>
                </div>

                <div>
                    <Lectors trainers={trainers}/>
                </div>

                {/* Pricing Section */}
                <div className="h-6" id="cenik"/>
                <section className="my-16 sm:my-24">
                    <div className="block flex-1 text-center sm:text-center mb-10 sm:mb-14">
                        <h2 className="font-sans font-bold text-3xl lg:text-6xl">
                            Ceník BeBrave
                        </h2>
                        <p className="text-default-500 mt-2 sm:mt-3">platný od 09/2025</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                        <div className="rounded-lg border border-default-200 p-6 bg-white/50 relative pb-20">
                            <h3 className="font-bold text-xl">Permanentka 10 vstupů</h3>
                            <p className="absolute bottom-4 right-6 text-4xl md:text-5xl font-extrabold">
                                2200,-
                            </p>
                            <p className="text-default-600 mt-3">Omezeno na 2 měsíce</p>
                        </div>

                        <div className="rounded-lg border border-default-200 p-6 bg-white/50 relative pb-20">
                            <h3 className="font-bold text-xl">Permanentka 10 vstupů</h3>
                            <div className="mt-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-100 text-primary-800 px-3 py-1.5 text-xs font-semibold shadow-sm ring-1 ring-primary-200">
                  <Coffee className="h-3.5 w-3.5"/>
                  <span>+ káva nebo protein ke každému vstupu</span>
                </span>
                            </div>
                            <p className="absolute bottom-4 right-6 text-4xl md:text-5xl font-extrabold">
                                2400,-
                            </p>
                            <p className="text-default-600 mt-3">Omezeno na 2 měsíce</p>
                        </div>

                        <div className="rounded-lg border border-default-200 p-6 bg-white/50 relative pb-20">
                            <h3 className="font-bold text-xl">Měsíční permanentka</h3>
                            <p className="text-default-600 mt-1">Vstupově neomezená</p>
                            <p className="absolute bottom-4 right-6 text-4xl md:text-5xl font-extrabold">
                                1900,-
                            </p>
                        </div>
                    </div>

                    <p className="text-center text-default-700 mt-8">
                        V případě zájmu lze vystavit dárkový poukaz.
                    </p>
                </section>

                <div className=" h-[30rem] mx-auto bg-black block mt-20 mb-[-5rem]">
                    <div className="absolute left-0 right-0 flex justify-center bg-white">
                        <img
                            alt="logo"
                            className="w-[120rem] h-[30rem] object-cover object-right-bottom block"
                            src="/photos/bebrave-24-wide.jpg"
                        />
                    </div>

                    <div className="relative h-full flex flex-col items-end py-8 justify-center ">
                        <h1 className="text-white text-lg sm:text-4xl font-bold mt-4">
                            BeBrave Studio
                        </h1>
                        <p className="text-white text-right text-sm sm:text-2xl  mt-2">
                            Důlní 3394/4
                            <br/> 702 00 Ostrava
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
