import "server-only";

import { z } from "zod";

export const dynamic = "force-dynamic";

const errorSchema = z.object({
  errors: z.array(
    z.object({
      message: z.string(),
    })
  ),
});

async function getAllGalleryImages(props: {
  galleryName: string;
}): Promise<string[]> {
  const response = await fetch(
    `http://localhost:3001/face-recognition/album/${props.galleryName}/images`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const errorsRes = errorSchema.safeParse(await response.json());
    if (!errorsRes.success) throw new Error(errorsRes.error.message);
    throw new Error(
      errorsRes.data.errors.at(0)?.message ?? "Failed to fetch gallery images"
    );
  }

  const successSchema = z.object({
    images: z.array(z.string()),
  });

  const data = await response.json();
  const dataRes = successSchema.safeParse(data);
  if (!dataRes.success) throw new Error(dataRes.error.message);
  console.log(dataRes.data.images);
  return dataRes.data.images.map(
    (image) => `http://localhost:3001/face-recognition/image/${image}`
  );
}

async function searchPersonInGallery(props: {
  galleryName: string;
  personName: string;
}): Promise<string[]> {
  const response = await fetch(
    `http://localhost:3001/face-recognition/match/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        albumName: props.galleryName,
        facePath: props.personName,
      }),
    }
  );

  if (!response.ok) {
    const errorsRes = errorSchema.safeParse(await response.json());
    if (!errorsRes.success) throw new Error(errorsRes.error.message);
    throw new Error(
      errorsRes.data.errors.at(0)?.message ?? "Failed to fetch gallery images"
    );
  }

  const successSchema = z.object({
    matches: z.array(
      z.object({
        imagePath: z.string(),
      })
    ),
  });

  const data = await response.json();
  const dataRes = successSchema.safeParse(data);
  if (!dataRes.success) throw new Error(dataRes.error.message);
  return dataRes.data.matches.map(
    (image) => `http://localhost:3001/face-recognition/image/${image.imagePath}`
  );
}

export { getAllGalleryImages, searchPersonInGallery };
