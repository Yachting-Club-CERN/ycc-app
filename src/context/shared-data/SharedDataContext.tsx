import { createContext } from "react";

import { LicenceDetailedInfos, MemberPublicInfos } from "@/model/dtos";
import { HelperTaskCategories } from "@/model/helpers-dtos";
import client from "@/utils/client";

class SharedData {
  private _helperTaskCategories?: HelperTaskCategories;
  private _licenceInfos?: LicenceDetailedInfos;
  private _members: { [year: number]: MemberPublicInfos } = {};

  readonly getHelperTaskCategories = async (signal?: AbortSignal) => {
    if (this._helperTaskCategories === undefined) {
      console.debug("[shared-data] Loading helper task categories");
      this._helperTaskCategories =
        await client.helpers.getTaskCategories(signal);
      console.debug(
        "[shared-data] Loaded",
        this._helperTaskCategories.length,
        "helper task categories",
      );
    } else {
      console.debug("[shared-data] Helper task categories already loaded");
    }

    return this._helperTaskCategories;
  };

  readonly getLicenceInfos = async (signal?: AbortSignal) => {
    if (this._licenceInfos === undefined) {
      console.debug("[shared-data] Loading licence infos");
      this._licenceInfos = await client.licenceInfos.getAll(signal);
      console.debug(
        "[shared-data] Loaded",
        this._licenceInfos.length,
        "licence infos",
      );
    } else {
      console.debug("[shared-data] Licence infos already loaded");
    }

    return this._licenceInfos;
  };

  readonly getMembers = async (year: number, signal?: AbortSignal) => {
    if (this._members[year] === undefined) {
      console.debug(`[shared-data] Loading members for ${year}`);
      this._members[year] = await client.members.getAll(year, signal);
      console.debug(
        "[shared-data] Loaded",
        this._members[year].length,
        "members for",
        year,
      );
    } else {
      console.debug("[shared-data] Members already loaded");
    }

    return this._members[year];
  };
}

const sharedData = new SharedData();

const SharedDataContext = createContext<SharedData>(sharedData);
export default SharedDataContext;
