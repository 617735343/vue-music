import Vue from 'vue';
import Vuex from 'vuex';
import * as actions from './actions';
import * as getters from './getters';
import state from './state';
import mutations from './mutations';
import createLogger from 'vuex/dist/logger';

Vue.use(Vuex);

//如果说我们调run dev NODE_ENV这个函数就是一个dev的环境，如果调run build 的时候 NODE_ENV这个函数就是production
//所以在线下调试的时候，这个debug就是为true
const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
    actions,
    getters,
    state,
    mutations,
    //我们在线下的调试的时候就要开启对vuex的严格模式，这个严格模式会检测你的state的修改，是不是通过mutations来修改，不是的话他会报警告，当然开启这个检测会有一定的性能消耗，所以在线下开启，不会在线上开启
    strict: debug,
    //createLogger会打印一些修改state前的数据和修改state后的数据
    plugins: debug? [createLogger()] : []
})