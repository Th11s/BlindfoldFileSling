import { DirectoryBrowser } from "./Components/DirectoryBrowser.js";
import { DirectoryListing } from "./Components/DirectoryListing.js";
import { DirectoryHeader } from "./Components/DirectoryHeader.js";
import { ActivityIndicator } from "./Components/ActivityIndicator.js";

export default function registerComponents() {
    customElements.define('th11s-activity-indicator', ActivityIndicator);
    customElements.define('th11s-directory-browser', DirectoryBrowser);
    customElements.define('th11s-directory-header', DirectoryHeader);
    customElements.define('th11s-directory-listing', DirectoryListing);
}