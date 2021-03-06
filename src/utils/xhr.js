import axios from './axios';
import { Toast, } from 'antd-mobile';
import Qs from 'qs';
import myFun from '../assets/js/myFun';

// 创建axios实例,用于请求接口
// xhr,即为XMLHttpRequest请求对象
const Xhr = axios.create({
  timeout: 50000,
});

// request拦截器
Xhr.interceptors.request.use(
  (config) => {
    config.headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';

    // 请求时间
    const t = myFun.getMillisecond();

    if (typeof config.params === 'object') {
      config.params['client_id'] = process.env.REACT_APP_GITHUB_CID;
    } else {
      config.params = {
        client_id: process.env.REACT_APP_GITHUB_CID,
      };
    }

    if (typeof config.params === 'object') {
      config.params['client_secret'] = process.env.REACT_APP_GITHUB_SEC;
    } else {
      config.params = {
        client_secret: process.env.REACT_APP_GITHUB_SEC,
      };
    }
    if (typeof config.params === 'object') {
      config.params['client_time'] = t;
    } else {
      config.params = {
        client_time: t,
      };
    }

    // 在请求之前对请求数据进行操作
    config.transformRequest = [
      (data) => {
        // data类型:string , Buffer, ArrayBuffer, FormData or Stream
        if (data instanceof FormData) {
          return data;
        }

        data = Qs.stringify(data);
        return data;
      },
    ];

    return config;
  },
  (error) => {
    Toast.fail('请求错误!', 1);
    if (process.env.NODE_ENV === 'development') {
      console.log('Xhr request error', error);
    }

    return Promise.reject(error);
  }
);

// respone拦截器
Xhr.interceptors.response.use(
  (response) => {
    // 通过状态码来识别服务器提示信息
    if (process.env.NODE_ENV === 'development') {
      console.log('Xhr response:', response);
    }

    // 判断状态码

    switch (response.status) {
    case 200: // 正常

      break;
    case 404:
      Toast.info('404错误!', 1);
      break;
    case 500:
      Toast.fail('接口错误!', 1);
      break;
    case 504:
      Toast.offline('网络超时!', 1);
      break;
    default:
      Toast.offline('未知错误!', 1);
      break;
    }
    // 返回响应数据
    return response.data;
    //     return response.data.status ? response.data : false;
  },
  (error) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Xhr response error', error);
    }

    // 非状态码错误  在此通过正则处理
    if ((/Network Error/i).test(error)) {
      Toast.offline('您当前无法上网，请检查你的移动数据开关或wifi是否正常!', 1);
    } else if ((/timeout/i).test(error)) {
      Toast.fail('请求超时，请稍后重试', 1);
    } else if ((/ms exceeded/i).test(error)) {
      Toast.offline('您的网络连接不稳定，请检查你的移动数据开关或wifi是否正常!', 1);
    } else if ((/code 500/i).test(error)) {
      Toast.offline('网络异常，请稍后重试!', 1);
    } else {
      Toast.offline('网络错误!', 1);
    }

    return Promise.reject(error);
  }
);

export default Xhr;

