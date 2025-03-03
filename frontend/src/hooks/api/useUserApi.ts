import { fetchData, patchItem, sendData, updateItem } from "@/API/api";
import { ISession } from "@/interfaces/ISession";
import { IUser } from "@/interfaces/User";
import { useUserStore } from "@/store/userStore";
import { ApiResponse } from "@/types/ApiTypes";

const USER_ENDPOINT = "users";

export const useUserApi = () => {
  const { setCurrentUser } = useUserStore();

  const getUserById = (id: string) => {
    return fetchData<ApiResponse<IUser>>(USER_ENDPOINT + `/one`, { userId: id }).then(
      (res) => res.data
    );
  };

  const updateUserField = <K extends keyof IUser>(
    userId: string,
    fieldName: K,
    value: IUser[K]
  ) => {
    return updateItem<ApiResponse<IUser>>(USER_ENDPOINT + `/one/field?userId=${userId}`, {
      fieldName,
      value,
    }).then((res) => setCurrentUser(res.data));
  };

  const checkEmailAccess = (email: string) => {
    return fetchData<ApiResponse<{ user: IUser; hasPassword: boolean }>>(
      USER_ENDPOINT + `/user/email`,
      { email }
    );
  };

  const registerUser = (email: string, password: string) =>
    updateItem<ApiResponse<IUser>>(USER_ENDPOINT + `/user/register`, {
      email,
      password,
    });

  const loginUser = (email: string, password: string) =>
    sendData<ApiResponse<ISession>>(USER_ENDPOINT + `/user/login`, { email, password });

  const checkUserSessionToken = (token: ISession) => {
    return sendData<ApiResponse<{ isValid: boolean; hasAccess: boolean }>>(
      USER_ENDPOINT + `/user/session`,
      {
        token,
      }
    ).then((res) => res.data);
  };

  return {
    checkUserSessionToken,
    getUserById,
    checkEmailAccess,
    registerUser,
    loginUser,
    updateUserField,
  };
};
