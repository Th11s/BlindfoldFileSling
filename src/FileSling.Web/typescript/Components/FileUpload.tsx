import ReactDOM from 'react-dom/client';

interface FileUploadProps {
    directoryId: string;
}

function FileUpload({ directoryId }: FileUploadProps) {


    return (
        <div className="up"></div>
    );
}

export class FileUploadWebComponent extends HTMLElement {
    connectedCallback() {
        ReactDOM.createRoot(this).render(<FileUpload directoryId={this.getAttribute("directoryId") || ""} />);
    }
}