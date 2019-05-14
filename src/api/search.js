import axios from 'axios';
import commonParams from './config';

export function getHotSearch() {
    const url = "/api/hotSearch";

    const data = Object.assign({}, commonParams, {
        g_tk: 5381,
        uin: 0,
        format: 'json',
        inCharset: 'utf-8',
        outCharset: 'utf-8',
        notice: 0,
        platform: 'h5',
        needNewCode: 1
    })

    return axios.get(url, {
        params: data
    }).then((res) => {
        return Promise.resolve(res.data);
    })
}

export function search(query, page, zhida, perpage) {
    const url = '/api/search';

    const data = Object.assign({}, commonParams, {
        w: query,
        p: page,
        catZhida: zhida ? 1 : 0,
        zhidaqu: 1,
        t: 0,
        flag: 1,
        ie: 'utf-8',
        sem: 1,
        aggr: 0,
        perpage: perpage,
        n: perpage,
        remoteplace: 'txt.mqq.all',
        g_tk: 5381,
        uin: 0,
        format: 'json',
        notice: 0,
        platform: 'h5',
        needNewCode: 1
    });

    return axios.get(url, {
        params: data
    }).then((res) => {
        return Promise.resolve(res.data);
    })
}