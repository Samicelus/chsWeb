export function setExpire(key,value, expire){
    let obj = {
        data: value,
        time: Date.now(),
        expire: expire
    };
    localStorage.setItem(key, JSON.stringify(obj));
}

export function setUnlimit(key, value){
    let obj = {
        data: value,
        time: Date.now(),
        expire: 365*24*60*60*1000
    };
    localStorage.setItem(key, JSON.stringify(obj));
}

export function getExpire(key){
    let val = localStorage.getItem(key);
    if (!val) {
        return val;
    }
    val = JSON.parse(val);
    if (Date.now() - val.time > val.expire) {
        localStorage.removeItem(key);
        return null;
    }
    return val.data;
}

export function clearInfo(key){
    localStorage.removeItem(key);
}