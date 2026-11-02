export type User={id:number;name:string;email:string;role:string};
export function saveAuth(token:string,user:User){localStorage.setItem('lumiere_token',token);localStorage.setItem('lumiere_user',JSON.stringify(user));}
export function getUser():User|null{try{return JSON.parse(localStorage.getItem('lumiere_user')||'null')}catch{return null}}
export function logout(){localStorage.removeItem('lumiere_token');localStorage.removeItem('lumiere_user');window.location.href='/';}
