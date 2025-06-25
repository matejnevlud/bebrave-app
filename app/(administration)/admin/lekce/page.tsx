"use client";

import React, {useEffect, useMemo, useState} from "react";
import {Avatar, DatePicker, Form, Modal, ModalContent, NumberInput, ScrollShadow, Select, SelectItem, TimeInput, useDisclosure} from "@heroui/react";
import{SVGProps} from "react";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    User,
    Chip,
    Tooltip,
    ChipProps,
} from "@heroui/react";
import {ClassType, ClassTypeWithRelations, ClassWithRelations, TrainerWithRelations} from "@/db/schema";
import {createClass, createClassType, deleteClass, getClasses, getClassTypes, getTrainers, updateClass, updateClassType} from "@/db/actions";
import {getLocalTimeZone, parseDate, parseTime, today} from "@internationalized/date";
import {Button} from "@heroui/button";
import {ModalBody, ModalHeader} from "@heroui/modal";
import {I18nProvider} from "@react-aria/i18n";
import {Input} from "@heroui/input";

type IconSvgProps = SVGProps<SVGSVGElement> & {
    size?: number;
};

const columns = [
    {name: "NAME", uid: "name"},
    {name: "ROLE", uid: "role"},
    {name: "STATUS", uid: "status"},
    {name: "ACTIONS", uid: "actions"},
];

const users = [
    {
        id: 1,
        name: "Tony Reichert",
        role: "CEO",
        team: "Management",
        status: "active",
        age: "29",
        avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
        email: "tony.reichert@example.com",
    },
    {
        id: 2,
        name: "Zoey Lang",
        role: "Technical Lead",
        team: "Development",
        status: "paused",
        age: "25",
        avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
        email: "zoey.lang@example.com",
    },
    {
        id: 3,
        name: "Jane Fisher",
        role: "Senior Developer",
        team: "Development",
        status: "active",
        age: "22",
        avatar: "https://i.pravatar.cc/150?u=a04258114e29026702d",
        email: "jane.fisher@example.com",
    },
    {
        id: 4,
        name: "William Howard",
        role: "Community Manager",
        team: "Marketing",
        status: "vacation",
        age: "28",
        avatar: "https://i.pravatar.cc/150?u=a048581f4e29026701d",
        email: "william.howard@example.com",
    },
    {
        id: 5,
        name: "Kristen Copper",
        role: "Sales Manager",
        team: "Sales",
        status: "active",
        age: "24",
        avatar: "https://i.pravatar.cc/150?u=a092581d4ef9026700d",
        email: "kristen.cooper@example.com",
    },
];

const EyeIcon = (props: IconSvgProps) => {
    return (
        <svg
            aria-hidden="true"
            fill="none"
            focusable="false"
            height="1em"
            role="presentation"
            viewBox="0 0 20 20"
            width="1em"
            {...props}
        >
            <path
                d="M12.9833 10C12.9833 11.65 11.65 12.9833 10 12.9833C8.35 12.9833 7.01666 11.65 7.01666 10C7.01666 8.35 8.35 7.01666 10 7.01666C11.65 7.01666 12.9833 8.35 12.9833 10Z"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
            />
            <path
                d="M9.99999 16.8916C12.9417 16.8916 15.6833 15.1583 17.5917 12.1583C18.3417 10.9833 18.3417 9.00831 17.5917 7.83331C15.6833 4.83331 12.9417 3.09998 9.99999 3.09998C7.05833 3.09998 4.31666 4.83331 2.40833 7.83331C1.65833 9.00831 1.65833 10.9833 2.40833 12.1583C4.31666 15.1583 7.05833 16.8916 9.99999 16.8916Z"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
            />
        </svg>
    );
};

const DeleteIcon = (props: IconSvgProps) => {
    return (
        <svg
            aria-hidden="true"
            fill="none"
            focusable="false"
            height="1em"
            role="presentation"
            viewBox="0 0 20 20"
            width="1em"
            {...props}
        >
            <path
                d="M17.5 4.98332C14.725 4.70832 11.9333 4.56665 9.15 4.56665C7.5 4.56665 5.85 4.64998 4.2 4.81665L2.5 4.98332"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
            />
            <path
                d="M7.08331 4.14169L7.26665 3.05002C7.39998 2.25835 7.49998 1.66669 8.90831 1.66669H11.0916C12.5 1.66669 12.6083 2.29169 12.7333 3.05835L12.9166 4.14169"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
            />
            <path
                d="M15.7084 7.61664L15.1667 16.0083C15.075 17.3166 15 18.3333 12.675 18.3333H7.32502C5.00002 18.3333 4.92502 17.3166 4.83335 16.0083L4.29169 7.61664"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
            />
            <path
                d="M8.60834 13.75H11.3833"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
            />
            <path
                d="M7.91669 10.4167H12.0834"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
            />
        </svg>
    );
};

const EditIcon = (props: IconSvgProps) => {
    return (
        <svg
            aria-hidden="true"
            fill="none"
            focusable="false"
            height="1em"
            role="presentation"
            viewBox="0 0 20 20"
            width="1em"
            {...props}
        >
            <path
                d="M11.05 3.00002L4.20835 10.2417C3.95002 10.5167 3.70002 11.0584 3.65002 11.4334L3.34169 14.1334C3.23335 15.1084 3.93335 15.775 4.90002 15.6084L7.58335 15.15C7.95835 15.0834 8.48335 14.8084 8.74168 14.525L15.5834 7.28335C16.7667 6.03335 17.3 4.60835 15.4583 2.86668C13.625 1.14168 12.2334 1.75002 11.05 3.00002Z"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeMiterlimit={10}
                strokeWidth={1.5}
            />
            <path
                d="M9.90833 4.20831C10.2667 6.50831 12.1333 8.26665 14.45 8.49998"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeMiterlimit={10}
                strokeWidth={1.5}
            />
            <path
                d="M2.5 18.3333H17.5"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeMiterlimit={10}
                strokeWidth={1.5}
            />
        </svg>
    );
};
const statusColorMap: Record<string, ChipProps["color"]> = {
    active: "success",
    paused: "danger",
    vacation: "warning",
};

type User = (typeof users)[0];

/**
 * 💡 TIP: You can use the usePathname hook from Next.js App Router to get the current pathname
 * and use it as the active key for the Sidebar component.
 *
 * ```tsx
 * import {usePathname} from "next/navigation";
 *
 * const pathname = usePathname();
 * const currentPath = pathname.split("/")?.[1]
 *
 * <Sidebar defaultSelectedKey="home" selectedKeys={[currentPath]} />
 * ```
 */


export default function LekcePage() {

    const [isLoading, setIsLoading] = useState<boolean>(false);

    let now = today(getLocalTimeZone());
    const [trainers, setTrainers] = useState<TrainerWithRelations[]>([]);

    const [classes, setClasses] = useState<ClassWithRelations[]>([]);
    const [classTypes, setClassTypes] = useState<ClassTypeWithRelations[]>([]);

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


    const [selectedClassType, setSelectedClassType] = useState<ClassTypeWithRelations>();
    const selectedClassTypeClasses = useMemo(() => {
        if (!selectedClassType) return [];
        return classes.filter(c => c.classTypeId === selectedClassType.id);
    }, [selectedClassType, classes]);
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    function openReservationModal(c: ClassTypeWithRelations) {
        setSelectedClassType(c);
        onOpen();
    }

    async function handleUpdateClassType(e: React.FormEvent<HTMLFormElement>) {
        try {
            e.preventDefault();
            setIsLoading(true);
            let data = Object.fromEntries(new FormData(e.currentTarget));
            console.log(data);

            const updatedClassType: Partial<ClassType> = {
                name: data.name as string,
                duration: parseInt(data.duration as string, 10),
                defaultCapacity: parseInt(data.defaultCapacity as string, 10),
                price: parseInt(data.price as string),
            }

            console.log(updatedClassType)

            const fetched = await updateClassType(selectedClassType?.id, updatedClassType);
            console.log("Updated class type:", fetched);
            // After updating, you might want to update the state to reflect the changes
            //@ts-ignore
            setClassTypes(prevClassTypes =>
                prevClassTypes.map(ct => ct.id === selectedClassType?.id ? fetched : ct)
            );

        } catch (error) {
            console.error("Error updating class type:", error);
            // Optionally, you can show an error message to the user
            alert("Failed to update class type. Please try again later.");
        } finally {
            setIsLoading(false);
        }

    }



    async function createNewClassType(e: React.FormEvent<HTMLFormElement>) {
        try {
            e.preventDefault();
            setIsLoading(true);
            let formData = new FormData(e.currentTarget)
            // convert FormData to a regular object beware of multiple same keys eg select
            let data = Object.fromEntries(formData) as any;
            data['trainers'] = formData.getAll('trainers').map((trainer: any) => parseInt(trainer, 10));
            console.log(data);


            // First uplaod the file if it exists

            if (data.file && data.file instanceof File) {
                const file = data.file;

                // get filetype
                const fileType = file.type.split('/')[1]; // e.g. 'png', 'jpg', etc.
                // create random file name
                const randomFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileType}`;

                const filePath = `/uploads/${randomFileName}`;
                // Here you would typically call an API to upload the file
                // For example, using fetch or axios to send the file to your server
                const fileFormData = new FormData();
                fileFormData.append('file', file);
                const response = await fetch(`/uploads/${randomFileName}`, {
                    method: 'POST',
                    body: fileFormData,
                });
                if (!response.ok) {
                    console.error("Failed to upload file:", response.statusText);
                    return;
                }
                const responseData = await response.json();
                console.log("File uploaded to:", responseData);

                console.log("File uploaded to:", filePath);
                data.image = filePath; // Assuming the server returns the path to the uploaded image
            } else {
                console.error("No file provided");
                return;
            }


            const newClassType: Partial<ClassType> = {
                name: data.name as string,
                duration: parseInt(data.duration as string, 10),
                defaultCapacity: parseInt(data.defaultCapacity as string, 10),
                price: parseInt(data.price as string),
                description: data.description as string,
                image: data.image as string, // Assuming you have an image URL or path
            }

            console.log(newClassType);

            const fetchedClassType = await createClassType(newClassType);
            console.log("New class type created:", fetchedClassType);
            //@ts-ignore
            setClassTypes(prevClassTypes => [...prevClassTypes, fetchedClassType]);
        } catch (error) {
            console.error("Error creating class type:", error);
            // Optionally, you can show an error message to the user
            alert("Failed to create class type. Please try again later.");
        } finally {
            setIsLoading(false);
        }

    }


    async function createNewClass(e: React.FormEvent<HTMLFormElement>) {
        try {
            e.preventDefault();
            setIsLoading(true);
            let data = Object.fromEntries(new FormData(e.currentTarget));
            console.log(data);

            if (!selectedClassType) {
                console.error("No class type selected");
                return;
            }

            const newClass: Partial<ClassWithRelations> = {
                classTypeId: selectedClassType.id,
                date: data.date as string,
                time: (data.time as string).substring(0, 5), // Ensure time is in HH:MM format
                trainerId: parseInt(data.trainerId as string, 10),
                secondTrainerId: data.secondTrainerId ? parseInt(data.secondTrainerId as string, 10) : undefined,
                capacity: selectedClassType.defaultCapacity,
                location: "Gym", // You can change this to a dynamic value if needed

            };

            console.log(newClass);
            // Here you would typically call an API to create the class
            const fetchedClass = await createClass(newClass);
            console.log("New class created:", fetchedClass);
            // After creation, you might want to update the state to include the new class
            //@ts-ignore
            setClasses(prevClasses => [...prevClasses, fetchedClass]);
        } catch (error) {
            console.error("Error creating class:", error);
            // Optionally, you can show an error message to the user
            alert("Failed to create class. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    }

    async function handleDeleteClass(id: number) {

        console.log("Deleting class with id:", id);
        // Here you would typically call an API to delete the class type
        setClasses(prevClasses => prevClasses.filter(c => c.id !== id));
        try {
            setIsLoading(true);
            await deleteClass(id);
        } catch (error) {
            console.error("Error deleting class:", error);
            // Optionally, you can show an error message to the user
            alert("Failed to delete class. Please try again later.");
        } finally {
            setIsLoading(false);
        }
        // After deletion, unset the class from the state


    }

    return (
        <div>
            <Table aria-label="Example empty table" rowHeight={80} removeWrapper >
                <TableHeader>
                    <TableColumn>NÁZEV LEKCE</TableColumn>
                    <TableColumn>TRVÁNÍ</TableColumn>
                    <TableColumn>CENA</TableColumn>
                    <TableColumn align="end"> </TableColumn>
                </TableHeader>
                <TableBody emptyContent={"Žádné classTypes k zobrazení"} items={classTypes}>
                    {(item) => (
                        <TableRow key={item.id} className="h-[4.5rem] hover:bg-default-100 cursor-pointer" onClick={() => openReservationModal(item)}>

                            <TableCell>
                                <Avatar
                                    alt={item?.name}
                                    className="inline-flex me-2 hover:scale-125 transition-transform duration-200"
                                    size="md"
                                    src={item.image as any}
                                />
                                <b>{item.name}</b>
                            </TableCell>


                            <TableCell>
                                ({item.duration} min)
                            </TableCell>

                            <TableCell>
                                <b>{item.price}</b>
                            </TableCell>

                            <TableCell>
                                <Button color="primary" size="md" isLoading={isLoading}>Detail</Button>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            <div>
                <h4 className="text-lg font-semibold mt-4 mb-4">Vytvořit nový typ lekce</h4>
                <Form className="w-full max-w grid grid-cols-1 md:grid-cols-2 gap-4 pb-20" onSubmit={createNewClassType}>
                    <Input
                        isRequired
                        labelPlacement="outside"
                        name="name"
                        label="Název lekce"
                        placeholder="Zadejte název lekce"
                    />

                    <Input
                        isRequired
                        labelPlacement="outside"
                        name="description"
                        label="Popis lekce"
                        placeholder="Zadejte popis lekce"
                        maxLength={500}
                    />

                    <NumberInput
                        isRequired
                        labelPlacement="outside"
                        name="duration"
                        label="Délka lekce (v minutách)"
                        maxValue={180}
                        minValue={1}
                        formatOptions={{ style: "decimal", minimumFractionDigits: 0, maximumFractionDigits: 0 }}
                    />
                    <NumberInput isRequired labelPlacement="outside" name="defaultCapacity" label="Výchozí kapacita lekce" maxValue={100} minValue={1}  formatOptions={{ style: "decimal", minimumFractionDigits: 0, maximumFractionDigits: 0 }} />
                    <NumberInput isRequired labelPlacement="outside" name="price" label="Cena lekce" formatOptions={{ style: "currency", currency: "CZK", minimumFractionDigits: 2, maximumFractionDigits: 2 }} />

                    <Input
                        isRequired
                        name="file"
                        type="file"
                        label="Obrázek lekce"
                        labelPlacement="outside"
                        accept="image/*"
                        placeholder="Vyberte obrázek lekce"
                    />


                    <Button className="" color="success" type="submit" isLoading={isLoading}>
                        Vytvořit typ lekce
                    </Button>

                </Form>
            </div>


            <Modal isOpen={isOpen} onOpenChange={onOpenChange} scrollBehavior="inside" size="5xl">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Detail {selectedClassType?.name}</ModalHeader>
                            <ModalBody>
                                <Form
                                    className="w-full max-w grid grid-cols-1 md:grid-cols-2 gap-4"
                                    onSubmit={handleUpdateClassType}
                                >
                                    <Input
                                        isRequired
                                        name="name"
                                        label="Název lekce"
                                        labelPlacement="outside"
                                        defaultValue={selectedClassType?.name}
                                        placeholder="Zadejte název lekce"
                                    />

                                    <NumberInput
                                        isRequired
                                        name="duration"
                                        label="Délka lekce (v minutách)"
                                        labelPlacement="outside"
                                        defaultValue={selectedClassType?.duration}
                                        maxValue={180}
                                        minValue={1}
                                        formatOptions={{ style: "decimal", minimumFractionDigits: 0, maximumFractionDigits: 0 }}
                                    />
                                    <NumberInput isRequired name="defaultCapacity" label="Výchozí kapacita lekce" labelPlacement="outside" defaultValue={selectedClassType?.defaultCapacity} maxValue={100} minValue={1}  formatOptions={{ style: "decimal", minimumFractionDigits: 0, maximumFractionDigits: 0 }} />
                                    <NumberInput isRequired name="price" label="Cena lekce" labelPlacement="outside" defaultValue={selectedClassType?.price} formatOptions={{ style: "currency", currency: "CZK", minimumFractionDigits: 2, maximumFractionDigits: 2 }} />


                                    <div className="">
                                        <Button className="col-span-full" color="primary" type="submit" isLoading={isLoading}>
                                            Uložit detail
                                        </Button>
                                    </div>

                                </Form>

                                <h4 className="text-lg font-semibold mt-8 mb-0">Vypsané termíny lekcí</h4>

                                <Table aria-label="Example empty table" rowHeight={80} removeWrapper className="mt-2">
                                    <TableHeader>
                                        <TableColumn>Datum lekce</TableColumn>
                                        <TableColumn>Hlavní trenér</TableColumn>
                                        <TableColumn>Druhý trenér</TableColumn>
                                        <TableColumn> </TableColumn>
                                    </TableHeader>
                                    <TableBody emptyContent={"Žádné termíny k zobrazení"} items={selectedClassTypeClasses || []}>
                                        {(item) => (
                                            <TableRow key={item.id} className="hover:bg-default-100 cursor-pointer">
                                                <TableCell className="flex-col flex gap-2">
                                                    <span className="font-medium text-medium">{new Date(item?.date ?? 0).toLocaleDateString('cs-CZ', { weekday: 'long' })} {new Date(item?.date ?? 0).toLocaleDateString()} {item.time}</span>
                                                </TableCell>

                                                <TableCell>
                                                    <span className="text-medium">{item.trainer?.name}</span>
                                                </TableCell>


                                                <TableCell>
                                                    <span className="text-medium">{item.secondTrainer?.name}</span>
                                                </TableCell>

                                                <TableCell onClick={() => handleDeleteClass(item.id)} className="text-right">
                                                    <Tooltip color="danger" content="Smazat lekci" >
                                                      <span className="text-lg text-danger cursor-pointer active:opacity-50">
                                                        <DeleteIcon />
                                                      </span>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>


                                <h4 className="text-lg font-semibold mt-8 mb-0">Přidat termín lekce</h4>

                                <Form className="w-full gap-4 mt-2  mb-6 flex md:flex-row flex-col" onSubmit={createNewClass}>
                                    <I18nProvider locale="cs-CZ">
                                        <DatePicker isRequired name="date" label="Datum" labelPlacement="outside" defaultValue={undefined}  minValue={now} hourCycle={24} fullWidth={false} />
                                    </I18nProvider>

                                    <TimeInput isRequired name="time" label="Čas" labelPlacement="outside"  hourCycle={24} granularity={"minute"} fullWidth={false} />

                                    <Select
                                        name="trainerId"
                                        label="Hlavní trenér"
                                        placeholder="Vyberte ze seznamu"
                                        items={trainers}
                                        isRequired
                                        labelPlacement="outside"
                                        fullWidth={false}
                                    >
                                        {(trainerKV) => <SelectItem key={trainerKV.id}>{trainerKV.name}</SelectItem>}
                                    </Select>

                                    <Select
                                        name="secondTrainerId"
                                        label="Druhý trenér"
                                        placeholder="Vyberte ze seznamu"
                                        items={trainers}
                                        isRequired={false}
                                        labelPlacement="outside"
                                        fullWidth={false}
                                    >
                                        {(trainerKV) => <SelectItem key={trainerKV.id}>{trainerKV.name}</SelectItem>}
                                    </Select>


                                    <Button color="primary" type="submit" className="self-end w-80" isLoading={isLoading}>
                                        Přidat  termín
                                    </Button>
                                </Form>
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
