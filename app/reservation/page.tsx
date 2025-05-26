"use client"

import {title} from "@/components/primitives";

import {Tab, Image, Card, CardBody, Calendar, Divider, SelectItem, Select, SelectedItems, Avatar, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell} from "@heroui/react";
import React, {Fragment, useEffect, useState} from "react";
import {today, getLocalTimeZone, isWeekend, CalendarDate, ZonedDateTime, CalendarDateTime, getDayOfWeek} from "@internationalized/date";
import {I18nProvider, useLocale} from "@react-aria/i18n";
import {Divide, Icon, SeparatorVertical} from "lucide-react";
import {db} from "@/db";
import {Class, ClassType, Trainer, trainersTable} from "@/db/schema";
import {getClasses, getClassTypes, getTrainers} from "@/db/actions";
import HorizontalSteps from "@/components/blocks/HorizontalSteps";
import {Button} from "@heroui/button";






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

    const [trainers, setTrainers] = useState<Trainer[]>([]);

    const [classes, setClasses] = useState<Class[]>([]);
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

    function determineStep() {
        var step = 0;

        if (selectedClassType) step = 1;
        if (selectedTrainer) step = 2;

        if (selectedDate) step = 3;

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


        var availableClasses: Class[] = classes

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
        let groupedClasses: Record<string, Class[]> = {};
        classesToRender.forEach((c) => {
            const dateKey = c.date.toString();
            if (!groupedClasses[dateKey]) {
                groupedClasses[dateKey] = [];
            }
            groupedClasses[dateKey].push(c);
        });

        return groupedClasses;
    }, [selectedDate, availableClassesBasedOnSelection, availableClassesForDate]);

    let isDateUnavailable = (date: any) => !availableClassesBasedOnSelection.some((c) => date.toString() === c.date.toString());


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
                        title: "Odešlete rezervaci",
                    },
                ]}
            />


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
                    renderValue={(items: SelectedItems<Trainer>) => {
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
                                    <span className="text-default-500 text-tiny">{item.data?.expertise}</span>
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
                                    <span className="text-tiny text-default-400">{user.expertise}</span>
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

            <section className="w-full max-w-3xl pt-6">
                {/*
                <Table aria-label="Example empty table" rowHeight={80} removeWrapper>
                    <TableHeader>
                        <TableColumn>ČAS</TableColumn>
                        <TableColumn>NÁZEV LEKCE</TableColumn>
                        <TableColumn>TRENÉR</TableColumn>
                        <TableColumn align="end"> </TableColumn>
                    </TableHeader>
                    <TableBody emptyContent={"Žádné lekce k zobrazení"} items={(selectedDate ? availableClassesForDate : availableClassesBasedOnSelection)}>
                        {(item) => (
                            <TableRow key={item.id} className="h-[4.5rem]">
                                <TableCell>
                                    <b>{item.time}</b>
                                    <br/>
                                    <span className="text-tiny">{item.classType.duration} min</span>
                                </TableCell>
                                <TableCell>
                                    <Avatar
                                        alt={item.classType?.name}
                                        className="inline-flex me-2 hover:scale-125 transition-transform duration-200"
                                        size="md"
                                        src={item.classType?.image as any}
                                    />
                                    <b>{item.classType?.name}</b>
                                </TableCell>
                                <TableCell>
                                    <Avatar
                                        alt={item.trainer?.name}
                                        className="inline-flex me-2 hover:scale-125 transition-transform duration-200"
                                        size="md"
                                        src={item.trainer?.profilePicture as any}
                                    />
                                    <span>{item.trainer?.name}</span>
                                </TableCell>
                                <TableCell>
                                    <Button color="primary" size="md">Rezervace</Button>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                */}

                {Object.entries(classesToRender).map(([date, classes]) => (
                    <Fragment>
                        <h2 className="text-xl font-bold text-center py-3">{new Date(date).toLocaleDateString('cs-CZ', { weekday: 'long' })} {new Date(date).toLocaleDateString()}</h2>
                        {classes.map((c: Class) => (
                            <div className="flex my-6 gap-6 items-center">
                                <div className="items-center flex flex-col justify-center ">
                                    <b>{c.time}</b>
                                    <span className="text-tiny">{c.classType.duration} min</span>
                                </div>
                                <Card key={c.id} className="">
                                    <CardBody className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-0 h-36">
                                        <Image
                                            src={c.classType.image}
                                            alt={c.classType.name}
                                            className="w-36 h-36 rounded-none object-cover"
                                        />
                                        <div className="flex-1 h-full flex flex-col justify-between py-2">
                                            <div>
                                                <h3 className="text-md font-semibold">{c.classType.name}</h3>
                                                <p className="text-small line-clamp-3">{c.classType.description}</p>
                                            </div>
                                            <div>
                                                <Avatar
                                                    alt={c.trainer?.name}
                                                    className="inline-flex me-2 hover:scale-125 transition-transform duration-200"
                                                    size="sm"
                                                    src={c.trainer?.profilePicture as any}
                                                />
                                                <span>{c.trainer?.name}</span>
                                            </div>

                                        </div>
                                        <div className="me-6">
                                            <Button color="primary" variant="solid" size="md">Rezervace</Button>
                                        </div>
                                    </CardBody>
                                </Card>
                            </div>
                        ))}
                    </Fragment>
                ))}


            </section>







        </div>
    );
}
