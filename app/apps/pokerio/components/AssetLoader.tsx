import React, { useState, useEffect } from "react";
import { loadedAssets, loadedURLS, loadMeshes } from "../scripts/assetLoader";

interface AssetLoaderProps {
    assets: loadedURLS;
    resolve: (data: loadedAssets) => React.ReactElement;
}

const AssetLoader: React.FC<AssetLoaderProps> = ({ assets, resolve }) => {
    const [progress, setProgress] = useState(0);
    const [loadedAssets, setLoadedAssets] = useState<loadedAssets | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadMeshes(assets, setProgress)
            .then((data) => {
                setLoadedAssets(data);
            })
            .catch((err) => {
                setError(err.toString());
            });
    }, [assets]);

    if (error) {
        return (
            <article className="progress">
                <main>
                    <p>Error loading assets: {error}</p>
                </main>
            </article>
        );
    }

    if (loadedAssets) {
        return resolve(loadedAssets);
    }

    return (
        <article className="progress">
            <main>
                <h3>POKER</h3>
                <p>Loading Assets</p>
                <progress max={1} value={progress}></progress>
            </main>
        </article>
    );
};

export default AssetLoader;
