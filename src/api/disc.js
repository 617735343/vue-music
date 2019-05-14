import {commonParams} from './config';
import axios from 'axios';

export function getDisc(dissid) {
    const url = "/api/disc";

    const data = Object.assign({}, commonParams, {
        disstid: dissid,
        platform: 'yqq.json',
        g_tk: 5381,
        loginUin: 0,
        hostUin: 0,
        onlysong: 0,
        type: 1,
        json: 1,
        utf8: 1,
        notice: 0,
        needNewCode: 0,
        format: 'json'
    });

    return axios.get(url, {
        params: data
    }).then((res) => {
        return Promise.resolve(res.data);
    })
}

export function getVkeyUrl(songmid) {
    const url = "/api/discvkey";

    const data = Object.assign({}, commonParams, {
        g_tk: 5381,
        loginUin: 0,
        hostUin: 0,
        format: 'json',
        notice: 0,
        platform: 'yqq.json',
        needNewCode: 0,
        data: `{"req":{"module":"CDN.SrfCdnDispatchServer","method":"GetCdnDispatch","param":{"guid":"5533002050","calltype":0,"userip":""}},"req_0":{"module":"vkey.GetVkeyServer","method":"CgiGetVkey","param":{"guid":"5533002050","songmid":["${songmid}"],"songtype":[0],"uin":"0","loginflag":1,"platform":"20"}},"comm":{"uin":0,"format":"json","ct":24,"cv":0}}`
    })

    return axios.get(url, {
        params: data,
    }).then((res) => {
        return Promise.resolve(res.data);
    })
}