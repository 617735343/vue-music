//操作localstorage相关的方法
import storage from 'good-storage';

//搜索历史的key
const SEARCH_KEY = '_search_';
const SEARCH_MAX_LENGTH = 15;//最大的存储个数

//插入数值的逻辑函数，搜索的数组永远插入到第一条
function insertArray(arr, val, compare, maxLen) {
    //查询数组是否有这个元素，有的话返回当前的索引;
    const index = arr.findIndex(compare);
    //如果查询到的索引是第一条，直接return
    if(index === 0) {
        return;
    } 
    //如果数组中有这条数据，并且这条数据不在第一位
    if(index > 0) {
        arr.splice(index, 1);//把数据筛选掉并且删除
    }
    arr.unshift(val);//把数据插到数组的第一位
    //如果数组的长度大于限制的长度
    if(maxLen && arr.length > maxLen) {
        arr.pop();//把数组中的最后一个元素给删除出来
    }
}
export function saveSearch(query) {
    //如果没有数据的时候，定义是一个空数组
    let searches = storage.get(SEARCH_KEY, []);
    insertArray(searches,query, (item) => {
        return item === query
    },SEARCH_MAX_LENGTH);
    //把存储的数组设置到storage中
    storage.set(SEARCH_KEY, searches);
    return searches;
}

//从本地缓存拿到我们的searchHistory
export function loadSearch() {
    return storage.get(SEARCH_KEY, []);
}

//删除方法
function deleteFromArray(arr, compare) {
    const index = arr.findIndex(compare);
    if(index > -1) {
        arr.splice(index, 1);
    }
}

//删除搜索历史中的数据
export function deleteSearch(query) {
    //如果没有数据的时候，定义是一个空数组
    let searches = storage.get(SEARCH_KEY, []);
    deleteFromArray(searches, (item) => {
        return item === query;
    })
    storage.set(SEARCH_KEY, searches);
    return searches;
}

//删除搜索历史中的所有数据
export function clearSearch() {
    storage.remove(SEARCH_KEY);
    return [];
}