"use client";
import {Avatar} from "@heroui/react";
import React, {useEffect, useState} from "react";

import {getTrainers} from "@/db/actions";
import {TrainerWithRelations} from "@/db/schema";

export default function TrainersForClass(props: {
    classTypeName: string;
    right?: boolean;
}) {
    const [trainers, setTrainers] = useState<TrainerWithRelations[]>([]);

    useEffect(() => {
        (async () => {
            const data = await getTrainers();
            // Filter trainers by class type name
            const filteredTrainers = data.filter((trainer) =>
                trainer.trainerClassTypes.some(
                    (tct) => tct.classType.name === props.classTypeName,
                ),
            );

            setTrainers(filteredTrainers);
        })();
    }, []);

    return (
        <div
            className="flex items-center gap-8 flex-wrap mt-4 h-10"
            style={{justifyContent: props.right ? "flex-end" : "flex-start"}}
        >
            {trainers.map((trainer) => (
                <div key={trainer.id}>
                    <Avatar
                        alt={trainer.name}
                        className="inline-flex me-2 hover:scale-125 transition-transform duration-200"
                        size="md"
                        src={trainer.profilePicture as any}
                    />
                    <span className="text-medium font-medium">{trainer.name}</span>
                </div>
            ))}
        </div>
    );
}
