import {GithubIcon, Logo, LogoGroup} from "@/components/icons";
import {Button} from "@heroui/button";
import {ArrowRight} from "lucide-react";
import Image from "next/image";
import { Image as HeroImage } from "@heroui/image";
import {Link} from "@heroui/link";
export default function Home() {
    return (
        <section className={"max-w-7xl mx-auto"}>

            <div className="md:min-h-[40rem] h-[40vh] sm:h-[60vh] mx-auto bg-black">
                <div className="absolute left-0 right-0 flex justify-center bg-white">
                    <img src="/hero.jpg" alt="logo" className="w-[120rem] md:min-h-[40rem] h-[40vh] sm:h-[60vh] object-cover hidden md:block" style={{ objectPosition: "50% 70%" }} />
                    <img src="/photos/bebrave-10-wide.jpg" alt="logo" className="w-[120rem] md:min-h-[40rem] h-[40vh] sm:h-[60vh] object-cover md:hidden block " />
                </div>
                <div className="relative h-full flex items-end pb-24 justify-center md:hidden ">
                    <Logo width={800} color={'white'}/>
                </div>
            </div>



            <div className="flex flex-col sm:flex-row my-10 sm:my-20 gap-8" style={{ justifyContent: "space-around", alignItems: "center" }}>
                <div className="block flex-1 text-center sm:text-left">
                    <h1 className="font-sans font-bold text-2xl sm:text-4xl">Jsi připraven na výzvu?</h1>
                    <h1 className="font-sans font-bold text-2xl sm:text-4xl">Přidej se k nám ještě dnes.</h1>
                </div>
                <div >
                    <Button
                        as={Link}
                        //href="/reservation"
                        color="default"
                        style={{ color: '#ffffff', display: 'visible' }}
                        variant="shadow"
                        size="lg"
                        disabled
                        endContent={<ArrowRight />}
                        className="disabled animate-pulse-scale transition-transform duration-1000"
                    >
                        Rezervace budou spustěny brzy
                    </Button>
                </div>
            </div>


            <div className="flex flex-col sm:flex-row gap-8 overflow-visible">
                <div className="flex-[2]  block overflow-visible">
                    <HeroImage
                        isBlurred
                        alt="HeroUI Album Cover"
                        className="rounded-md"
                        src="/photos/nahledy/bebrave-3-crop.jpg"
                    />
                </div>
                <div className="leading-7 flex-1 content-start">
                    <h1 className="font-sans font-bold text-2xl sm:text-4xl">Kdo jsme</h1>
                    <p className=" mt-4">
                        BeBrave Studio je místo, kde se pohyb stává vášní. Zaměřujeme se na energické skupinové lekce pod vedením zkušených trenérů. Ať už jsi úplný začátečník nebo zkušený sportovec, u nás najdeš svůj rytmus.
                    </p>
                    <p className=" mt-4">
                        Naše studio je otevřené všem, kteří chtějí zlepšit svou kondici, získat nové dovednosti a užít si pohyb v přátelské atmosféře. Přijďte se k nám přidat a objevte radost z pohybu!
                    </p>
                </div>
            </div>

            <div className="hidden h-[50rem] mx-auto bg-black block mt-20">
                <div className="absolute left-0 right-0 flex justify-center bg-white">
                    <img src="/photos/bebrave-24-wide.jpg" alt="logo" className="w-[120rem] h-[50rem] object-cover object-left-bottom block"/>

                </div>
            </div>


        </section>
    );
}
