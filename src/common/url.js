let testroot="http://localhost:3100";
let testrealroot="http://localhost:3100";
testrealroot = "http://wh.cloudmtm.com:5555";
// testrealroot = "http://192.168.88.14";
// testrealroot = 'http://172.31.101.197';
// testrealroot = 'http://172.20.21.101';
// testrealroot = 'http://192.168.100.236';

export let root = window.root===undefined ? testroot:window.root;
export let realroot = window.realroot===undefined? testrealroot:window.realroot;

export let BPre = "/paas-base";
export let MPre = "/paas-wms-material";
export let FPre = "/mes-fac";
// FPre = '/fac';

export const commonUrl = {
    menu: `${realroot}${BPre}/base/menu?type=web`,
    imageFile: {
        update: `${realroot}${BPre}/base/image/update`
    },
    docFile: {
        update: `${realroot}${BPre}/base/file/update`
    }
};
export const proofingApplicationUrl = {
    changeNum: `${realroot}/pdm/pdm/syn/queryPlanEndDate`
};
export const myCalendarUrl = {
    selectArr: `${realroot}/pdm/pdm/syn/queryDate`,
    seletDate: `${realroot}/pdm/pdm/syn/getData`
};

export const labUrl = {
    // getBedNo:`http://localhost:3100/fac/ddd`,
    getBedNo: `${realroot}${FPre}/fac/pc/tailor06/findcucot`,
    getDetail: `${realroot}${FPre}/fac/pc/tailor06/lyDetiles`,
    saveBed: `${realroot}${FPre}/fac/pc/tailor06/saveLyhead`,
    // getSize:`http://localhost:3100/fac/ccc`,
    selectSize: `${realroot}${FPre}/fac/pc/tailor06/sizeSelect`,
    typeArr: `${realroot}${FPre}/fac/pc/tailor06/mttypeSelect`,
    colorArr: `${realroot}${FPre}/fac/pc/tailor06/clotypeSelect`,
    partsArr: `${realroot}${FPre}/fac/pc/tailor06/lyPrint`,
    savePrint: `${realroot}${FPre}/fac/pc/tailor06/bfPrint`,
    saveLydetils: `${realroot}${FPre}/fac/pc/tailor06/saveLydetils`
};
export const loginUrl = {
    logo: `${realroot}${BPre}/base/com/logo`,
    companyName: `${realroot}${BPre}/base/com/name`,
    signin: `${realroot}${BPre}/base/user/login`,
    signout: `${realroot}${BPre}/base/user/logout`,
    updatePassWord:`${realroot}${BPre}/base/user/password/update`,
    validation: `${realroot}${BPre}/base/captcha`
};