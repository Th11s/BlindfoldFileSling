import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";

import * as DirectoryService from "../DirectoryService";

export function CreateFolder({
    onCreated
}: {
    onCreated?: (folderName: string) => void;
}) {
    const [folderName, setFolderName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);

        const effectiveFolderName = folderName.trim();
        if (!effectiveFolderName) {
            setError("Folder name is required.");
            return;
        }
        setLoading(true);
        try {
            await DirectoryService.createDirectory(effectiveFolderName);

            setFolderName("");
            if (inputRef.current) inputRef.current.value = "";
            if (onCreated) onCreated(folderName);
        } catch (e: any) {
            setError(e.message || "Unknown error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form id="create-directory-form" ref={formRef} onSubmit={handleSubmit} autoComplete="off">
            <input
                type="text"
                name="directoryName"
                placeholder="Folder name"
                required
                ref={inputRef}
                value={folderName}
                onChange={e => setFolderName(e.target.value)}
                disabled={loading}
            />
            <button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Folder"}
            </button>
            {error && <div style={{ color: "red" }}>{error}</div>}
        </form>
    );
}

export class CreateFolderWebComponent extends HTMLElement {
    connectedCallback() {
        ReactDOM.createRoot(this).render(<CreateFolder />);
    }
}