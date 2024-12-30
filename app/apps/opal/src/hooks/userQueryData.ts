import {
  QueryKey,
  QueryFunction,
  Enabled,
  useQuery,
} from "@tanstack/react-query";

export const userQueryData = (
  queryKey: QueryKey,
  queryFn: QueryFunction,
  enabled?: Enabled
) => {
  const { data, isPending, isFetched, refetch, isFetching } = useQuery({
    queryKey,
    queryFn,
    enabled,
  });

  return { data, isPending, isFetched, refetch, isFetching };
};
