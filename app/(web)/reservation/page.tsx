"use client"

import {title} from "@/components/primitives";

import {Tab, Image, Card, CardBody, Calendar, Divider, SelectItem, Select, SelectedItems, Avatar, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, AutocompleteItem, Form, Modal, ModalContent, Chip} from "@heroui/react";
import React, {Fragment, useEffect, useState} from "react";
import {today, getLocalTimeZone, isWeekend, CalendarDate, ZonedDateTime, CalendarDateTime, getDayOfWeek} from "@internationalized/date";
import {I18nProvider, useLocale} from "@react-aria/i18n";
import {Divide, SeparatorVertical} from "lucide-react";
import {db} from "@/db";
import {Class, ClassType, ClassWithRelations, Trainer, trainersTable, TrainerWithRelations} from "@/db/schema";
import {createReservation, getClasses, getClassTypes, getTrainers} from "@/db/actions";
import HorizontalSteps from "@/components/blocks/HorizontalSteps";
import {Button} from "@heroui/button";
import {Autocomplete} from "@heroui/autocomplete";
import {Input} from "@heroui/input";
import {CardHeader} from "@heroui/card";
import {Badge} from "@heroui/badge";
import {ModalBody, ModalFooter, ModalHeader} from "@heroui/modal";
import {Resend} from "resend";
// @ts-ignore
import confetti from 'canvas-confetti';
import PaymentMethodRadioGroup from "@/components/blocks/PaymentMethodRadio";
import {Link} from "@heroui/link";
import { Icon } from "@iconify/react";





const users = [
    {
        id: 1,
        name: "Tony Reichert",
        role: "CEO",
        team: "Management",
        status: "active",
        age: "29",
        avatar: "/photos/nahledy/bebrave-17.jpg",
        email: "tony.reichert@example.com",
    },
    {
        id: 2,
        name: "Zoey Lang",
        role: "Tech Lead",
        team: "Development",
        status: "paused",
        age: "25",
        avatar: "/photos/nahledy/bebrave-18.jpg",
        email: "zoey.lang@example.com",
    },
    {
        id: 3,
        name: "Jane Fisher",
        role: "Sr. Dev",
        team: "Development",
        status: "active",
        age: "22",
        avatar: "/photos/nahledy/bebrave-19.jpg",
        email: "jane.fisher@example.com",
    },
    {
        id: 4,
        name: "William Howard",
        role: "C.M.",
        team: "Marketing",
        status: "vacation",
        age: "28",
        avatar: "/photos/nahledy/bebrave-20.jpg",
        email: "william.howard@example.com",
    },
    {
        id: 5,
        name: "Kristen Copper",
        role: "S. Manager",
        team: "Sales",
        status: "active",
        age: "24",
        avatar: "/photos/nahledy/bebrave-21.jpg",
        email: "kristen.cooper@example.com",
    },
    {
        id: 6,
        name: "Brian Kim",
        role: "P. Manager",
        team: "Management",
        age: "29",
        avatar: "/photos/nahledy/bebrave-22.jpg",
        email: "brian.kim@example.com",
        status: "active",
    },

];

type User = {
    id: number;
    name: string;
    role: string;
    team: string;
    status: string;
    age: string;
    avatar: string;
    email: string;
};





export default function ReservationPage() {


    const [selected, setSelected] = useState("videos");

    const [trainers, setTrainers] = useState<TrainerWithRelations[]>([]);

    const [classes, setClasses] = useState<ClassWithRelations[]>([]);
    const [classTypes, setClassTypes] = useState<ClassType[]>([]);

    const [isFetchingData, setIsFetchingData] = useState<boolean>(true);

    async function fetchData() {
        const t =  await getTrainers();
        const ct = await getClassTypes();
        const c = await getClasses();

        console.log(t);
        console.log(c);
        console.log(ct);

        setTrainers(t);
        setClassTypes(ct);
        setClasses(c);

        setIsFetchingData(false);
    }

    useEffect(() => {
        fetchData();
    }, [])


    let now = today(getLocalTimeZone());

    let disabledRanges = [
        [now, now.add({days: 5})],
        [now.add({days: 14}), now.add({days: 16})],
        [now.add({days: 23}), now.add({days: 24})],
    ];

    let {locale} = useLocale();





    // FORM DATA
    const [selectedClassType, setSelectedClassType] = useState<ClassType | null>(null);
    const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
    const [selectedDate, setSelectedDate] = useState<CalendarDate | null>(null);
    const [selectedClass, setSelectedClass] = useState<ClassWithRelations | null>(null);

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isFormSubmitted, setIsFormSubmitted] = useState<boolean>(false);

    function determineStep() {
        var step = 0;

        if (selectedClassType) step = 1;
        if (selectedTrainer) step = 2;

        if (selectedDate) step = 3;

        if (selectedClass) step = 4;

        if (isFormSubmitted) step = 5;

        return step; // Example: returning step 1 as the current step
    }

    function handleClassTypeChange (event: React.ChangeEvent<HTMLSelectElement>) {
        const classType = classTypes.find((ct) => ct.id.toString() == event.target.value) || null;
        setSelectedClassType(classType);

        if (classType) {
            setSelectedTrainer(null);
        }
        setSelectedDate(null);
    }

    function handleTrainerChange(event: React.ChangeEvent<HTMLSelectElement>) {
        const trainer = trainers.find((t) => t.id.toString() == event.target.value) || null;
        setSelectedTrainer(trainer);
        setSelectedDate(null);
    }

    const availableClassesBasedOnSelection = React.useMemo(() => {
        let availableClasses: ClassWithRelations[] = classes

        if(selectedClassType)
            availableClasses = classes.filter(c => c.classTypeId == selectedClassType.id);

        if (selectedTrainer)
            availableClasses = availableClasses.filter(c => c.trainerId == selectedTrainer.id);


        return availableClasses;
    }, [selectedClassType, selectedTrainer, classes, trainers]);


    const availableClassesForDate = React.useMemo(() => {
        if (!selectedDate) return [];

        return availableClassesBasedOnSelection.filter(c => {
            return c.date === selectedDate.toString();
        });
    }, [selectedDate, availableClassesBasedOnSelection]);

    const classesToRender = React.useMemo(() => {
        let classesToRender = selectedDate ? availableClassesForDate : availableClassesBasedOnSelection;

        // Order by date and time
        classesToRender.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateA.getTime() - dateB.getTime() || a.time.localeCompare(b.time);
        });

        // Group classes by date
        let groupedClasses: Record<string, ClassWithRelations[]> = {};
        classesToRender.forEach((c) => {
            const dateKey = c.date.toString();
            if (!groupedClasses[dateKey]) {
                groupedClasses[dateKey] = [];
            }
            groupedClasses[dateKey].push(c);
        });

        // Sort groupedClasses by time in that date, the time field is a string in HH:MM format, from the earliest to the latest
        // firt create date time objects from the time strings, then sort them
        Object.keys(groupedClasses).forEach((dateKey) => {
            groupedClasses[dateKey].sort((a, b) => {
                const timeA = a.time.split(":").map(Number);
                const timeB = b.time.split(":").map(Number);
                return timeA[0] - timeB[0] || timeA[1] - timeB[1];
            });
        });


        return groupedClasses;
    }, [selectedDate, availableClassesBasedOnSelection, availableClassesForDate]);

    let isDateUnavailable = (date: any) => !availableClassesBasedOnSelection.some((c) => date.toString() === c.date.toString());

    function hasClassFreeSpot(c: ClassWithRelations) {
        // Check if the class has any reservations
        if (!c.reservations || c.reservations.length === 0) {
            return true; // No reservations means free spot
        }
        return c.reservations.length < c.capacity;
    }


    async function handleReservationSubmit(event: any) {
        event.preventDefault();

        const form = event.currentTarget;
        console.log(form)

        setIsSubmitting(true);

        try {
            // wait for 2 seconds to simulate a network request
            await new Promise(resolve => setTimeout(resolve, 1000));

            let userData = Object.fromEntries(new FormData(form));

            const response = await createReservation(selectedClass as ClassWithRelations, undefined, userData)

            if (response) {
                setIsFormSubmitted(true);
                confetti({
                    particleCount: 200,
                    startVelocity: 60,
                });
            } else {
                alert("Chyba při vytváření rezervace. Zkuste to prosím znovu.");
            }
        } catch (error) {
            console.error("Error submitting reservation form:", error);
            alert("Došlo k chybě při odesílání rezervace. Zkuste to prosím znovu později.");
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="mx-auto flex flex-col items-center justify-center gap-4 pt-4 max-w-7xl">

            <h1 className="text-4xl font-sans font-bold">Rezervační systém</h1>

            <HorizontalSteps
                currentStep={determineStep()}
                steps={[
                    {
                        title: "Vyberte typ lekce",
                    },
                    {
                        title: "Vyberte trenéra",
                    },
                    {
                        title: "Zvolte datum a čas",
                    },
                    {
                        title: "Vyplňte údaje",
                    },
                    {
                        title: "Odešlete rezervaci",
                    },
                ]}
            />




            {/* Calendar chooser */}
            <section className={"w-full max-w-3xl " + (determineStep() >= 4 ? "hidden" : "")}>
                <div className="w-full max-w-3xl flex flex-col sm:flex-row gap-4 my-4 items-center justify-center">
                    <Select
                        aria-label="Select Class Type"
                        isLoading={isFetchingData}
                        isDisabled={isFetchingData}
                        onChange={handleClassTypeChange}
                        selectedKeys={selectedClassType ? [selectedClassType.id.toString()] : []}
                        classNames={{
                            base: " fl",
                            trigger: "h-12",
                        }}
                        items={classTypes}
                        placeholder="Vybrat Typ lekce"
                        maxListboxHeight={400}
                        renderValue={(items: SelectedItems<ClassType>) => {
                            return items.map((item) => (
                                <div key={item.key} className="flex items-center gap-2">
                                    <Avatar
                                        alt={item.data?.name}
                                        className="flex-shrink-0"
                                        size="sm"
                                        src={item.data?.image as any}
                                    />
                                    <div className="flex flex-col">
                                        <span>{item.data?.name}</span>
                                    </div>
                                </div>
                            ));
                        }}
                    >
                        {(user) => (
                            <SelectItem key={user.id} textValue={user.name}>
                                <div className="flex gap-2 items-center">
                                    <Avatar alt={user.name} className="flex-shrink-0" size="sm" src={user.image as any} />
                                    <div className="flex flex-col">
                                        <span className="text-small">{user.name}</span>
                                    </div>
                                </div>
                            </SelectItem>
                        )}
                    </Select>

                    <Select
                        aria-label="Select Trainer"
                        isLoading={isFetchingData}
                        isDisabled={isFetchingData}
                        selectedKeys={selectedTrainer ? [selectedTrainer.id.toString()] : []}
                        disabledKeys={selectedClassType ? trainers.filter(t => !t.trainerClassTypes?.some(tct => tct.classTypeId === selectedClassType?.id)).map(t => t.id.toString()) : []}
                        onChange={handleTrainerChange}
                        classNames={{
                            base: "fl",
                            trigger: "h-12",
                        }}
                        items={trainers}
                        placeholder="Vybrat trenéra"
                        maxListboxHeight={400}
                        renderValue={(items: SelectedItems<TrainerWithRelations>) => {
                            return items.map((item) => (
                                <div key={item.key} className="flex items-center gap-2">
                                    <Avatar
                                        alt={item.data?.name}
                                        className="flex-shrink-0"
                                        size="sm"
                                        src={item.data?.profilePicture as any}
                                    />
                                    <div className="flex flex-col">
                                        <span>{item.data?.name}</span>
                                        <span className="text-default-500 text-tiny">{item.data?.trainerClassTypes?.map(tcp => tcp.classType?.name).join(', ')}</span>
                                    </div>
                                </div>
                            ));
                        }}
                    >
                        {(user) => (
                            <SelectItem key={user.id} textValue={user.name}>
                                <div className="flex gap-2 items-center">
                                    <Avatar alt={user.name} className="flex-shrink-0" size="sm" src={user.profilePicture as any} />
                                    <div className="flex flex-col">
                                        <span className="text-small">{user.name}</span>
                                        <span className="text-tiny text-default-400">{user?.trainerClassTypes?.map(tcp => tcp.classType?.name).join(', ')}</span>
                                    </div>
                                </div>
                            </SelectItem>
                        )}
                    </Select>

                </div>

                <I18nProvider locale="cs-CZ">
                    <Calendar
                        aria-label="Date"
                        className={isFetchingData ? "opacity-50" : ""}
                        minValue={today(getLocalTimeZone()) as any}
                        isDateUnavailable={isDateUnavailable}
                        visibleMonths={3}
                        hideDisabledDates
                        calendarWidth={'16rem'}
                        weekdayStyle="short"
                        pageBehavior={"single"}
                        onChange={setSelectedDate as any}
                        value={selectedDate as any}
                    />
                </I18nProvider>

                <div className="w-full max-w-3xl pt-6">
                    {Object.entries(classesToRender).map(([date, classes]) => (
                        <Fragment>
                            <h2 className="text-xl font-bold text-center py-3">{new Date(date).toLocaleDateString('cs-CZ', { weekday: 'long' })} {new Date(date).toLocaleDateString('cs-CZ')}</h2>
                            {classes.map((c: ClassWithRelations) => (
                                <div className="flex my-6 gap-3 sm:gap-6 items-center">
                                    <div className="lg:absolute lg:ml-[-5rem] items-center flex flex-col justify-center lg:w-14">
                                        <b>{c.time}</b>
                                        <span className="text-tiny">{c.classType.duration} min</span>
                                    </div>
                                    <Card key={c.id} isDisabled={!hasClassFreeSpot(c)} isPressable={hasClassFreeSpot(c)} className="hover:shadow-lg transition-shadow duration-200 flex-1"  onPress={() => setSelectedClass(c)}>

                                        <CardBody className="flex flex-row sm:flex-row items-start sm:items-center gap-3 p-0 h-36">
                                            <Image
                                                src={c.classType.image as any}
                                                alt={c.classType.name}
                                                className="w-28 sm:w-36 h-36 rounded-none object-cover"
                                            />
                                            <div className="flex-1 h-full flex flex-col justify-between py-2 pe-2">
                                                <div>
                                                    <h3 className="text-md font-semibold">{c.classType.name}</h3>
                                                    <p className="text-small line-clamp-3 text-justify text-justify">{c.classType.description}</p>
                                                </div>
                                                <div className="flex items-center">
                                                    <Avatar
                                                        alt={c.trainer?.name}
                                                        className="inline-flex me-2 hover:scale-125 transition-transform duration-200"
                                                        size="sm"
                                                        src={c.trainer?.profilePicture as any}
                                                    />
                                                    <span className="text-small sm:text-medium" >{c.trainer?.name}</span>
                                                    { c.secondTrainer && (
                                                        <div className="inline-block ml-4">
                                                            <Avatar
                                                                alt={c.secondTrainer?.name}
                                                                className="inline-flex me-2 hover:scale-125 transition-transform duration-200"
                                                                size="sm"
                                                                src={c.secondTrainer?.profilePicture as any}
                                                            />
                                                            <span className="text-small sm:text-medium" >{c.secondTrainer?.name}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex-1"></div>
                                                    {!hasClassFreeSpot(c) && <Chip size="md" color="danger" className={"sm:hidden"}>Vyprodáno</Chip>}
                                                    {hasClassFreeSpot(c) && <span className="float-right mt-1.5 sm:mt-1 mr-4 text-small sm:text-medium" >{c?.classType?.price} Kč</span>}
                                                </div>

                                            </div>
                                            <div className="hidden sm:block me-6">
                                                {hasClassFreeSpot(c) && <Button color="primary" variant="solid" size="md" onClick={() => setSelectedClass(c)}>Rezervovat</Button>}
                                                {!hasClassFreeSpot(c) && <Button isDisabled color="danger" className={"hidden sm:inline-flex"}>Vyprodáno</Button>}
                                            </div>
                                        </CardBody>
                                    </Card>
                                </div>
                            ))}
                        </Fragment>
                    ))}


                </div>
            </section>

            {/* Reservation form */}
            <section className={"w-full max-w-3xl " + (determineStep() === 4 ? "shown" : "hidden")}>


                <div>
                    <Link isBlock onPress={() => setSelectedClass(null)} color={"foreground"} className="absolute mt-6 hover:cursor-pointer !text-xl text-center font-bold">
                        <Icon icon={"weui:back-filled"} className="inline-block me-2" />
                        Zpět
                    </Link>
                    <h2 className="text-xl text-center font-bold pt-6">{new Date(selectedClass?.date ?? 0 ).toLocaleDateString('cs-CZ', { weekday: 'long' })} {new Date(selectedClass?.date ?? 0).toLocaleDateString('cs-CZ')} v {selectedClass?.time}</h2>
                </div>


                <div className="flex my-6 gap-3 sm:gap-6 items-center">
                    <div className="lg:absolute lg:ml-[-5rem] items-center flex flex-col justify-center lg:w-14">
                        <b>{selectedClass?.time}</b>
                        <span className="text-tiny">{selectedClass?.classType.duration} min</span>
                    </div>
                    <Card key={selectedClass?.id} className="hover:shadow-lg transition-shadow duration-200 flex-1" isPressable >
                        <CardBody className="flex flex-row sm:flex-row items-start sm:items-center gap-3 p-0 h-36">
                            <Image
                                src={selectedClass?.classType.image as any}
                                alt={selectedClass?.classType.name}
                                className="w-28 sm:w-36 h-36 rounded-none object-cover"
                            />
                            <div className="flex-1 h-full flex flex-col justify-between py-2 pe-2">
                                <div>
                                    <h3 className="text-md font-semibold">{selectedClass?.classType.name}</h3>
                                    <p className="text-small line-clamp-3 text-justify pe-3">{selectedClass?.classType.description}</p>
                                </div>
                                <div>
                                    <Avatar
                                        alt={selectedClass?.trainer?.name}
                                        className="inline-flex me-2 hover:scale-125 transition-transform duration-200"
                                        size="sm"
                                        src={selectedClass?.trainer?.profilePicture as any}
                                    />
                                    <span className="text-small sm:text-medium" >{selectedClass?.trainer?.name}</span>

                                    { selectedClass?.secondTrainer && (
                                        <div className="inline-block ml-4">
                                            <Avatar
                                                alt={selectedClass?.secondTrainer?.name}
                                                className="inline-flex me-2 hover:scale-125 transition-transform duration-200"
                                                size="sm"
                                                src={selectedClass?.secondTrainer?.profilePicture as any}
                                            />
                                            <span className="text-small sm:text-medium" >{selectedClass?.secondTrainer?.name}</span>
                                        </div>
                                    )}
                                    <span className="float-right mt-1.5 sm:mt-1 mr-4 text-small sm:text-medium" >{selectedClass?.classType?.price} Kč</span>
                                </div>

                            </div>
                        </CardBody>
                    </Card>
                </div>



                <Card className="p-2 mt-8">
                    <CardBody>
                        <Form validationBehavior="native" onSubmit={(e) => handleReservationSubmit(e)}>

                            <span className="relative text-foreground-500">Osobní údaje</span>
                            <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">

                                <Input
                                    isRequired
                                    name="firstName"
                                    label="Jméno"
                                    labelPlacement="outside"
                                    placeholder="Zadejte jméno"
                                    autoComplete="firstName"
                                />
                                <Input
                                    isRequired
                                    name="lastName"
                                    label="Příjmení"
                                    labelPlacement="outside"
                                    placeholder="Zadejte příjmení"
                                    autoComplete="lastName"
                                />
                                <Input
                                    isRequired
                                    name="email"
                                    label="Email"
                                    labelPlacement="outside"
                                    placeholder="Zadejte email"
                                    type="email"
                                    autoComplete="email"
                                />
                                {/* Phone Number */}
                                <Input
                                    isRequired
                                    name="phone"
                                    label="Telefonní číslo"
                                    labelPlacement="outside"
                                    placeholder="Zadejte telefonní číslo"
                                    type="tel"
                                    autoComplete="tel"
                                />
                            </div>


                            <span className="relative text-foreground-500 pt-6">Platební metoda</span>
                            <PaymentMethodRadioGroup/>






                            <div className="pt-6 flex w-full justify-end gap-2">

                                <Button color="primary" type="submit" isLoading={isSubmitting}>
                                    Odeslat rezervaci
                                </Button>
                            </div>
                        </Form>
                    </CardBody>
                </Card>
            </section>

            {/* Thank You page */}
            <section className={"w-full max-w-3xl " + (determineStep() === 5 ? "shown" : "hidden")}>
                <div className="flex flex-col items-center justify-center gap-4 pt-20">
                    <Image
                        src={selectedClass?.trainer.profilePicture ?? "/photos/trainers/martina.jpg"}
                        alt="Děkujeme za vaši rezervaci!"
                        className="w-72 h-72 rounded-full object-cover"
                    />

                    <h1 className="text-4xl text-center font-bold pt-4 pb-2">Děkujeme za vaši rezervaci!</h1>
                    <p className="text-lg text-center">
                        Vaše rezervace na lekci <b>{selectedClass?.classType.name}</b>  dne <b>{new Date(selectedClass?.date ?? -1).toLocaleDateString('cs-CZ', { weekday: 'long' })} {new Date(selectedClass?.date ?? -1).toLocaleDateString('cs-CZ')} v {selectedClass?.time}</b> byla úspěšně odeslána. Těšíme se na vás, tým BeBrave.
                    </p>
                </div>

            </section>

        </div>
    );
}
