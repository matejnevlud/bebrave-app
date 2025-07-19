"use client";

import React, {useEffect, useState} from "react";
import {
    Avatar,
    Form,
    Modal,
    ModalContent,
    useDisclosure,
} from "@heroui/react";
import {SVGProps} from "react";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
} from "@heroui/react";
import {Button} from "@heroui/button";
import {ModalBody, ModalHeader} from "@heroui/modal";
import {Input} from "@heroui/input";

import {
    createTrainer,
    deleteTrainer,
    getTrainers,
    updateTrainer,
} from "@/db/actions";
import {Trainer, TrainerWithRelations} from "@/db/schema";

type IconSvgProps = SVGProps<SVGSVGElement> & {
    size?: number;
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

export default function TreneriPage() {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [trainers, setTrainers] = useState<TrainerWithRelations[]>([]);
    const [isFetchingData, setIsFetchingData] = useState<boolean>(true);

    async function fetchData() {
        const t = await getTrainers();

        console.log(t);
        setTrainers(t);
        setIsFetchingData(false);
    }

    useEffect(() => {
        fetchData();
    }, []);

    const [selectedTrainer, setSelectedTrainer] =
        useState<TrainerWithRelations>();
    const {isOpen, onOpen, onOpenChange} = useDisclosure();

    function openTrainerModal(trainer: TrainerWithRelations) {
        setSelectedTrainer(trainer);
        onOpen();
    }

    async function handleUpdateTrainer(e: React.FormEvent<HTMLFormElement>) {
        try {
            e.preventDefault();
            setIsLoading(true);
            let formData = new FormData(e.currentTarget);
            let data = Object.fromEntries(formData) as any;

            console.log(data);

            // Handle file upload if a new file is provided
            let profilePicture = data.profilePicture as string; // URL input value

            if (data.file && data.file instanceof File) {
                const file = data.file;

                // get filetype
                const fileType = file.type.split("/")[1]; // e.g. 'png', 'jpg', etc.
                // create random file name
                const randomFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileType}`;

                const filePath = `/uploads/${randomFileName}`;
                // Here you would typically call an API to upload the file
                // For example, using fetch or axios to send the file to your server
                const fileFormData = new FormData();

                fileFormData.append("file", file);
                const response = await fetch(`/uploads/${randomFileName}`, {
                    method: "POST",
                    body: fileFormData,
                });

                if (!response.ok) {
                    console.error("Failed to upload file:", response.statusText);
                    alert("Failed to upload image. Please try again.");

                    return;
                }
                const responseData = await response.json();

                console.log("File uploaded to:", responseData);

                console.log("File uploaded to:", filePath);
                profilePicture = filePath; // Use uploaded file path
            }

            const updatedTrainer: Partial<Trainer> = {
                name: data.name as string,
                email: data.email as string,
                bio: data.bio as string,
                expertise: data.expertise as string,
                profilePicture: profilePicture,
            };

            console.log(updatedTrainer);

            const fetched = await updateTrainer(selectedTrainer?.id, updatedTrainer);

            console.log("Updated trainer:", fetched);

            setTrainers((prevTrainers) =>
                prevTrainers.map((t) => (t.id === selectedTrainer?.id ? fetched : t)),
            );
        } catch (error) {
            console.error("Error updating trainer:", error);
            alert("Failed to update trainer. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    }

    async function createNewTrainer(e: React.FormEvent<HTMLFormElement>) {
        try {
            e.preventDefault();
            setIsLoading(true);
            let formData = new FormData(e.currentTarget);
            let data = Object.fromEntries(formData) as any;

            console.log(data);

            // First upload the file if it exists
            if (data.file && data.file instanceof File) {
                const file = data.file;

                // get filetype
                const fileType = file.type.split("/")[1]; // e.g. 'png', 'jpg', etc.
                // create random file name
                const randomFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileType}`;

                const filePath = `/uploads/${randomFileName}`;
                // Here you would typically call an API to upload the file
                // For example, using fetch or axios to send the file to your server
                const fileFormData = new FormData();

                fileFormData.append("file", file);
                const response = await fetch(`/uploads/${randomFileName}`, {
                    method: "POST",
                    body: fileFormData,
                });

                if (!response.ok) {
                    console.error("Failed to upload file:", response.statusText);

                    return;
                }
                const responseData = await response.json();

                console.log("File uploaded to:", responseData);

                console.log("File uploaded to:", filePath);
                data.profilePicture = filePath; // Assuming the server returns the path to the uploaded image
            } else {
                console.error("No file provided");

                return;
            }

            const newTrainer: Partial<Trainer> = {
                name: data.name as string,
                email: data.email as string,
                bio: data.bio as string,
                expertise: data.expertise as string,
                profilePicture: data.profilePicture as string,
            };

            console.log(newTrainer);

            const fetchedTrainer = await createTrainer(newTrainer);

            console.log("New trainer created:", fetchedTrainer);

            setTrainers((prevTrainers) => [...prevTrainers, fetchedTrainer]);
        } catch (error) {
            console.error("Error creating trainer:", error);
            alert("Failed to create trainer. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    }

    async function handleDeleteTrainer(id: number) {
        console.log("Deleting trainer with id:", id);
        setTrainers((prevTrainers) => prevTrainers.filter((t) => t.id !== id));
        try {
            setIsLoading(true);
            await deleteTrainer(id);
        } catch (error) {
            console.error("Error deleting trainer:", error);
            alert("Failed to delete trainer. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div>
            <Table removeWrapper aria-label="Trainers table" rowHeight={80}>
                <TableHeader>
                    <TableColumn>JMÉNO TRENÉRA</TableColumn>
                    <TableColumn>EMAIL</TableColumn>
                    <TableColumn>SPECIALIZACE</TableColumn>
                    <TableColumn align="end"> </TableColumn>
                </TableHeader>
                <TableBody emptyContent={"Žádní trenéri k zobrazení"} items={trainers}>
                    {(item) => (
                        <TableRow
                            key={item.id}
                            className="h-[4.5rem] hover:bg-default-100 cursor-pointer"
                            onClick={() => openTrainerModal(item)}
                        >
                            <TableCell>
                                <Avatar
                                    alt={item?.name}
                                    className="inline-flex me-2 hover:scale-125 transition-transform duration-200"
                                    size="md"
                                    src={item.profilePicture as any}
                                />
                                <b>{item.name}</b>
                            </TableCell>

                            <TableCell>{item.email}</TableCell>

                            <TableCell>
                                <b>{item.expertise}</b>
                            </TableCell>

                            <TableCell>
                                <Button color="primary" isLoading={isLoading} size="md">
                                    Detail
                                </Button>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            <div>
                <h4 className="text-lg font-semibold mt-4 mb-4">
                    Vytvořit nového trenéra
                </h4>
                <Form
                    className="w-full max-w grid grid-cols-1 md:grid-cols-2 gap-4 pb-20"
                    onSubmit={createNewTrainer}
                >
                    <Input
                        isRequired
                        label="Jméno trenéra"
                        labelPlacement="outside"
                        name="name"
                        placeholder="Zadejte jméno trenéra"
                    />

                    <Input
                        isRequired
                        label="Email trenéra"
                        labelPlacement="outside"
                        name="email"
                        placeholder="Zadejte email trenéra"
                        type="email"
                    />

                    <Input
                        label="Biografie trenéra"
                        labelPlacement="outside"
                        maxLength={500}
                        name="bio"
                        placeholder="Zadejte biografi trenéra"
                    />

                    <Input
                        label="Specializace trenéra"
                        labelPlacement="outside"
                        maxLength={255}
                        name="expertise"
                        placeholder="Zadejte specializaci trenéra"
                    />

                    <Input
                        isRequired
                        accept="image/*"
                        label="Profilový obrázek trenéra"
                        labelPlacement="outside"
                        name="file"
                        placeholder="Vyberte obrázek trenéra"
                        type="file"
                    />

                    <Button
                        className=""
                        color="success"
                        isLoading={isLoading}
                        type="submit"
                    >
                        Vytvořit trenéra
                    </Button>
                </Form>
            </div>

            <Modal
                isOpen={isOpen}
                scrollBehavior="inside"
                size="3xl"
                onOpenChange={onOpenChange}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                Detail {selectedTrainer?.name}
                            </ModalHeader>
                            <ModalBody>
                                <Form
                                    className="w-full max-w grid grid-cols-1 md:grid-cols-2 gap-4"
                                    onSubmit={handleUpdateTrainer}
                                >
                                    <Input
                                        isRequired
                                        defaultValue={selectedTrainer?.name}
                                        label="Jméno trenéra"
                                        labelPlacement="outside"
                                        name="name"
                                        placeholder="Zadejte jméno trenéra"
                                    />

                                    <Input
                                        isRequired
                                        defaultValue={selectedTrainer?.email}
                                        label="Email trenéra"
                                        labelPlacement="outside"
                                        name="email"
                                        placeholder="Zadejte email trenéra"
                                        type="email"
                                    />

                                    <Input
                                        defaultValue={selectedTrainer?.bio}
                                        label="Biografie trenéra"
                                        labelPlacement="outside"
                                        maxLength={500}
                                        name="bio"
                                        placeholder="Zadejte biografi trenéra"
                                    />

                                    <Input
                                        defaultValue={selectedTrainer?.expertise}
                                        label="Specializace trenéra"
                                        labelPlacement="outside"
                                        maxLength={255}
                                        name="expertise"
                                        placeholder="Zadejte specializaci trenéra"
                                    />

                                    <Input
                                        defaultValue={selectedTrainer?.profilePicture}
                                        label="URL profilového obrázku"
                                        labelPlacement="outside"
                                        name="profilePicture"
                                        placeholder="Zadejte URL obrázku"
                                        type="url"
                                    />

                                    <Input
                                        accept="image/*"
                                        label="Nový profilový obrázek (volitelné)"
                                        labelPlacement="outside"
                                        name="file"
                                        placeholder="Vyberte nový obrázek trenéra"
                                        type="file"
                                    />

                                    <div className="col-span-full flex gap-4">
                                        <Button
                                            className="flex-1"
                                            color="primary"
                                            isLoading={isLoading}
                                            type="submit"
                                        >
                                            Uložit detail
                                        </Button>
                                        <Button
                                            className="flex-1"
                                            color="danger"
                                            isLoading={isLoading}
                                            variant="bordered"
                                            onClick={() => {
                                                if (
                                                    selectedTrainer &&
                                                    confirm(
                                                        `Opravdu chcete smazat trenéra ${selectedTrainer.name}?`,
                                                    )
                                                ) {
                                                    handleDeleteTrainer(selectedTrainer.id);
                                                    onClose();
                                                }
                                            }}
                                        >
                                            Smazat trenéra
                                        </Button>
                                    </div>
                                </Form>

                                <h4 className="text-lg font-semibold mt-8 mb-0">
                                    Přiřazené lekce
                                </h4>

                                <Table
                                    removeWrapper
                                    aria-label="Trainer classes table"
                                    className="mt-2"
                                    rowHeight={60}
                                >
                                    <TableHeader>
                                        <TableColumn>Datum lekce</TableColumn>
                                        <TableColumn>Typ lekce</TableColumn>
                                        <TableColumn>Role</TableColumn>
                                        <TableColumn>Rezervace</TableColumn>
                                    </TableHeader>
                                    <TableBody
                                        emptyContent={"Žádné lekce k zobrazení"}
                                        items={selectedTrainer?.classes || []}
                                    >
                                        {(item) => (
                                            <TableRow key={item.id} className="hover:bg-default-100">
                                                <TableCell className="flex-col flex gap-2">
                          <span className="font-medium text-medium">
                            {new Date(item?.date ?? 0).toLocaleDateString(
                                "cs-CZ",
                                {weekday: "long"},
                            )}{" "}
                              {new Date(item?.date ?? 0).toLocaleDateString()}{" "}
                              {item.time}
                          </span>
                                                </TableCell>

                                                <TableCell>
                          <span className="text-medium">
                            {item.classType?.name}
                          </span>
                                                </TableCell>

                                                <TableCell>
                          <span className="text-medium">
                            {item.trainerId === selectedTrainer?.id
                                ? "Hlavní trenér"
                                : "Druhý trenér"}
                          </span>
                                                </TableCell>

                                                <TableCell>
                          <span className="text-medium">
                            {item.reservations?.length || 0} / {item.capacity}
                          </span>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
