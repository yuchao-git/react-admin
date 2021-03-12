import { combineReducers } from "redux";
import { FETCH_BEGIN, FETCH_END } from "./action";



// 请求的状态
export const require = (
  state = { fetchState: false, fetchMsg: "" },
  action
) => {
  // 这里暂不处理任何 action，
  // 仅返回传入的 state。
  switch (action.type) {
    case FETCH_BEGIN:
      return { ...state, fetchState: true, fetchMsg: action.fetchMsg };
    case FETCH_END:
      return { ...state, fetchState: false, fetchMsg: action.fetchMsg };
    default:
      return state;
  }
};

export default combineReducers({
  require
});
