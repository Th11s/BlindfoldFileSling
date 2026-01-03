import { DirectoryListWebComponent } from "./Components/DirectoryList.js";
import { FileListWebComponent } from "./Components/FileList.js";
import { FileListHeaderWebComponent } from "./Components/FileListHeader.js";
import { FileUploadWebComponent } from "./Components/FileUpload.js";

export default function registerComponents() {
    customElements.define('th11s-directory-list', DirectoryListWebComponent);
    customElements.define('th11s-file-list-header', FileListHeaderWebComponent);
    customElements.define('th11s-file-list', FileListWebComponent);
    customElements.define('th11s-file-upload', FileUploadWebComponent);
}