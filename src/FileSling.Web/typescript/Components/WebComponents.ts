import { DirectoryListWebComponent } from "./DirectoryList.js";
import { FileListWebComponent } from "./FileList.js";
import { FileListHeaderWebComponent } from "./FileListHeader.js";
import { FileUploadWebComponent } from "./FileUpload.js";
import { CreateFolderWebComponent } from "./CreateFolder.js";

export default function registerComponents() {
    customElements.define("th11s-directory-list", DirectoryListWebComponent);
    customElements.define("th11s-file-list-header", FileListHeaderWebComponent);
    customElements.define("th11s-file-list", FileListWebComponent);
    customElements.define("th11s-file-upload", FileUploadWebComponent);
    customElements.define("th11s-create-folder", CreateFolderWebComponent);
}