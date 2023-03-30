// import something here
// import * as blockstack from "blockstack";
import { UserSession, AppConfig } from "@stacks/auth";
import { Storage } from "@stacks/storage";

const scopes = ["store_write", "publish_data", "email"];
// const appConfig = new AppConfig(scopes);

const appConfig = new AppConfig(scopes);

const userSession = new UserSession({ appConfig: appConfig });
const storage = new Storage({ userSession });
export default ({ router, store }) => {};

export { userSession, storage };
