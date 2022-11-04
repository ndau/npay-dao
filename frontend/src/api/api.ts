import axios from 'axios';

type methodType = 'get' | 'post' | 'patch' | 'delete';

const baseURL = process.env.REACT_APP_SERVICE_ENDPOINT || "api";

export const axiosRequest = async (method: methodType, url: string, body?: any, params?: any) => {
  const response = await axios({
    method,
    url: `${baseURL}/${url}`,
    data: body,
    params,
  });

  return response;
};

export { baseURL };
