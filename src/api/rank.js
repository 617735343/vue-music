import axios from 'axios';
import commonParams from './config';
export function getRank() {
    const url = "/api/rank";

    const data = Object.assign({},commonParams,{
        g_tk: 5381,
        uin: 0,
        format: 'json',
        notice: 0,
        platform: 'h5',
        needNewCode: 1
    })

    return axios.get(url, {
        params: data
    }).then((res) => {
        return Promise.resolve(res.data)
    })
}


export function getRankDetail(id, weekOfYear) {
    const url = "/api/rankDetail";

    const data = Object.assign({},commonParams,{
        g_tk: 5381,
        loginUin: 0,
        hostUin: 0,
        format: 'json',
        notice: 0,
        platform: 'yqq.json',
        inCharset: 'utf8',
        outCharset: 'utf-8',
        needNewCode: 0,
        data: `{"detail":{"module":"musicToplist.ToplistInfoServer","method":"GetDetail","param":{"topId":${id},"offset":0,"num":20,"period":"${weekOfYear}"}},"comm":{"ct":24,"cv":0}}`
    });

    return axios.get(url, {
        params: data
    }).then((res) => {
        return Promise.resolve(res.data);
    })
}

