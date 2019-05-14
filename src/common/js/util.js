//拿到min到max的随机数
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

//洗牌方法 把传进来的arr完全打乱
export function shuffle(arr) {
    // 创建arr的副本，防止把arr原本的修改了
    let _arr = arr.slice();
    for(let i=0;i<_arr.length;i++) {
        let j = getRandomInt(0, i);
        let t = _arr[i];
        _arr[i] = _arr[j];
        _arr[j] = t;

    }
    return _arr;
}