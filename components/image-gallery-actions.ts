"use server";

import { searchPersonInGallery } from "@/lib/gallery-api";

export async function filterByPerson(props: {
  galleryName: string;
  personName: string;
}) {
  return searchPersonInGallery({
    galleryName: props.galleryName,
    personName: props.personName,
  });
}
