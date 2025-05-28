import corpus from "../2_final/corpus.json";

console.debug("Comedies in Italy with Female Supporting Roles");

const comedies = corpus.filter((item) => item?.genre?.includes("Comedy"));
console.debug("- Total number of comedies: ", comedies.length);

const comediesInItaly = comedies.filter((item) =>
  item.production.some((p) => p.country.includes("Italy"))
);
console.debug("- Total comedies in Italy: ", comediesInItaly.length);

const gender = "Female identifying";
const comediesInItalyWithFemale = comediesInItaly.filter(
  (item) =>
    item?.gender === gender ||
    item?.director?.some((d) => d?.gender === gender) ||
    item?.character?.some((c) => c?.person?.gender === gender)
);
console.debug(
  "- Total comedies in Italy with female gender: ",
  comediesInItalyWithFemale.length
);
for (const item of comediesInItalyWithFemale) {
  console.debug(item.slug, item.character);
}

const role = "Supporting actor";
const comediesInItalyWithFemaleSupportingRoles =
  comediesInItalyWithFemale.filter((item) =>
    item?.character?.some((c) => c?.role === role)
  );
console.debug(
  "- Total comedies in Italy with female supporting roles: ",
  comediesInItalyWithFemaleSupportingRoles.length
);
