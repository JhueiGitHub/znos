// /root/app/apps/opal/api/workspace.ts
export const getWorkSpaces = async () => {
  // For now, return mock data that matches the expected structure
  return {
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
};

export const getNotifications = async () => {
  return {
    status: 200,
    data: {
      _count: {
        notification: 0,
      },
    },
  };
};
