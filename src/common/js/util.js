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

//实现截流函数
//传进一个需要截流的函数，返回一个新的函数，这个新的函数去用定时器截流
//如果反复的调用func就会通过定时器让他不能频繁地执行
export function debounce(func, delay) {
    let timer;

    return function (...args) {
        if(timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(() => {
            func.apply(this, args);
        }, delay)
    }
}