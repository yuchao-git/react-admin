import { Modal } from "antd";
import store from "../store";
import { fetch_begin_action, fetch_end_action } from "../store/action";
import {GETREQUIREHEADER} from '../common/auth';
const qs = require("qs");
class $http {
  isError = false
  fetchData(url, params = {}, config = {}, type = "POST") {
    return fetch(url, {
      body: JSON.stringify(params), // must match 'Content-Type' header
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      headers: {
        "Content-Type": "application/json",
        ...GETREQUIREHEADER()
      },
      method: type, // *GET, POST, PUT, DELETE, etc.
      credentials: "include", //携带cookie
      mode: "cors", // no-cors, cors, *same-origin
      redirect: "follow", // manual, *follow, error
      referrer: "no-referrer", // *client, no-referrer
      ...config
    });
  }
  //处理返回数据
  static resolveData(data, url) {
    store.dispatch(fetch_end_action());
    if (data.st == 0) {
      return data;
    }else if(!this.isError){
      $http.fetchErr(`${data.msg}`);
    }
  }
  //加遮罩
  requireData(url, params, config, type = "POST") {
    store.dispatch(fetch_begin_action());
    
    return this.fetchData(url, params, config, type)
      .then(res => {
        if (res.status === 200) {
          return res.json();
        }
        return { st: -1, msg: `服务器响应错误,${res.status}` };
      })
      .catch(err => {
        return { st: -1, msg: `服务器响应错误`};
      })
      .then(res => {
        return $http.resolveData(res, url);
      });
  }
  //文件類型的請求
  fileData(url, params = {}, config = {}, type) {
    store.dispatch(fetch_begin_action());
    return this.fetchData(url, params, (config = {}), type).then(res => {
      store.dispatch(fetch_end_action());
      return res.blob();
    });
  }
  getData(url, params = {}, config = {}) {
    return this.requireData(url, params, config, "GET");
  }
  postData(url, params = {}, config = {}) {
    return this.requireData(url, params, config, "POST");
  }
  postFormData(url, params = {}, config = {}) {
    return this.requireData(
      url,
      params,
      {
        body: qs.stringify(params),
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      },
      "POST"
    );
  }

  //多个请求加一个遮罩
  async moreRequireData(...rest) {
    //这里应该实现同时多个异步请求,但是只有一个遮罩层
  }
  static fetchErr(msg) {
    this.isError = true;
    Modal.error({
      title: "出错了",
      content: msg,
      onOk:()=>{
        this.isError = false;
      }
    });
    throw "请求错误";
  }
}
export default new $http();
