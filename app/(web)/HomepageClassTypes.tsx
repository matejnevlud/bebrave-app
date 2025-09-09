"use client";
import { Image as HeroImage } from "@heroui/image";
import React, { useEffect, useState } from "react";

import { getHomepageClassTypes } from "@/db/actions";
import { ClassTypeWithRelations } from "@/db/schema";
import TrainersForClass from "@/app/(web)/TrainersForClass";

export default function HomepageClassTypes() {
  const [classTypes, setClassTypes] = useState<ClassTypeWithRelations[]>([]);

  useEffect(() => {
    (async () => {
      const data = await getHomepageClassTypes();

      setClassTypes(data);
    })();
  }, []);

  return (
    <>
      {classTypes.map((classType, index) => (
        <div
          key={classType.id}
          className={`flex flex-col md:flex-row gap-8 mt-20 overflow-visible ${index % 2 === 1 ? "md:flex-row-reverse" : ""}`}
        >
          <div className="flex-[1] block overflow-visible">
            <HeroImage
              isBlurred
              alt={`${classType.name} class image`}
              className="rounded-md hover:scale-[1.02] transition-transform duration-300"
              height={"30em"}
              src={
                classType.image ||
                "https://imagedelivery.net/eo8aTqb-9sQsvXZHFngPsQ/6d2f366d-4444-43c2-09cd-56ce13324c00/public"
              }
              style={{ objectFit: "cover", objectPosition: "50% 50%" }}
              width={"100%"}
            />
          </div>
          <div
            className={`leading-7 flex-1 content-start ${index % 2 === 1 ? "text-right" : ""}`}
          >
            <h1 className="font-sans font-bold text-2xl sm:text-4xl">
              {classType.name}
            </h1>
            <TrainersForClass
              classTypeName={classType.name}
              right={index % 2 === 1}
            />
            <p className="mt-4">
              {classType.homepageText || classType.description}
            </p>
          </div>
        </div>
      ))}
    </>
  );
}
