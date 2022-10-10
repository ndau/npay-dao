import axios from "axios";

type methodType = "get" | "post" | "patch" | "delete" ; 

const baseURL= `http://192.168.1.21:3001/api/`
// const baseURL = `http://192.168.100.30:3001/api/`;
// const baseURL=`https://a3f5-2407-aa80-116-d2d9-70b1-9ced-c234-3fb6.ngrok.io/api/`

export const axiosRequest = async (method_:methodType, url_:string, body?: any, params_?: any) => {

  const URL =  baseURL + url_;
  const response = await axios({
    method: method_,
    url: URL,
    data: body,
    params:  params_,
  })  ;

  return response;
};

export {baseURL}