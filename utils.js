export function sleep(ms) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {resolve();}, ms);
    });
}

export function getDateInDDMMYYYY (date) {
	return `${date.getDate()+1<10?"0":""}${date.getDate()}`+"-"+ `${date.getMonth()+1<10?"0":""}${date.getMonth()+1}`+"-"+ date.getFullYear()
}