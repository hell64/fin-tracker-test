import {
  createSearchParamsCache,
  parseAsString,
  parseAsInteger,
} from "nuqs/server";

// Describe your search params, and reuse this in useQueryStates / createSerializer:
export const transactionSearchParamsCache = createSearchParamsCache({
  category: parseAsString.withDefault("all"),
  date: parseAsString.withDefault(""),
  type: parseAsString.withDefault("all"),
  page: parseAsInteger.withDefault(1),
});

// export const loadSearchParams = createLoader(transactionSearchParamsCache);
