export const FETCH_BEGIN= 'FETCH_BEGIN'
export const FETCH_END = 'FETCH_END'

export const fetch_begin_action = (fetchMsg='数据请求中...') => ({
  type:FETCH_BEGIN,
  fetchMsg
})
export const fetch_end_action = (fetchMsg='') => ({
  type:FETCH_END,
  fetchMsg
})
