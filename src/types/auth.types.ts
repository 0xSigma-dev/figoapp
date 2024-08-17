export interface RegisterType{
    displayName : string,
    username : string,
    publicKey : string,
    referred_by?: string
}

export interface LoginType{
    username : string,
    publickKey : string
}