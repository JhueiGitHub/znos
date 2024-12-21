// /root/app/apps/opal/hooks/useQueryData.ts
import { QueryFunction, QueryKey, useQuery } from "@tanstack/react-query";

const defaultWorkspaceData = {
  status: 200,
  data: {
    subscription: {
      plan: "PRO",
    },
    workspace: [
      {
        id: "default",
        name: "Personal Workspace",
        type: "PERSONAL",
      },
    ],
    members: [],
  },
};

const defaultNotificationData = {
  status: 200,
  data: {
    _count: {
      notification: 0,
    },
  },
};

export const useQueryData = (
  queryKey: QueryKey,
  queryFn: QueryFunction,
  enabled?: boolean
) => {
  const { data, isPending, isFetched, refetch, isFetching } = useQuery({
    queryKey,
    queryFn,
    initialData:
      queryKey[0] === "user-workspaces"
        ? defaultWorkspaceData
        : queryKey[0] === "user-notifications"
          ? defaultNotificationData
          : undefined,
    enabled,
  });

  return { data, isPending, isFetched, refetch, isFetching };
};
