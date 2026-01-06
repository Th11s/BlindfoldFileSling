import React from "react";
import ReactDOM from "react-dom/client";
import * as DirectoryService from "../DirectoryService";

interface FileUploadProps {
    directoryId: string;
}

function FileUpload({ directoryId }: FileUploadProps) {
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Handle file input change or drop
    const handleFiles = React.useCallback(async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        for (const file of Array.from(files)) {
            DirectoryService.createFileInDirectory(directoryId, file);
            // TODO: Add file to upload queue and show progress
        }
    }, [directoryId]);

    // Drag and drop handlers
    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        handleFiles(e.dataTransfer.files);
    };

    const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    // File input handler
    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFiles(e.target.files);
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    return (
        <div className="file-upload-container">
            <div
                onDrop={onDrop}
                onDragOver={onDragOver}
                style={{
                    border: "2px dashed #aaa",
                    padding: "1em",
                    textAlign: "center",
                    marginBottom: "1em",
                    cursor: "pointer"
                }}
                onClick={() => inputRef.current?.click()}
            >
                Drag & drop files here, or click to select
            </div>
            <input
                ref={inputRef}
                type="file"
                style={{ display: "none" }}
                multiple
                onChange={onInputChange}
            />
        </div>
    );
}

export class FileUploadWebComponent extends HTMLElement {
    connectedCallback() {
        const directoryId = this.getAttribute("directory-id");
        if (!directoryId) {
            console.error("directory-id was not present");
            return;
        }

        ReactDOM.createRoot(this).render(<FileUpload directoryId={directoryId} />);
    }
}