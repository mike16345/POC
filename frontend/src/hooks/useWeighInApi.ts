import { fetchData, sendData, deleteItem, updateItem } from "@/API/api";
import { IWeighIn, IWeighInPost, IWeighInResponse } from "@/interfaces/User";
import { ApiResponse } from "@/types/ApiTypes";

const WEIGH_INS_ENDPOINT = "weighIns/weights/";

export const useWeighInApi = () => {
  const addWeighIn = (id: string, data: IWeighInPost) =>
    sendData<IWeighInResponse>(WEIGH_INS_ENDPOINT, data, { id });

  const updateWeighInById = (id: string, data: IWeighInPost) =>
    updateItem<IWeighIn>(`${WEIGH_INS_ENDPOINT}one`, data, { id });

  const deleteWeighIn = (userID: string) => deleteItem(WEIGH_INS_ENDPOINT, { id: userID });

  const deleteWeighInByUserId = (userID: string) =>
    deleteItem(WEIGH_INS_ENDPOINT + "user", { id: userID });

  const getWeighInsById = (id: string) =>
    fetchData<ApiResponse<IWeighIn[]>>(WEIGH_INS_ENDPOINT, { id }).then((res) => res.data);

  const getWeighInsByUserId = (userID: string) =>
    fetchData<ApiResponse<IWeighIn[]>>(`${WEIGH_INS_ENDPOINT}user?id=${userID}`, {
      id: userID,
    }).then((res) => res.data);

  const deleteWeighIns = (userID: string) =>
    deleteItem<IWeighInResponse>(WEIGH_INS_ENDPOINT, userID);

  return {
    addWeighIn,
    getWeighInsById,
    updateWeighInById,
    deleteWeighIn,
    deleteWeighInByUserId,
    getWeighInsByUserId,
    deleteWeighIns,
  };
};
