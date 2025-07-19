"use client";
import {Card, CardHeader, Image} from "@heroui/react";
import React, {useEffect, useState} from "react";

import {getTrainers} from "@/db/actions";
import {TrainerWithRelations} from "@/db/schema";

export default function Lectors() {
    const [trainers, setTrainers] = useState<TrainerWithRelations[]>([]);

    useEffect(() => {
        (async () => {
            const data = await getTrainers();

            setTrainers(data);
        })();
    }, []);

    return (
        <div className=" gap-8 grid grid-cols-12 grid-rows-2 px-0">
            {trainers.map((trainer) => (
                <Card
                    key={trainer.id}
                    className="col-span-12 sm:col-span-4 h-[500px] hover:scale-[1.02] transition-transform duration-300 relative"
                >
                    <CardHeader className="absolute z-10 top-1 bottom-0 flex-col items-start justify-between">
                        <p
                            className="text-medium text-white/80 uppercase font-bold"
                            style={{textShadow: "2px 2px 8px rgba(0, 0, 0, 0.2)"}}
                        >
                            {trainer.trainerClassTypes
                                .map((tct) => tct.classType.name)
                                .join(", ")}
                        </p>
                        <h4
                            className="text-white/100 font-medium text-5xl text-shadow-lg"
                            style={{textShadow: "2px 2px 8px rgba(0, 0, 0, 0.2)"}}
                        >
                            {trainer.name}
                        </h4>
                    </CardHeader>
                    <Image
                        removeWrapper
                        className="z-0 w-full h-full object-cover "
                        src={trainer.profilePicture || "/loga/bebrave_black.png"}
                    />
                </Card>
            ))}
        </div>
    );
}
