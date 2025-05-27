import React, { useEffect, useState } from "react";

interface AsyncTaskProps<T> {
    task: () => Promise<T>;
    resolve?: (result: T) => React.ReactElement;
    reject?: (error: any) => React.ReactElement;
    meanwhile?: React.ReactElement;
}

function AsyncTask<T>({
    task,
    resolve,
    reject,
    meanwhile,
}: AsyncTaskProps<T>) {
    const [state, setState] = useState<"pending" | "resolved" | "rejected">("pending");
    const [result, setResult] = useState<T | null>(null);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        task()
            .then((res) => {
                setResult(res);
                setState("resolved");
            })
            .catch((err) => {
                setError(err);
                setState("rejected");
            });
    }, [task]);

    if (state === "pending") {
        return meanwhile || null;
    }

    if (state === "resolved" && resolve && result !== null) {
        return resolve(result);
    }

    if (state === "rejected" && reject) {
        return reject(error);
    }

    return null;
}

export default AsyncTask;
