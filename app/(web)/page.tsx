import {GithubIcon, Logo, LogoGroup} from "@/components/icons";
import {Button} from "@heroui/button";
import {ArrowRight} from "lucide-react";
import Image from "next/image";
import { Image as HeroImage } from "@heroui/image";
import {Link} from "@heroui/link";
import Lectors from "@/app/(web)/Lectors";
import HlsPlayer from "@/components/HLSPlayer";
import TrainersForClass from "@/app/(web)/TrainersForClass";
export default function Home() {
    return (
        <div className="">

            <div className="max-w-none w-screen ml-[-1.5rem] aspect-[3/4] sm:aspect-[3/2] lg:aspect-[2/1] 2xl:aspect-[21/9]   bg-white">
                <video className="hidden absolute left-0 right-0 w-full aspect-[3/4] sm:aspect-[3/2] lg:aspect-[2/1] 2xl:aspect-[21/9] object-cover" autoPlay muted loop playsInline preload="auto" poster="/first_frame.jpg" >
                    <source src="https://vz-affca140-be8.b-cdn.net/19067402-0d15-4eff-8550-073f1564cf7b/playlist.m3u8" type="application/x-mpegURL" />
                    <source src="https://vz-affca140-be8.b-cdn.net/19067402-0d15-4eff-8550-073f1564cf7b/play_720p.mp4" type="video/mp4" />
                </video>

                <HlsPlayer src={"https://vz-affca140-be8.b-cdn.net/19067402-0d15-4eff-8550-073f1564cf7b/playlist.m3u8"} />
                <div className="relative h-full flex items-center justify-center pl-16 pr-8 sm:pl-20 sm:pr-16">
                    <Logo width={800} color={'white'} className="bg-blend-color-dodge" />
                </div>
            </div>

            <section className={"max-w-7xl mx-auto w-full px-6 "}>



                <div className="hidden md:min-h-[40rem] h-[40vh] sm:h-[60vh] mx-auto bg-black">
                    <div className="absolute left-0 right-0 flex justify-center bg-white">
                        <img src="/hero.jpg" alt="logo" className="w-[120rem] md:min-h-[40rem] h-[40vh] sm:h-[60vh] object-cover hidden md:block" style={{ objectPosition: "50% 70%" }} />
                        <img src="/photos/bebrave-10-wide.jpg" alt="logo" className="w-[120rem] md:min-h-[40rem] h-[40vh] sm:h-[60vh] object-cover md:hidden block " />
                    </div>
                    <div className="relative h-full flex items-end pb-24 justify-center md:hidden ">
                        <Logo width={800} color={'white'}/>
                    </div>
                </div>



                <div id="onas" className="flex flex-col sm:flex-row my-10 sm:my-20 gap-8" style={{ justifyContent: "space-around", alignItems: "center" }}>
                    <div className="block flex-1 text-center sm:text-left">
                        <h1 className="font-sans font-bold text-2xl sm:text-4xl">Jsi připraven na výzvu?</h1>
                        <h1 className="font-sans font-bold text-2xl sm:text-4xl">Přidej se k nám ještě dnes.</h1>
                    </div>
                    <div >
                        <Button
                            as={Link}
                            href="/reservation"
                            color="success"
                            style={{ color: '#ffffff' }}
                            variant="shadow"
                            size="lg"
                            endContent={<ArrowRight />}
                            className="animate-pulse-scale transition-transform duration-1000"
                        >
                            Vybrat lekci
                        </Button>
                    </div>
                </div>


                <div className="flex flex-col md:flex-row gap-8 mb-20 overflow-visible">
                    <div className="flex-[2]  block overflow-visible">
                        <HeroImage
                            isBlurred
                            alt="HeroUI Album Cover"
                            className="rounded-md hover:scale-[1.02] transition-transform duration-300"
                            src="/photos/nahledy/bebrave-54_websize.jpg"
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


                <div id="lekce" className="h-2" />

                <div className="flex flex-col sm:flex-row my-10 sm:my-20 gap-8" style={{ justifyContent: "space-around", alignItems: "center" }}>
                    <div className="block flex-1 text-center sm:text-center">
                        <h1   className="font-sans font-bold text-3xl lg:text-6xl">Prohlédni si naše lekce</h1>
                    </div>
                </div>


                <div className="flex flex-col md:flex-row gap-8 mt-20 overflow-visible">
                    <div className="flex-[1]  block overflow-visible">
                        <HeroImage
                            isBlurred
                            alt="HeroUI Album Cover"
                            className="rounded-md hover:scale-[1.02] transition-transform duration-300"
                            height={"30em"}
                            width={"100%"}
                            style={{ objectFit: "cover", objectPosition: "50% 50%" }}
                            src="/photos/classes/bodypump.jpeg"
                        />
                    </div>
                    <div className="leading-7 flex-1 content-start">
                        <h1 className="font-sans font-bold text-2xl sm:text-4xl">BODYPUMP</h1>
                        <TrainersForClass classTypeName="BODYPUMP" />
                        <p className=" mt-4">
                            Bodypump je silová lekce, při které si intenzitu volíte sami a to zátěží na ose či kotoučích. V celé lekci postupně posílíte každou svalovou partii a individuálně se tak zaměříte na svůj vysněný progress.
                            Pokud chcete tónovat či posilovat své tělo.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8 mt-20 overflow-visible">

                    <div className="leading-7 flex-1 content-start text-right">
                        <h1 className="font-sans font-bold text-2xl sm:text-4xl ">BODYATTACK</h1>
                        <TrainersForClass classTypeName="BODYATTACK" right/>
                        <p className=" mt-4">
                            Jedná se o cardio lekci, inspirovanou atletickým tréninkem. V 55’ nás čekají pomyslné dva bloky, ve kterých se postupně zvyšuje tepová frekvence, až do úplného maxima. Bodyattack je doplněný o chytlavou hudbu a spoustu zábavy, takže věříme, že chytne i tebe. Hodina cardia ještě nikdy neutekla tak rychle !

                        </p>
                    </div>
                    <div className="flex-[1]  block overflow-visible">
                        <HeroImage
                            isBlurred
                            alt="HeroUI Album Cover"
                            className="rounded-md hover:scale-[1.02] transition-transform duration-300"
                            height={"30em"}
                            width={"100%"}
                            style={{ objectFit: "cover", objectPosition: "50% 40%" }}
                            src="/photos/classes/bodyattack.jpeg"
                        />
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8 mt-20 overflow-visible">
                    <div className="flex-[1]  block overflow-visible">
                        <HeroImage
                            isBlurred
                            alt="HeroUI Album Cover"
                            className="rounded-md hover:scale-[1.02] transition-transform duration-300"
                            height={"30em"}
                            width={"100%"}
                            style={{ objectFit: "cover", objectPosition: "50% 40%" }}
                            src="/photos/classes/bodybalance.jpeg"
                        />
                    </div>
                    <div className="leading-7 flex-1 content-start">
                        <h1 className="font-sans font-bold text-2xl sm:text-4xl">BODYBALANCE</h1>
                        <TrainersForClass classTypeName="BODYBALANCE"/>
                        <p className=" mt-4">
                            Bodybalance je jeden z nejklidnějších LesMills programů. Je to spojení jógy, tai-chi a pilates, v jehož první části tělo spíše posílíme a v druhé protáhneme a zklidníme. Celá lekce je zakončena relaxací, kdy si každý najde moment, aby se zastavil, uvolnil a vnímal pouze přítomný moment.
                            Pocit po téhle lekci bude k nezaplacení.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8 mt-20 overflow-visible ">

                    <div className="leading-7 flex-1 content-start text-right">
                        <h1 className="font-sans font-bold text-2xl sm:text-4xl">LM CORE</h1>
                        <TrainersForClass classTypeName="LM CORE" right/>
                        <p className=" mt-4">
                            Lekce LesMills Core je koncipovaná tak, aby jste v jejím průběhu posílili nejen břicho, ale opravdu celý střed těla. Záda, hýždě a břicho budou v tomto tréninku dominovat.
                            Takže pokud chceš zlepšit základ každého pohybu, LesMills Core určitě nevynechej !
                        </p>
                    </div>
                    <div className="flex-[1]  block overflow-visible">
                        <HeroImage
                            isBlurred
                            alt="HeroUI Album Cover"
                            className="rounded-md hover:scale-[1.02] transition-transform duration-300"
                            height={"30em"}
                            width={"100%"}
                            style={{ objectFit: "cover", objectPosition: "50% 40%" }}
                            src="/photos/classes/lmcore.jpeg"
                        />
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8 mt-20 overflow-visible">
                    <div className="flex-[1]  block overflow-visible">
                        <HeroImage
                            isBlurred
                            alt="HeroUI Album Cover"
                            className="rounded-md hover:scale-[1.02] transition-transform duration-300"
                            height={"30em"}
                            width={"100%"}
                            style={{ objectFit: "cover", objectPosition: "50% 10%" }}
                            src="/photos/classes/lmgrit.jpeg"
                        />
                    </div>
                    <div className="leading-7 flex-1 content-start">
                        <h1 className="font-sans font-bold text-2xl sm:text-4xl">LM GRIT</h1>
                        <TrainersForClass classTypeName="LM GRIT"/>
                        <p className=" mt-4">
                            LesMills Grit je 30’ intenzivní HIIT lekce. Máme tři druhy a to Cardio - s vlastní váhou, Strength - s osou a kotouči a Athletic - je položený na Strength základech, ale přidáváme práci se stepem.
                            Zkrátka krátký trénink, který tě zaručeně nakopne do správného tempa !
                        </p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8 mt-20 overflow-visible ">

                    <div className="leading-7 flex-1 content-start text-right">
                        <h1 className="font-sans font-bold text-2xl sm:text-4xl">BODYSTEP</h1>
                        <TrainersForClass classTypeName="BODYSTEP" right/>
                        <p className=" mt-4">
                            Bodystep je nejstarší LesMills program a jedná se o trénink založený na stepaerobních základech, ale s cílem zaměřit se na tvarování spodní části těla a to i pomocí lehké zátěže.
                            Jedná se o rytmickou lekci, která tě zaručeně rozhýbe.
                        </p>
                    </div>
                    <div className="flex-[1]  block overflow-visible">
                        <HeroImage
                            isBlurred
                            alt="HeroUI Album Cover"
                            className="rounded-md hover:scale-[1.02] transition-transform duration-300"
                            height={"30em"}
                            width={"100%"}
                            style={{ objectFit: "cover", objectPosition: "50% 20%" }}
                            src="/photos/classes/bodystep.jpeg"
                        />
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8 mt-20 overflow-visible">
                    <div className="flex-[1]  block overflow-visible">
                        <HeroImage
                            isBlurred
                            alt="HeroUI Album Cover"
                            className="rounded-md hover:scale-[1.02] transition-transform duration-300"
                            height={"30em"}
                            width={"100%"}
                            style={{ objectFit: "cover", objectPosition: "50% 30%" }}
                            src="/photos/classes/bootyboost.jpeg"
                        />
                    </div>
                    <div className="leading-7 flex-1 content-start">
                        <h1 className="font-sans font-bold text-2xl sm:text-4xl">BootyBoost</h1>
                        <TrainersForClass classTypeName="BootyBoost"/>
                        <p className=" mt-4">
                            Chceš se se svým výkonem posouvat neustále dopředu, vytvořit si disciplínu a udržet motivaci? A nebo zvýšit svou kondici a hlavně - mít PEVNÝ ZADEK ?
                            Na této lekci aktivně zapojíme převážně spodek a střed těla a všechny předchozí body zaručeně naplníme !
                            Tak se přijď přesvědčit a vytvořit neodolatelný zadek !
                        </p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8 mt-20 overflow-visible ">

                    <div className="leading-7 flex-1 content-start text-right">
                        <h1 className="font-sans font-bold text-2xl sm:text-4xl">AbsBurn</h1>
                        <TrainersForClass classTypeName="AbsBurn" right/>
                        <p className=" mt-4">
                            Chceš cítit břicho tak, jak už dlouho ne? Tak jsi na tom správném místě. ABSBurn je krátká lekce, ale o to intenzivnější, kde procvičíme jak samotné břišní svaly, tak hluboký stabilizační systém.
                        </p>
                    </div>
                    <div className="flex-[1]  block overflow-visible">
                        <HeroImage
                            isBlurred
                            alt="HeroUI Album Cover"
                            className="rounded-md hover:scale-[1.02] transition-transform duration-300"
                            height={"30em"}
                            width={"100%"}
                            style={{ objectFit: "cover", objectPosition: "50% 60%" }}
                            src="/photos/classes/absburn.jpeg"
                        />
                    </div>
                </div>


                <div className="flex flex-col md:flex-row gap-8 mt-20 overflow-visible">
                    <div className="flex-[1]  block overflow-visible">
                        <HeroImage
                            isBlurred
                            alt="HeroUI Album Cover"
                            className="rounded-md hover:scale-[1.02] transition-transform duration-300"
                            height={"30em"}
                            width={"100%"}
                            style={{ objectFit: "cover", objectPosition: "50% 30%" }}
                            src="/photos/classes/yoga.jpeg"
                        />
                    </div>
                    <div className="leading-7 flex-1 content-start">
                        <h1 className="font-sans font-bold text-2xl sm:text-4xl">Interval Yoga</h1>
                        <TrainersForClass classTypeName="Interval Yoga"/>
                        <p className=" mt-4">
                            Interval yoga je dynamická lekce, která propojuje plynulost a principy vinyasa jógy s prvky intervalového tréninku. Budete mít prostor pro vnímání sebe sama a relaxaci, ale zároveň nás intenzivní fyzická část rozproudí a dodá lekci energii.
                            Zapracujeme na kondici, flexibilitě i mentálním resetu – zklidníme mysl a zároveň probudíme tělo.

                        </p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8 mt-20 overflow-visible ">

                    <div className="leading-7 flex-1 content-start text-right">
                        <h1 className="font-sans font-bold text-2xl sm:text-4xl">Pilates</h1>
                        <TrainersForClass classTypeName="Pilates" right/>
                        <p className=" mt-4">
                            Na mých lekcích Pilates klademe důraz na plynulé, kontrolované pohyby, vědomé zapojení svalů a synchronizaci s dechem. Díky malým činkám, závažím a odporovým gumám dokážete efektivně cílit na hluboké svalové skupiny i problémové partie – břicho, hýždě či záda.
                        </p>
                    </div>
                    <div className="flex-[1]  block overflow-visible">
                        <HeroImage
                            isBlurred
                            alt="HeroUI Album Cover"
                            className="rounded-md hover:scale-[1.02] transition-transform duration-300"
                            height={"30em"}
                            width={"100%"}
                            style={{ objectFit: "cover", objectPosition: "50% 60%" }}
                            src="/photos/classes/pilates.jpeg"
                        />
                    </div>
                </div>


                <div className="flex flex-col md:flex-row gap-8 mt-20 overflow-visible">
                    <div className="flex-[1]  block overflow-visible">
                        <HeroImage
                            isBlurred
                            alt="HeroUI Album Cover"
                            className="rounded-md hover:scale-[1.02] transition-transform duration-300"
                            height={"30em"}
                            width={"100%"}
                            style={{ objectFit: "cover", objectPosition: "50% 20%" }}
                            src="/photos/classes/jogalates.jpeg"
                        />
                    </div>
                    <div className="leading-7 flex-1 content-start">
                        <h1 className="font-sans font-bold text-2xl sm:text-4xl">Jogalates</h1>
                        <TrainersForClass classTypeName="Jogalates"/>
                        <p className=" mt-4">
                            Jogalates je lekce, která propojuje posilující prvky Pilates s plynulými jógovými pozicemi a závěrečnou meditací pro zklidnění těla i mysli. Díky pomůckám i cvičení bez nich posílíte hluboký střed, zlepšíte pružnost a uvolníte napětí. Čeká vás motivující vedení, plynulé přechody mezi pozicemi a harmonická kombinace síly, flexibility a duševní obnovy. Skvělý start do nového týdne!
                        </p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8 mt-20 overflow-visible ">

                    <div className="leading-7 flex-1 content-start text-right">
                        <h1 className="font-sans font-bold text-2xl sm:text-4xl">TRX</h1>
                        <TrainersForClass classTypeName="TRX" right/>
                        <p className=" mt-4">
                            TRX – cvičení na závěsném systému, který nabízí obrovskou variabilitu pohybových možností a cviků.
                            Tyto pohyby dávají každému bez rozdílu věku a kondice možnost plně využít pohybový potenciál, posílit i protáhnout tělo, zvýšit rozsah pohybu. Díky tomu budete nejen dobře vypadat, ale budete se tak i cítit.
                        </p>
                    </div>
                    <div className="flex-[1]  block overflow-visible">
                        <HeroImage
                            isBlurred
                            alt="HeroUI Album Cover"
                            className="rounded-md hover:scale-[1.02] transition-transform duration-300"
                            height={"30em"}
                            width={"100%"}
                            style={{ objectFit: "cover", objectPosition: "50% 60%" }}
                            src="/photos/classes/trx.jpg"
                        />
                    </div>
                </div>

                <div id="instruktori" className="h-6" />

                <div className="flex flex-col sm:flex-row my-10 sm:my-20 gap-8" style={{ justifyContent: "space-around", alignItems: "center" }}>
                    <div className="block flex-1 text-center sm:text-center">
                        <h1   className="font-sans font-bold text-3xl lg:text-6xl">Seznam se s instruktory</h1>
                    </div>
                </div>

                <div>
                    <Lectors/>
                </div>




                <div className=" h-[30rem] mx-auto bg-black block mt-20 mb-[-5rem]">
                    <div className="absolute left-0 right-0 flex justify-center bg-white">
                        <img src="/photos/bebrave-24-wide.jpg" alt="logo" className="w-[120rem] h-[30rem] object-cover object-right-bottom block"/>
                    </div>

                    <div className="relative h-full flex flex-col items-end py-8 justify-center ">

                        <h1 className="text-white text-lg sm:text-4xl font-bold mt-4">BeBrave Studio</h1>
                        <p className="text-white text-right text-sm sm:text-2xl  mt-2">Důlní 3394/4<br/> 702 00 Ostrava</p>
                    </div>
                </div>


            </section>
        </div>
    );
}
