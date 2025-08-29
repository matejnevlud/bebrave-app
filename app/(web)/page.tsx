import { Button } from "@heroui/button";
import { ArrowRight, Coffee } from "lucide-react";
import { Image as HeroImage } from "@heroui/image";
import { Link } from "@heroui/link";

import { Logo } from "@/components/icons";
import Lectors from "@/app/(web)/Lectors";
import HlsPlayer from "@/components/HLSPlayer";
import TrainersForClass from "@/app/(web)/TrainersForClass";
import HLSPlayerControls from "@/components/HLSPlayerControls";

export default function Home() {
  return (
    <div className="">
      <div className="max-w-none w-screen ml-[-1.5rem] aspect-[3/4] sm:aspect-[3/2] lg:aspect-[2/1] 2xl:aspect-[21/9]   bg-white">
        <HlsPlayer
          src={
            "https://customer-llaf4k9ibc46xjbf.cloudflarestream.com/d625d429477546b9d805abd99bff0cf9/manifest/video.m3u8"
          }
        />
        <div className="relative h-full flex items-center justify-center pl-16 pr-8 sm:pl-20 sm:pr-16">
          <Logo className="bg-blend-color-dodge" color={"white"} width={800} />
        </div>
      </div>

      <section className={"max-w-7xl mx-auto w-full px-6 "}>
        <div className="hidden md:min-h-[40rem] h-[40vh] sm:h-[60vh] mx-auto bg-black">
          <div className="absolute left-0 right-0 flex justify-center bg-white">
            <img
              alt="logo"
              className="w-[120rem] md:min-h-[40rem] h-[40vh] sm:h-[60vh] object-cover hidden md:block"
              src="/hero.jpg"
              style={{ objectPosition: "50% 70%" }}
            />
            <img
              alt="logo"
              className="w-[120rem] md:min-h-[40rem] h-[40vh] sm:h-[60vh] object-cover md:hidden block "
              src="/photos/bebrave-10-wide.jpg"
            />
          </div>
          <div className="relative h-full flex items-end pb-24 justify-center md:hidden ">
            <Logo color={"white"} width={800} />
          </div>
        </div>

        <div
          className="flex flex-col sm:flex-row my-10 sm:my-20 gap-8"
          id="onas"
          style={{ justifyContent: "space-around", alignItems: "center" }}
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
              className="animate-pulse-scale transition-transform duration-1000"
              color="success"
              endContent={<ArrowRight />}
              href="/reservation"
              size="lg"
              style={{ color: "#ffffff" }}
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

        <div className="h-2" id="lekce" />

        <div
          className="flex flex-col sm:flex-row my-10 sm:my-20 gap-8"
          style={{ justifyContent: "space-around", alignItems: "center" }}
        >
          <div className="block flex-1 text-center sm:text-center">
            <h1 className="font-sans font-bold text-3xl lg:text-6xl">
              Prohlédni si naše lekce
            </h1>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 mt-20 overflow-visible">
          <div className="flex-[1]  block overflow-visible">
            <HeroImage
              isBlurred
              alt="HeroUI Album Cover"
              className="rounded-md hover:scale-[1.02] transition-transform duration-300"
              height={"30em"}
              src="https://imagedelivery.net/eo8aTqb-9sQsvXZHFngPsQ/6d2f366d-4444-43c2-09cd-56ce13324c00/public"
              style={{ objectFit: "cover", objectPosition: "50% 50%" }}
              width={"100%"}
            />
          </div>
          <div className="leading-7 flex-1 content-start">
            <h1 className="font-sans font-bold text-2xl sm:text-4xl">
              BODYPUMP
            </h1>
            <TrainersForClass classTypeName="BODYPUMP" />
            <p className=" mt-4">
              Bodypump je silová lekce, při které si intenzitu volíte sami a to
              zátěží na ose či kotoučích. V celé lekci postupně posílíte každou
              svalovou partii a individuálně se tak zaměříte na svůj vysněný
              progress. Pokud chcete tónovat či posilovat své tělo.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 mt-20 overflow-visible">
          <div className="leading-7 flex-1 content-start text-right">
            <h1 className="font-sans font-bold text-2xl sm:text-4xl ">
              BODYATTACK
            </h1>
            <TrainersForClass right classTypeName="BODYATTACK" />
            <p className=" mt-4">
              Jedná se o cardio lekci, inspirovanou atletickým tréninkem. V 55’
              nás čekají pomyslné dva bloky, ve kterých se postupně zvyšuje
              tepová frekvence, až do úplného maxima. Bodyattack je doplněný o
              chytlavou hudbu a spoustu zábavy, takže věříme, že chytne i tebe.
              Hodina cardia ještě nikdy neutekla tak rychle !
            </p>
          </div>
          <div className="flex-[1]  block overflow-visible">
            <HeroImage
              isBlurred
              alt="HeroUI Album Cover"
              className="rounded-md hover:scale-[1.02] transition-transform duration-300"
              height={"30em"}
              src="https://imagedelivery.net/eo8aTqb-9sQsvXZHFngPsQ/07b9d292-a6e8-4cb5-94cd-98d8cad4a300/public"
              style={{ objectFit: "cover", objectPosition: "50% 40%" }}
              width={"100%"}
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
              src="https://imagedelivery.net/eo8aTqb-9sQsvXZHFngPsQ/b85a0ed2-a8e9-440a-f742-0ad1c6a5e000/public"
              style={{ objectFit: "cover", objectPosition: "50% 40%" }}
              width={"100%"}
            />
          </div>
          <div className="leading-7 flex-1 content-start">
            <h1 className="font-sans font-bold text-2xl sm:text-4xl">
              BODYBALANCE
            </h1>
            <TrainersForClass classTypeName="BODYBALANCE" />
            <p className=" mt-4">
              Bodybalance je jeden z nejklidnějších LesMills programů. Je to
              spojení jógy, tai-chi a pilates, v jehož první části tělo spíše
              posílíme a v druhé protáhneme a zklidníme. Celá lekce je zakončena
              relaxací, kdy si každý najde moment, aby se zastavil, uvolnil a
              vnímal pouze přítomný moment. Pocit po téhle lekci bude k
              nezaplacení.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 mt-20 overflow-visible ">
          <div className="leading-7 flex-1 content-start text-right">
            <h1 className="font-sans font-bold text-2xl sm:text-4xl">
              LM CORE
            </h1>
            <TrainersForClass right classTypeName="LM CORE" />
            <p className=" mt-4">
              Lekce LesMills Core je koncipovaná tak, aby jste v jejím průběhu
              posílili nejen břicho, ale opravdu celý střed těla. Záda, hýždě a
              břicho budou v tomto tréninku dominovat. Takže pokud chceš zlepšit
              základ každého pohybu, LesMills Core určitě nevynechej !
            </p>
          </div>
          <div className="flex-[1]  block overflow-visible">
            <HeroImage
              isBlurred
              alt="HeroUI Album Cover"
              className="rounded-md hover:scale-[1.02] transition-transform duration-300"
              height={"30em"}
              src="https://imagedelivery.net/eo8aTqb-9sQsvXZHFngPsQ/806fbd80-56e0-4e1a-c80e-1e43ac9c3200/public"
              style={{ objectFit: "cover", objectPosition: "50% 40%" }}
              width={"100%"}
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
              src="https://imagedelivery.net/eo8aTqb-9sQsvXZHFngPsQ/2a372e87-02cc-437a-03a3-356cf5b4b700/public"
              style={{ objectFit: "cover", objectPosition: "50% 10%" }}
              width={"100%"}
            />
          </div>
          <div className="leading-7 flex-1 content-start">
            <h1 className="font-sans font-bold text-2xl sm:text-4xl">
              LM GRIT
            </h1>
            <TrainersForClass classTypeName="LM GRIT" />
            <p className=" mt-4">
              LesMills Grit je 30’ intenzivní HIIT lekce. Máme tři druhy a to
              Cardio - s vlastní váhou, Strength - s osou a kotouči a Athletic -
              je položený na Strength základech, ale přidáváme práci se stepem.
              Zkrátka krátký trénink, který tě zaručeně nakopne do správného
              tempa !
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 mt-20 overflow-visible ">
          <div className="leading-7 flex-1 content-start text-right">
            <h1 className="font-sans font-bold text-2xl sm:text-4xl">
              BODYSTEP
            </h1>
            <TrainersForClass right classTypeName="BODYSTEP" />
            <p className=" mt-4">
              Bodystep je nejstarší LesMills program a jedná se o trénink
              založený na stepaerobních základech, ale s cílem zaměřit se na
              tvarování spodní části těla a to i pomocí lehké zátěže. Jedná se o
              rytmickou lekci, která tě zaručeně rozhýbe.
            </p>
          </div>
          <div className="flex-[1]  block overflow-visible">
            <HeroImage
              isBlurred
              alt="HeroUI Album Cover"
              className="rounded-md hover:scale-[1.02] transition-transform duration-300"
              height={"30em"}
              src="https://imagedelivery.net/eo8aTqb-9sQsvXZHFngPsQ/b4605d34-5892-4ac8-6bae-517db5e61800/public"
              style={{ objectFit: "cover", objectPosition: "50% 20%" }}
              width={"100%"}
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
              src="https://imagedelivery.net/eo8aTqb-9sQsvXZHFngPsQ/94adf910-d5f6-4c5a-4f55-98d257df0700/public"
              style={{ objectFit: "cover", objectPosition: "50% 30%" }}
              width={"100%"}
            />
          </div>
          <div className="leading-7 flex-1 content-start">
            <h1 className="font-sans font-bold text-2xl sm:text-4xl">
              BootyBoost
            </h1>
            <TrainersForClass classTypeName="BootyBoost" />
            <p className=" mt-4">
              Chceš se se svým výkonem posouvat neustále dopředu, vytvořit si
              disciplínu a udržet motivaci? A nebo zvýšit svou kondici a hlavně
              - mít PEVNÝ ZADEK ? Na této lekci aktivně zapojíme převážně spodek
              a střed těla a všechny předchozí body zaručeně naplníme ! Tak se
              přijď přesvědčit a vytvořit neodolatelný zadek !
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 mt-20 overflow-visible ">
          <div className="leading-7 flex-1 content-start text-right">
            <h1 className="font-sans font-bold text-2xl sm:text-4xl">
              AbsBurn
            </h1>
            <TrainersForClass right classTypeName="AbsBurn" />
            <p className=" mt-4">
              Chceš cítit břicho tak, jak už dlouho ne? Tak jsi na tom správném
              místě. ABSBurn je krátká lekce, ale o to intenzivnější, kde
              procvičíme jak samotné břišní svaly, tak hluboký stabilizační
              systém.
            </p>
          </div>
          <div className="flex-[1]  block overflow-visible">
            <HeroImage
              isBlurred
              alt="HeroUI Album Cover"
              className="rounded-md hover:scale-[1.02] transition-transform duration-300"
              height={"30em"}
              src="https://imagedelivery.net/eo8aTqb-9sQsvXZHFngPsQ/deee7a03-94e7-406d-d95d-81991be26800/public"
              style={{ objectFit: "cover", objectPosition: "50% 60%" }}
              width={"100%"}
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
              src="https://imagedelivery.net/eo8aTqb-9sQsvXZHFngPsQ/06694bcc-b527-4dc1-5ecb-6ef7d3cde200/public"
              style={{ objectFit: "cover", objectPosition: "50% 30%" }}
              width={"100%"}
            />
          </div>
          <div className="leading-7 flex-1 content-start">
            <h1 className="font-sans font-bold text-2xl sm:text-4xl">
              Interval Yoga
            </h1>
            <TrainersForClass classTypeName="Interval Yoga" />
            <p className=" mt-4">
              Interval yoga je dynamická lekce, která propojuje plynulost a
              principy vinyasa jógy s prvky intervalového tréninku. Budete mít
              prostor pro vnímání sebe sama a relaxaci, ale zároveň nás
              intenzivní fyzická část rozproudí a dodá lekci energii.
              Zapracujeme na kondici, flexibilitě i mentálním resetu – zklidníme
              mysl a zároveň probudíme tělo.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 mt-20 overflow-visible ">
          <div className="leading-7 flex-1 content-start text-right">
            <h1 className="font-sans font-bold text-2xl sm:text-4xl">
              Pilates
            </h1>
            <TrainersForClass right classTypeName="Pilates" />
            <p className=" mt-4">
              Na mých lekcích Pilates klademe důraz na plynulé, kontrolované
              pohyby, vědomé zapojení svalů a synchronizaci s dechem. Díky malým
              činkám, závažím a odporovým gumám dokážete efektivně cílit na
              hluboké svalové skupiny i problémové partie – břicho, hýždě či
              záda.
            </p>
          </div>
          <div className="flex-[1]  block overflow-visible">
            <HeroImage
              isBlurred
              alt="HeroUI Album Cover"
              className="rounded-md hover:scale-[1.02] transition-transform duration-300"
              height={"30em"}
              src="https://imagedelivery.net/eo8aTqb-9sQsvXZHFngPsQ/a4ccd189-8e2d-4965-1792-3e4ad5bd8100/public"
              style={{ objectFit: "cover", objectPosition: "50% 60%" }}
              width={"100%"}
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
              src="https://imagedelivery.net/eo8aTqb-9sQsvXZHFngPsQ/6d922c7e-c9c9-4777-d02e-f8b149a70f00/public"
              style={{ objectFit: "cover", objectPosition: "50% 20%" }}
              width={"100%"}
            />
          </div>
          <div className="leading-7 flex-1 content-start">
            <h1 className="font-sans font-bold text-2xl sm:text-4xl">
              Jogalates
            </h1>
            <TrainersForClass classTypeName="Jogalates" />
            <p className=" mt-4">
              Jogalates je lekce, která propojuje posilující prvky Pilates s
              plynulými jógovými pozicemi a závěrečnou meditací pro zklidnění
              těla i mysli. Díky pomůckám i cvičení bez nich posílíte hluboký
              střed, zlepšíte pružnost a uvolníte napětí. Čeká vás motivující
              vedení, plynulé přechody mezi pozicemi a harmonická kombinace
              síly, flexibility a duševní obnovy. Skvělý start do nového týdne!
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 mt-20 overflow-visible ">
          <div className="leading-7 flex-1 content-start text-right">
            <h1 className="font-sans font-bold text-2xl sm:text-4xl">TRX</h1>
            <TrainersForClass right classTypeName="TRX" />
            <p className=" mt-4">
              TRX – cvičení na závěsném systému, který nabízí obrovskou
              variabilitu pohybových možností a cviků. Tyto pohyby dávají
              každému bez rozdílu věku a kondice možnost plně využít pohybový
              potenciál, posílit i protáhnout tělo, zvýšit rozsah pohybu. Díky
              tomu budete nejen dobře vypadat, ale budete se tak i cítit.
            </p>
          </div>
          <div className="flex-[1]  block overflow-visible">
            <HeroImage
              isBlurred
              alt="HeroUI Album Cover"
              className="rounded-md hover:scale-[1.02] transition-transform duration-300"
              height={"30em"}
              src="https://imagedelivery.net/eo8aTqb-9sQsvXZHFngPsQ/a49e841d-3a1d-4ce1-3838-cdd9db0f1500/public"
              style={{ objectFit: "cover", objectPosition: "50% 60%" }}
              width={"100%"}
            />
          </div>
        </div>

        <div className="h-6" id="instruktori" />

        <div
          className="flex flex-col sm:flex-row my-10 sm:my-20 gap-8"
          style={{ justifyContent: "space-around", alignItems: "center" }}
        >
          <div className="block flex-1 text-center sm:text-center">
            <h1 className="font-sans font-bold text-3xl lg:text-6xl">
              Seznam se s instruktory
            </h1>
          </div>
        </div>

        <div>
          <Lectors />
        </div>

        {/* Pricing Section */}
        <div className="h-6" id="cenik" />
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
              <p className="absolute bottom-4 right-6 text-4xl md:text-5xl font-extrabold">2200,-</p>
              <p className="text-default-600 mt-3">Omezeno na 2 měsíce</p>
            </div>

            <div className="rounded-lg border border-default-200 p-6 bg-white/50 relative pb-20">
              <h3 className="font-bold text-xl">Permanentka 10 vstupů</h3>
              <div className="mt-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-100 text-primary-800 px-3 py-1.5 text-xs font-semibold shadow-sm ring-1 ring-primary-200">
                  <Coffee className="h-3.5 w-3.5" />
                  <span>+ káva nebo protein ke každému vstupu</span>
                </span>
              </div>
              <p className="absolute bottom-4 right-6 text-4xl md:text-5xl font-extrabold">2400,-</p>
              <p className="text-default-600 mt-3">Omezeno na 2 měsíce</p>
            </div>

            <div className="rounded-lg border border-default-200 p-6 bg-white/50 relative pb-20">
              <h3 className="font-bold text-xl">Měsíční permanentka</h3>
              <p className="text-default-600 mt-1">Vstupově neomezená</p>
              <p className="absolute bottom-4 right-6 text-4xl md:text-5xl font-extrabold">1900,-</p>
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
              <br /> 702 00 Ostrava
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
