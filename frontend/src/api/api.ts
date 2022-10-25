import axios from "axios";

type methodType = "get" | "post" | "patch" | "delete";

const baseURL = process.env.REACT_APP_SERVICE_ENDPOINT || "api/";

export const axiosRequest = async (
  method_: methodType,
  url_: string,
  body?: any,
  params_?: any
) => {
  const URL = baseURL + url_;
  const response = await axios({
    method: method_,
    url: URL,
    data: body,
    params: params_,
  });

  return response;
};

export { baseURL };
