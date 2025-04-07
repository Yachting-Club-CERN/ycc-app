import { createContext } from "react";

import { LicenceDetailedInfo, MemberPublicInfo } from "@/model/dtos";
import { HelperTaskCategory } from "@/model/helpers-dtos";
import client from "@/utils/client";

class SharedData {
  private _helperTaskCategories?: HelperTaskCategory[];
  private _licenceInfos?: LicenceDetailedInfo[];
  private _members: { [year: number]: MemberPublicInfo[] } = {};

  public readonly getHelperTaskCategories = async (
    signal?: AbortSignal,
  ): Promise<Readonly<HelperTaskCategory[]>> => {
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

  public readonly getLicenceInfos = async (
    signal?: AbortSignal,
  ): Promise<Readonly<LicenceDetailedInfo[]>> => {
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

  public readonly getMembers = async (
    year: number,
    signal?: AbortSignal,
  ): Promise<Readonly<MemberPublicInfo[]>> => {
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

export { sharedData };
export default SharedDataContext;
